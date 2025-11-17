import React, { useState, useMemo, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import type { ClientSubscription, Client, Plan } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AddSubscriptionModal } from '../../components/dashboard/AddSubscriptionModal';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';

const getStatusBadge = (status: 'active' | 'paused' | 'cancelled') => {
    const styles = {
        active: 'bg-green-500/20 text-green-300',
        paused: 'bg-yellow-500/20 text-yellow-300',
        cancelled: 'bg-red-500/20 text-red-300',
    };
    const text = {
        active: 'Ativa',
        paused: 'Pausada',
        cancelled: 'Cancelada',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{text[status]}</span>;
};

export const SubscriptionsPage: React.FC = () => {
    const { negocio, plans, subscriptions, isLoading: isAppDataLoading, addSubscription, updateSubscription, deleteSubscription } = useAppData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);

    React.useEffect(() => {
        const fetchClients = async () => {
            if (!negocio) return;
            const { data } = await supabase.from('clients').select('*').eq('barbershop_id', negocio.id).order('name');
            setClients(mapFromSupabase<Client[]>(data || []));
            setIsLoadingClients(false);
        };
        fetchClients();
    }, [negocio]);

    const fullSubscriptions = useMemo(() => {
        return subscriptions.map(sub => {
            const client = clients.find(c => c.id === sub.clientId);
            const plan = plans.find(p => p.id === sub.planId);
            return { ...sub, clientName: client?.name, planName: plan?.name, planPrice: plan?.price };
        }).sort((a,b) => (a.clientName || '').localeCompare(b.clientName || ''));
    }, [subscriptions, clients, plans]);

    const createTransactionFromSubscription = async (subscription: ClientSubscription, newSubId: string) => {
        const plan = plans.find(p => p.id === subscription.planId);
        const client = clients.find(c => c.id === subscription.clientId);
        if (!plan || !plan.price || !client || !negocio || !subscription.startDate) return;

        const transactionData = {
            barbershop_id: negocio.id,
            type: 'revenue',
            amount: plan.price,
            description: `Plano: ${plan.name} - Cliente: ${client.name}`,
            date: subscription.startDate.toISOString(),
            source_type: 'subscription',
            source_id: newSubId,
            client_id: subscription.clientId,
            professional_id: plan.professionalId || null,
        };
        
        const { error } = await supabase.from('transactions').insert(transactionData);
        if (error) console.error("Failed to create transaction for subscription:", error);
    };

    const handleAddSubscription = async (data: Omit<ClientSubscription, 'id' | 'status'>) => {
        const newSubscription = await addSubscription(data);
        if (newSubscription) {
            // Fix: Pass the complete newSubscription object instead of the partial 'data' object to satisfy the function's type requirement.
            await createTransactionFromSubscription(newSubscription, newSubscription.id);
        }
        setIsModalOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta assinatura? Os registros financeiros associados a ela serão mantidos.')) {
            await deleteSubscription(id);
        }
    };
    
    const isLoading = isAppDataLoading || isLoadingClients;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Gerenciar Assinaturas</h2>
                <Button onClick={() => setIsModalOpen(true)}>Adicionar Assinatura</Button>
            </div>

            <Card>
                <h3 className="text-xl font-semibold mb-4">Lista de Assinaturas</h3>
                <div className="overflow-x-auto">
                    {isLoading ? <p>Carregando assinaturas...</p> : (
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="p-3">Cliente</th>
                                    <th className="p-3">Plano</th>
                                    <th className="p-3">Valor</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Data de Início</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fullSubscriptions.map(sub => (
                                    <tr key={sub.id} className="border-b border-gray-800">
                                        <td className="p-3">{sub.clientName || 'Cliente não encontrado'}</td>
                                        <td className="p-3">{sub.planName || 'Plano não encontrado'}</td>
                                        <td className="p-3">R$ {(sub.planPrice || 0).toFixed(2)}</td>
                                        <td className="p-3">{getStatusBadge(sub.status)}</td>
                                        <td className="p-3">{sub.startDate ? new Date(sub.startDate).toLocaleDateString('pt-BR') : '-'}</td>
                                        <td className="p-3 text-right">
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(sub.id)}>Excluir</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>
            
            {isModalOpen && (
                <AddSubscriptionModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleAddSubscription}
                    clients={clients}
                    plans={plans}
                />
            )}
        </div>
    );
};