
import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TrashIcon, EditIcon, UsersIcon } from '../../lib/icons';
import type { Client, Appointment, Service, ClientSubscription } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';
import { DollarSignIcon, TrendingUpIcon, CalendarIcon } from '../../lib/icons';

// --- MODAL PARA ADICIONAR/EDITAR CLIENTE ---
interface ClientModalProps {
    client: Client | null;
    onClose: () => void;
    onSave: (clientData: Omit<Client, 'id' | 'negocioId'>, id?: string) => Promise<void>;
}

const ClientModal: React.FC<ClientModalProps> = ({ client, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [errors, setErrors] = useState<{ name?: string; phone?: string; }>({});

    useEffect(() => {
        if (client) {
            setName(client.name || '');
            setPhone(client.phone || '');
            setEmail(client.email || '');
            setBirthDate(client.birthDate ? new Date(client.birthDate).toISOString().split('T')[0] : '');
        } else {
            setName(''); setPhone(''); setEmail(''); setBirthDate('');
        }
    }, [client]);

    const validate = (): boolean => {
        const newErrors: { name?: string; phone?: string; } = {};
        if (!name.trim()) newErrors.name = 'Nome é obrigatório.';
        if (!phone.trim()) newErrors.phone = 'Telefone é obrigatório.';
        else if (!/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Formato inválido.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        const birthDateObj = birthDate ? new Date(`${birthDate}T00:00:00`) : undefined;
        onSave({ name, phone, email: email || undefined, birthDate: birthDateObj }, client?.id);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-white">{client ? 'Editar Cliente' : 'Novo Cliente'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nome Completo" id="name" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
                    <Input label="Telefone" id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} error={errors.phone} />
                    <Input label="Email (Opcional)" id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                    <Input label="Data de Nasc. (Opcional)" id="birthDate" type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} />
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- CARD DE ESTATÍSTICA ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; prefix?: string }> = ({ icon, title, value, prefix }) => (
    <Card className="p-4">
        <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="text-gray-500">{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white mt-2">
            {prefix && <span className="text-xl mr-1">{prefix}</span>}
            {value}
        </p>
    </Card>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export const ClientsPage: React.FC = () => {
    const { negocio, subscriptions } = useAppData();
    const [clients, setClients] = useState<Client[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterActiveSubscription, setFilterActiveSubscription] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!negocio) return;
            setIsLoading(true);
            const [clientsRes, apptsRes, servicesRes] = await Promise.all([
                supabase.from('clients').select('*').eq('barbershop_id', negocio.id),
                supabase.from('appointments').select('*').eq('barbershop_id', negocio.id),
                supabase.from('services').select('*').eq('barbershop_id', negocio.id)
            ]);
            if(clientsRes.data) setClients(mapFromSupabase<Client[]>(clientsRes.data));
            if(apptsRes.data) setAppointments(mapFromSupabase<Appointment[]>(apptsRes.data));
            if(servicesRes.data) setServices(mapFromSupabase<Service[]>(servicesRes.data));
            setIsLoading(false);
        };
        // Fix: Corrected function call from fetchClients to fetchData.
        fetchData();
    }, [negocio]);

    const stats = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = clients.filter(c => c.createdAt && new Date(c.createdAt) >= startOfMonth).length;
        const clientIdsWithAppointments = new Set(appointments.map(a => a.clientId));
        const totalRevenue = appointments
            .filter(a => a.status === 'completed')
            .reduce((sum, app) => sum + (services.find(s => s.id === app.serviceId)?.price || 0), 0);
        return {
            totalClients: clients.length,
            newThisMonth,
            withAppointments: clientIdsWithAppointments.size,
            totalRevenue,
        };
    }, [clients, appointments, services]);

    const processedClients = useMemo(() => {
        const appointmentsByClientId = new Map<string, Appointment[]>();
        appointments.forEach(app => {
            const clientApps = appointmentsByClientId.get(app.clientId) || [];
            clientApps.push(app);
            appointmentsByClientId.set(app.clientId, clientApps);
        });
        const servicePriceMap = new Map<string, number>(services.map(s => [s.id, s.price || 0]));
        const activeSubscriptionsClientIds = new Set(subscriptions.filter(s => s.status === 'active').map(s => s.clientId));

        return clients.map(client => {
            const clientAppointments = appointmentsByClientId.get(client.id) || [];
            const completedAppointments = clientAppointments.filter(a => a.status === 'completed' && a.startTime).sort((a,b) => b.startTime!.getTime() - a.startTime!.getTime());
            const totalSpent = completedAppointments.reduce((sum, app) => sum + (servicePriceMap.get(app.serviceId) || 0), 0);
            const lastVisit = completedAppointments.length > 0 ? completedAppointments[0].startTime : null;

            let status: 'Ativo' | 'Inativo' | 'Novo' = 'Novo';
            if (lastVisit) {
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
                status = lastVisit > ninetyDaysAgo ? 'Ativo' : 'Inativo';
            } else if (client.createdAt) {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                if (new Date(client.createdAt) < thirtyDaysAgo) status = 'Inativo';
            } else {
                status = clientAppointments.length > 0 ? 'Inativo' : 'Novo';
            }

            return { ...client, totalAppointments: clientAppointments.length, totalSpent, lastVisit, status, hasActiveSubscription: activeSubscriptionsClientIds.has(client.id) };
        });
    }, [clients, appointments, services, subscriptions]);

    const filteredClients = useMemo(() => {
        return processedClients
            .filter(client => {
                const searchLower = searchQuery.toLowerCase();
                const nameMatch = client.name?.toLowerCase().includes(searchLower);
                const phoneMatch = client.phone?.includes(searchQuery);
                const subMatch = !filterActiveSubscription || client.hasActiveSubscription;
                return (nameMatch || phoneMatch) && subMatch;
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [processedClients, searchQuery, filterActiveSubscription]);

    const handleSaveClient = async (clientData: Omit<Client, 'id' | 'negocioId'>, id?: string) => {
        if (!negocio) return;
        if (id) { // Update
            const { data: updatedClient, error } = await supabase.from('clients').update(mapToSupabase(clientData)).eq('id', id).select().single();
            if (updatedClient && !error) setClients(clients.map(c => c.id === id ? mapFromSupabase<Client>(updatedClient) : c));
        } else { // Create
            const { data: newClient, error } = await supabase.from('clients').insert({ ...mapToSupabase(clientData), barbershop_id: negocio.id }).select().single();
            if (newClient && !error) setClients([...clients, mapFromSupabase<Client>(newClient)]);
        }
        setIsModalOpen(false);
        setEditingClient(null);
    };

    const handleDeleteClient = async (id: string) => {
        if(window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (!error) setClients(clients.filter(c => c.id !== id));
        }
    };

    const getStatusBadge = (status: 'Ativo' | 'Inativo' | 'Novo') => {
        const styles = { Ativo: 'bg-green-500/20 text-green-300', Inativo: 'bg-gray-500/20 text-gray-300', Novo: 'bg-blue-500/20 text-blue-300' };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
    };
    
    if (isLoading) return <p>Carregando clientes...</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Clientes</h2>
                    <p className="text-gray-400">Gerencie sua base de clientes</p>
                </div>
                <Button onClick={() => { setEditingClient(null); setIsModalOpen(true); }}>Novo Cliente</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UsersIcon className="h-6 w-6"/>} title="Total de Clientes" value={stats.totalClients} />
                <StatCard icon={<UsersIcon className="h-6 w-6"/>} title="Novos este Mês" value={stats.newThisMonth} />
                <StatCard icon={<CalendarIcon className="h-6 w-6"/>} title="Com Agendamentos" value={stats.withAppointments} />
                <StatCard icon={<DollarSignIcon className="h-6 w-6"/>} title="Faturamento Total" value={stats.totalRevenue.toFixed(2)} prefix="R$"/>
            </div>

            <Card>
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input label="" id="search" placeholder="Buscar clientes por nome ou telefone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-grow"/>
                    <div className="flex items-center pt-5">
                        <input type="checkbox" id="filter-sub" className="h-4 w-4 rounded text-brand-gold focus:ring-brand-gold" checked={filterActiveSubscription} onChange={e => setFilterActiveSubscription(e.target.checked)} />
                        <label htmlFor="filter-sub" className="ml-2 text-sm text-gray-300">Com assinatura/pacote ativo</label>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3">Cliente</th><th className="p-3">Contato</th><th className="p-3">Status</th>
                                <th className="p-3">Agendamentos</th><th className="p-3">Total Gasto</th>
                                <th className="p-3">Última Visita</th><th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length > 0 ? filteredClients.map(client => (
                                <tr key={client.id} className="border-b border-gray-800">
                                    <td className="p-3 font-medium">{client.name}</td>
                                    <td className="p-3">{client.phone}</td>
                                    <td className="p-3">{getStatusBadge(client.status)}</td>
                                    <td className="p-3 text-center">{client.totalAppointments}</td>
                                    <td className="p-3">R$ {client.totalSpent.toFixed(2)}</td>
                                    <td className="p-3">{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('pt-BR') : 'Nenhuma'}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => { setEditingClient(client); setIsModalOpen(true); }} title="Editar"><EditIcon className="h-5 w-5 text-gray-400 hover:text-white" /></button>
                                            <button onClick={() => handleDeleteClient(client.id)} title="Excluir"><TrashIcon className="h-5 w-5 text-red-500 hover:text-red-400" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-10 text-gray-500">
                                        <p>Nenhum cliente encontrado.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {clients.length === 0 && !isLoading && (
                 <Card className="text-center py-10">
                    <h3 className="font-semibold text-white">Nenhum cliente cadastrado</h3>
                    <p className="text-gray-500 text-sm mb-4">Comece adicionando seu primeiro cliente</p>
                    <Button onClick={() => { setEditingClient(null); setIsModalOpen(true); }}>Adicionar Cliente</Button>
                </Card>
            )}

            {isModalOpen && <ClientModal client={editingClient} onClose={() => setIsModalOpen(false)} onSave={handleSaveClient} />}
        </div>
    );
};