import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../lib/mappers';
import { generateSlug } from '../lib/utils';
import type { Negocio, Plan, ClientSubscription } from '../types';

interface AppDataContextValue {
    user: User | null;
    negocio: Negocio | null;
    plans: Plan[];
    subscriptions: ClientSubscription[];
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ error: any }>;
    logout: () => Promise<void>;
    signUp: (negocioName: string, email: string, password: string, honeypot: string) => Promise<{ error: any }>;
    updateNegocio: (data: Partial<Negocio>) => Promise<Negocio | null>;
    addSubscription: (data: Omit<ClientSubscription, 'id' | 'status'>) => Promise<ClientSubscription | null>;
    updateSubscription: (id: string, data: Partial<Pick<ClientSubscription, 'status'>>) => Promise<ClientSubscription | null>;
    deleteSubscription: (id: string) => Promise<boolean>;
}

export const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<ClientSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const createDefaultTransactionCategories = async (negocioId: string) => {
        const defaultCategories = [
            { name: 'Aluguel', barbershop_id: negocioId, type: 'expense' },
            { name: 'Marketing', barbershop_id: negocioId, type: 'expense' },
            { name: 'Produtos', barbershop_id: negocioId, type: 'expense' },
            { name: 'Salários', barbershop_id: negocioId, type: 'expense' },
            { name: 'Outras Despesas', barbershop_id: negocioId, type: 'expense' },
            { name: 'Venda de Produtos', barbershop_id: negocioId, type: 'revenue' },
            { name: 'Outras Receitas', barbershop_id: negocioId, type: 'revenue' },
        ];
        const { error } = await supabase.from('transaction_categories').insert(defaultCategories);
        if (error) {
            console.error("Failed to create default transaction categories:", error);
        }
    };
    
    const handleUserSession = async (currentUser: User | null) => {
        setIsLoading(true);
        try {
            if (!currentUser) {
                setUser(null);
                setNegocio(null);
                setPlans([]);
                setSubscriptions([]);
                return;
            }

            const { data, error } = await supabase.from('barbershops').select('*').eq('owner_id', currentUser.id).single();
            if (error && error.code !== 'PGRST116') throw error;
            
            let negocioData = data;
            if (!negocioData) {
                const negocioName = currentUser.email!;
                const plan = currentUser.email === 'admin@admin.com' ? 'premium' : 'basic';
                const initialLetter = negocioName.charAt(0).toUpperCase();
                
                const { data: newNegocio, error: insertError } = await supabase
                    .from('barbershops')
                    .insert({
                        owner_id: currentUser.id, name: negocioName, slug: generateSlug(negocioName),
                        logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(initialLetter)}&background=D4AF37&color=1C1C1E&size=256`,
                        status: 'active', plan: plan,
                    })
                    .select().single();

                if (insertError) throw insertError;
                
                negocioData = newNegocio;
                if(negocioData) await createDefaultTransactionCategories(negocioData.id);
            }

            if (!negocioData) throw new Error("Could not fetch or create business for user.");

            const currentNegocio = mapFromSupabase<Negocio>(negocioData);
            
            const [plansRes, clientsRes] = await Promise.all([
                supabase.from('plans').select('*').eq('barbershop_id', currentNegocio.id),
                supabase.from('clients').select('id').eq('barbershop_id', currentNegocio.id)
            ]);
            
            const clientIds = (clientsRes.data || []).map(c => c.id);
            let subsData: any[] = [];
            if (clientIds.length > 0) {
                const { data } = await supabase.from('client_subscriptions').select('*').in('client_id', clientIds);
                subsData = data || [];
            }

            setUser(currentUser);
            setNegocio(currentNegocio);
            setPlans(mapFromSupabase<Plan[]>(plansRes.data || []));
            setSubscriptions(mapFromSupabase<ClientSubscription[]>(subsData));

        } catch (e) {
            console.error("Error handling user session:", e);
            setUser(null); setNegocio(null); setPlans([]); setSubscriptions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === 'INITIAL_SESSION' ||
          event === 'SIGNED_IN' ||
          event === 'SIGNED_OUT' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          handleUserSession(session?.user ?? null);
        }
      },
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
  };

  const logout = async () => {
      await supabase.auth.signOut();
  };
  
  const signUp = async (negocioName: string, email: string, password: string, honeypot: string) => {
      if (honeypot) return { error: { message: 'Bot detected' } };
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error };
      if (data.user) {
          const { data: newNegocio, error: barbershopError } = await supabase.from('barbershops').insert({
              owner_id: data.user.id, name: negocioName, slug: generateSlug(negocioName),
              logo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(negocioName)}&background=D4AF37&color=1C1C1E&size=256`,
              status: 'inactive', plan: 'basic',
          }).select().single();
          if (barbershopError) return { error: barbershopError };
          // The createDefault... function is not available here, but it will be called on first sign-in anyway.
      }
      return { error: null };
  };

  const updateNegocio = async (data: Partial<Negocio>): Promise<Negocio | null> => {
      if (!negocio) throw new Error('Negócio não encontrado.');

      const updatePayload = { ...data };

      // Se o nome está sendo alterado, gere e verifique o novo slug.
      if (data.name && data.name !== negocio.name) {
          const newSlug = generateSlug(data.name);
          updatePayload.slug = newSlug;

          // Verifique se o slug já existe para outro negócio
          const { data: existing, error: checkError } = await supabase
              .from('barbershops')
              .select('id')
              .eq('slug', newSlug)
              .not('id', 'eq', negocio.id) // Excluir o negócio atual
              .limit(1)
              .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = nenhuma linha encontrada
              console.error("Error checking slug uniqueness:", checkError);
              throw new Error('Erro ao verificar o nome do negócio.');
          }

          if (existing) {
              const conflictError = new Error('Este nome de negócio já está em uso. Por favor, escolha outro.');
              conflictError.name = 'ConflictError'; // Nome de erro personalizado para identificá-lo
              throw conflictError;
          }
      }
      
      const { data: updatedData, error } = await supabase
          .from('barbershops')
          .update(mapToSupabase(updatePayload))
          .eq('id', negocio.id)
          .select()
          .single();
          
      if (error) {
          console.error("Error updating negocio:", error);
          throw new Error('Erro ao salvar as alterações.');
      }

      if (updatedData) {
          const mapped = mapFromSupabase<Negocio>(updatedData);
          setNegocio(mapped);
          return mapped;
      }

      return null;
  };

  const addSubscription = async (data: Omit<ClientSubscription, 'id' | 'status'>): Promise<ClientSubscription | null> => {
    const { data: newSub, error } = await supabase
        .from('client_subscriptions')
        .insert({ ...mapToSupabase(data), status: 'active' })
        .select().single();
    if (newSub && !error) {
        const mapped = mapFromSupabase<ClientSubscription>(newSub);
        setSubscriptions(prev => [...prev, mapped]);
        return mapped;
    }
    console.error("Error adding subscription:", error);
    alert(`Erro ao adicionar assinatura: ${error?.message}\n\nDetalhes: ${error?.details}\n\nIsso geralmente indica um problema na configuração do banco de dados (tabelas ou políticas de segurança). Por favor, execute o script no arquivo 'schema.sql' no seu editor SQL do Supabase para corrigir.`);
    return null;
  };
  
  const updateSubscription = async (id: string, data: Partial<Pick<ClientSubscription, 'status'>>): Promise<ClientSubscription | null> => {
    const { data: updatedSub, error } = await supabase
        .from('client_subscriptions')
        .update(mapToSupabase(data))
        .eq('id', id)
        .select().single();
    if (updatedSub && !error) {
        const mapped = mapFromSupabase<ClientSubscription>(updatedSub);
        setSubscriptions(prev => prev.map(s => s.id === id ? mapped : s));
        return mapped;
    }
    console.error("Error updating subscription:", error);
    alert(`Erro ao atualizar assinatura: ${error?.message || 'Erro desconhecido.'}`);
    return null;
  };

  const deleteSubscription = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('client_subscriptions').delete().eq('id', id);
    if (!error) {
        setSubscriptions(prev => prev.filter(s => s.id !== id));
        return true;
    }
    console.error("Error deleting subscription:", error);
    alert(`Erro ao excluir assinatura: ${error?.message || 'Erro desconhecido.'}`);
    return false;
  };

  const value: AppDataContextValue = {
    user, negocio, plans, subscriptions, isLoading,
    login, logout, signUp, updateNegocio,
    addSubscription, updateSubscription, deleteSubscription,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};
