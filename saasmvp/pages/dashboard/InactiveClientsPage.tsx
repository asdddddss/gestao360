import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import type { Client, Appointment, Service } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';
import { DollarSignIcon, TrendingUpIcon, UsersIcon, MessageSquareIcon } from '../../lib/icons';

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

export const InactiveClientsPage: React.FC = () => {
    const { negocio } = useAppData();
    const [clients, setClients] = useState<Client[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedClients, setSelectedClients] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [inactiveDaysFilter, setInactiveDaysFilter] = useState<number>(15);

    useEffect(() => {
        const fetchData = async () => {
            if (!negocio) return;
            setIsLoading(true);
            const [clientsRes, apptsRes, servicesRes] = await Promise.all([
                supabase.from('clients').select('*').eq('barbershop_id', negocio.id),
                supabase.from('appointments').select('*').eq('barbershop_id', negocio.id),
                supabase.from('services').select('*').eq('barbershop_id', negocio.id)
            ]);
            if (clientsRes.data) setClients(mapFromSupabase<Client[]>(clientsRes.data));
            if (apptsRes.data) setAppointments(mapFromSupabase<Appointment[]>(apptsRes.data));
            if (servicesRes.data) setServices(mapFromSupabase<Service[]>(servicesRes.data));
            setIsLoading(false);
        };
        fetchData();
    }, [negocio]);

    const processedClients = useMemo(() => {
        const appointmentsByClientId = new Map<string, Appointment[]>();
        appointments.forEach(app => {
            const clientApps = appointmentsByClientId.get(app.clientId) || [];
            clientApps.push(app);
            appointmentsByClientId.set(app.clientId, clientApps);
        });
        const servicePriceMap = new Map<string, number>(services.map(s => [s.id, s.price || 0]));

        return clients.map(client => {
            const clientAppointments = appointmentsByClientId.get(client.id) || [];
            const completedAppointments = clientAppointments.filter(a => a.status === 'completed' && a.startTime).sort((a,b) => b.startTime!.getTime() - a.startTime!.getTime());
            const totalSpent = completedAppointments.reduce((sum, app) => sum + (servicePriceMap.get(app.serviceId) || 0), 0);
            const lastVisit = completedAppointments.length > 0 ? completedAppointments[0].startTime : null;
            const ticketMedio = completedAppointments.length > 0 ? totalSpent / completedAppointments.length : 0;
            return { ...client, totalSpent, lastVisit, ticketMedio };
        });
    }, [clients, appointments, services]);

    const inactiveClients = useMemo(() => {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - inactiveDaysFilter);

        return processedClients.filter(client => {
            const isInactive = !client.lastVisit || new Date(client.lastVisit) < thresholdDate;
            const searchLower = searchQuery.toLowerCase();
            const nameMatch = client.name?.toLowerCase().includes(searchLower);
            const phoneMatch = client.phone?.includes(searchQuery);
            return isInactive && (nameMatch || phoneMatch);
        });
    }, [processedClients, inactiveDaysFilter, searchQuery]);

    const stats = useMemo(() => ({
        totalInactive: inactiveClients.length,
        potentialRevenue: inactiveClients.reduce((sum, c) => sum + c.ticketMedio, 0),
    }), [inactiveClients]);

    const handleSelectClient = (clientId: string) => {
        setSelectedClients(prev =>
            prev.includes(clientId)
                ? prev.filter(id => id !== clientId)
                : [...prev, clientId]
        );
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedClients(inactiveClients.map(c => c.id));
        } else {
            setSelectedClients([]);
        }
    }

    if (isLoading) return <p>Carregando clientes...</p>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Clientes Inativos</h2>
                    <p className="text-gray-400">Reative clientes com ofertas personalizadas</p>
                </div>
                <Button disabled={selectedClients.length === 0} onClick={() => alert(`Enviar promoção para ${selectedClients.length} cliente(s). Funcionalidade em breve!`)}>
                    Enviar Promoção ({selectedClients.length})
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UsersIcon className="h-6 w-6"/>} title="Total Inativos" value={stats.totalInactive} />
                <StatCard icon={<MessageSquareIcon className="h-6 w-6"/>} title="Promoções Enviadas" value={0} />
                <StatCard icon={<TrendingUpIcon className="h-6 w-6"/>} title="Taxa de Retorno" value="0%" />
                <StatCard icon={<DollarSignIcon className="h-6 w-6"/>} title="Receita Potencial" value={stats.potentialRevenue.toFixed(2)} prefix="R$"/>
            </div>
            
            <Card>
                 <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <Input label="" id="search" placeholder="Buscar cliente..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-grow"/>
                    <div className="w-full md:w-64">
                        <Select label="" id="inactive-filter" value={inactiveDaysFilter} onChange={e => setInactiveDaysFilter(Number(e.target.value))}>
                            <option value={15}>Inativos há 15+ dias</option>
                            <option value={30}>Inativos há 30+ dias</option>
                            <option value={60}>Inativos há 60+ dias</option>
                            <option value={90}>Inativos há 90+ dias</option>
                        </Select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} className="rounded text-brand-gold focus:ring-brand-gold" /></th>
                                <th className="p-3">Cliente</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Última Visita</th>
                                <th className="p-3">Total Gasto</th>
                                <th className="p-3">Ticket Médio</th>
                            </tr>
                        </thead>
                        <tbody>
                           {inactiveClients.length > 0 ? inactiveClients.map(client => (
                               <tr key={client.id} className="border-b border-gray-800">
                                   <td className="p-3"><input type="checkbox" checked={selectedClients.includes(client.id)} onChange={() => handleSelectClient(client.id)} className="rounded text-brand-gold focus:ring-brand-gold"/></td>
                                   <td className="p-3 font-medium">{client.name}<br/><span className="text-sm text-gray-400">{client.phone}</span></td>
                                   <td className="p-3"><span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-300">Inativo</span></td>
                                   <td className="p-3">{client.lastVisit ? new Date(client.lastVisit).toLocaleDateString('pt-BR') : 'Nenhuma'}</td>
                                   <td className="p-3">R$ {client.totalSpent.toFixed(2)}</td>
                                   <td className="p-3">R$ {client.ticketMedio.toFixed(2)}</td>
                               </tr>
                           )) : (
                               <tr>
                                   <td colSpan={6} className="text-center py-10 text-gray-500">
                                        <h4 className="font-semibold text-lg text-white">Nenhum cliente inativo encontrado</h4>
                                        <p>Todos os seus clientes estão ativos e engajados! 🎉</p>
                                   </td>
                               </tr>
                           )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};