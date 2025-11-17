import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';
import type { Negocio } from '../../types';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { RefreshCwIcon } from '../../lib/icons';

export const AdminDashboardPage: React.FC = () => {
    const [businesses, setBusinesses] = useState<Negocio[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBusinesses = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all businesses. For this to work for an admin,
            // RLS policies on the 'barbershops' table must allow it.
            const { data, error: selectError } = await supabase
                .from('barbershops')
                .select('*')
                .order('name');

            if (selectError) {
                throw selectError;
            }

            setBusinesses(data.map(b => mapFromSupabase<Negocio>(b)));

        } catch (e: any) {
            console.error("Error fetching businesses:", e);
            setError("Falha ao carregar os negócios. Verifique as Políticas de Segurança de Linha (RLS) da tabela 'barbershops' no seu painel Supabase. O usuário admin precisa de permissão para visualizar todos os registros.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBusinesses();
    }, [fetchBusinesses]);
    
    const handleUpdate = async (id: string, updateData: Partial<Pick<Negocio, 'plan' | 'status'>>) => {
        const { error } = await supabase
            .from('barbershops')
            .update(updateData)
            .eq('id', id);
        
        if (error) {
            alert('Falha ao atualizar o negócio.');
        } else {
            // Update local state for immediate feedback
            setBusinesses(prev => prev.map(b => b.id === id ? { ...b, ...updateData } : b));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Painel de Administração</h2>
                <button onClick={fetchBusinesses} disabled={isLoading} className="p-2 rounded-full hover:bg-brand-dark-2 transition-colors disabled:opacity-50">
                    <RefreshCwIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <Card>
                <h3 className="text-xl font-semibold mb-4">Gerenciar Contas</h3>
                {isLoading && <p>Carregando contas...</p>}
                {error && <p className="text-red-500">{error}</p>}
                
                {!isLoading && !error && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="p-3">Nome do Negócio</th>
                                    <th className="p-3">Plano</th>
                                    <th className="p-3">Status da Conta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {businesses.map(business => (
                                    <tr key={business.id} className="border-b border-gray-800">
                                        <td className="p-3 font-medium">{business.name}</td>
                                        <td className="p-3">
                                            <Select
                                                id={`plan-${business.id}`}
                                                label=""
                                                value={business.plan}
                                                onChange={(e) => handleUpdate(business.id, { plan: e.target.value as 'basic' | 'premium' })}
                                                className="py-1"
                                            >
                                                <option value="basic">Básico</option>
                                                <option value="premium">Premium</option>
                                            </Select>
                                        </td>
                                        <td className="p-3">
                                            <Select
                                                id={`status-${business.id}`}
                                                label=""
                                                value={business.status}
                                                onChange={(e) => handleUpdate(business.id, { status: e.target.value as 'active' | 'inactive' })}
                                                className="py-1"
                                            >
                                                <option value="active">Ativa</option>
                                                <option value="inactive">Inativa</option>
                                            </Select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};
