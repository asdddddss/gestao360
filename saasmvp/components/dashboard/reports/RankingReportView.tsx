import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { Client, Service, Professional, Appointment, ProductSale } from '../../../types';

type RankingType = 'clients' | 'services' | 'professionals' | 'products';

interface RankingReportViewProps {
    type: RankingType;
    startDate?: Date;
    endDate?: Date;
}

export const RankingReportView: React.FC<RankingReportViewProps> = ({ type, startDate, endDate }) => {
    const { negocio } = useAppData();
    const [data, setData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!negocio || !startDate || !endDate) return;
        setIsLoading(true);

        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);

        if (type === 'products') {
            const { data: salesData } = await supabase
                .from('product_sales')
                .select('*, products(name)')
                .eq('barbershop_id', negocio.id)
                .gte('created_at', start.toISOString())
                .lte('created_at', end.toISOString());

            const sales = mapFromSupabase<any[]>(salesData || []);
            const rankings: { [key: string]: { name: string, revenue: number, count: number } } = {};

            sales.forEach(sale => {
                const name = sale.products?.name || 'Produto Desconhecido';
                const productId = sale.productId;
                if (!rankings[productId]) rankings[productId] = { name, revenue: 0, count: 0 };
                rankings[productId].revenue += sale.salePriceAtTime * sale.quantity;
                rankings[productId].count += sale.quantity;
            });
            setData(Object.values(rankings).sort((a, b) => b.revenue - a.revenue));

        } else {
            const { data: appts } = await supabase
                .from('appointments')
                .select('*')
                .eq('barbershop_id', negocio.id)
                .eq('status', 'completed')
                .gte('start_time', start.toISOString())
                .lte('start_time', end.toISOString());
            
            const appointments = mapFromSupabase<Appointment[]>(appts || []);
            
            const { data: services } = await supabase.from('services').select('id, price').eq('barbershop_id', negocio.id);
            const serviceMap = new Map<string, number>(services?.map(s => [s.id as string, (s.price as number | null) || 0]) ?? []);

            if (type === 'clients') {
                const { data: clientsData } = await supabase.from('clients').select('id, name').eq('barbershop_id', negocio.id);
                const clientMap = new Map<string, string | null>(clientsData?.map(c => [c.id as string, c.name as string | null]) ?? []);
                const rankings: { [key: string]: { name: string, revenue: number, count: number } } = {};
                
                appointments.forEach(a => {
                    const name = clientMap.get(a.clientId) || 'Cliente Desconhecido';
                    if (!rankings[a.clientId]) rankings[a.clientId] = { name, revenue: 0, count: 0 };
                    rankings[a.clientId].revenue += serviceMap.get(a.serviceId) || 0;
                    rankings[a.clientId].count++;
                });
                setData(Object.values(rankings).sort((a, b) => b.revenue - a.revenue));
            }
            else if (type === 'services') {
                const { data: servicesData } = await supabase.from('services').select('id, name').eq('barbershop_id', negocio.id);
                const serviceNameMap = new Map<string, string | null>(servicesData?.map(s => [s.id as string, s.name as string | null]) ?? []);
                const rankings: { [key: string]: { name: string, revenue: number, count: number } } = {};

                appointments.forEach(a => {
                    const name = serviceNameMap.get(a.serviceId) || 'Serviço Desconhecido';
                    if (!rankings[a.serviceId]) rankings[a.serviceId] = { name, revenue: 0, count: 0 };
                    rankings[a.serviceId].revenue += serviceMap.get(a.serviceId) || 0;
                    rankings[a.serviceId].count++;
                });
                setData(Object.values(rankings).sort((a, b) => b.revenue - a.revenue));
            }
            else if (type === 'professionals') {
                const { data: profsData } = await supabase.from('professionals').select('id, name').eq('barbershop_id', negocio.id);
                const profMap = new Map<string, string | null>(profsData?.map(p => [p.id as string, p.name as string | null]) ?? []);
                const rankings: { [key: string]: { name: string, revenue: number, count: number } } = {};

                appointments.forEach(a => {
                    const name = profMap.get(a.professionalId) || 'Profissional Desconhecido';
                    if (!rankings[a.professionalId]) rankings[a.professionalId] = { name, revenue: 0, count: 0 };
                    rankings[a.professionalId].revenue += serviceMap.get(a.serviceId) || 0;
                    rankings[a.professionalId].count++;
                });
                setData(Object.values(rankings).sort((a, b) => b.revenue - a.revenue));
            }
        }
        setIsLoading(false);
    }, [negocio, startDate, endDate, type]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const titleMap: Record<RankingType, string> = {
        clients: 'Cliente',
        services: 'Serviço',
        professionals: 'Profissional',
        products: 'Produto'
    };

    const countTitleMap: Record<RankingType, string> = {
        clients: 'Nº de Agendamentos',
        services: 'Nº de Agendamentos',
        professionals: 'Nº de Agendamentos',
        products: 'Quantidade Vendida'
    };
    
    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">Pos.</th>
                            <th className="p-3">{titleMap[type]}</th>
                            <th className="p-3 text-right">Receita Gerada</th>
                            <th className="p-3 text-right">{countTitleMap[type]}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center">Carregando dados...</td></tr>
                        ) : data.length > 0 ? data.map((item, index) => (
                            <tr key={index} className="border-b border-gray-800">
                                <td className="p-3 font-bold">{index + 1}</td>
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-right font-semibold text-green-400">R$ {item.revenue.toFixed(2)}</td>
                                <td className="p-3 text-right">{item.count}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum dado encontrado para o período.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};