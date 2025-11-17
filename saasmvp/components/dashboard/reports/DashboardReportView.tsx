import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { DollarSignIcon, TrendingUpIcon, CalendarIcon, ArchiveIcon } from '../../../lib/icons';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { Appointment, Transaction, ProductSale } from '../../../types';

const KPIStatCard: React.FC<{ symbol: string; title: string; value: string; comparison: string; }> = ({ symbol, title, value, comparison }) => (
    <Card className="p-4 relative">
        <div className="absolute top-4 right-4 text-gray-500 font-semibold text-lg">{symbol}</div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-2">{comparison}</p>
    </Card>
);

const DailyStatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <div className="bg-brand-dark p-4 rounded-lg text-center flex flex-col justify-center items-center h-full">
        <div className="text-gray-400 mb-2">{icon}</div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
);

const InfoCard: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; }> = ({ title, subtitle, children }) => (
    <Card className="flex flex-col">
        <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
        {children}
    </Card>
);

export const DashboardReportView: React.FC<{ startDate?: Date, endDate?: Date}> = ({ startDate: initialStartDate, endDate: initialEndDate }) => {
    const { negocio } = useAppData();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [productSales, setProductSales] = useState<ProductSale[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!negocio) return;
        setIsLoading(true);
        const [transactionsRes, apptsRes, salesRes] = await Promise.all([
            supabase.from('transactions').select('*').eq('barbershop_id', negocio.id),
            supabase.from('appointments').select('*').eq('barbershop_id', negocio.id),
            supabase.from('product_sales').select('*').eq('barbershop_id', negocio.id),
        ]);
        setTransactions(mapFromSupabase<Transaction[]>(transactionsRes.data || []));
        setAppointments(mapFromSupabase<Appointment[]>(apptsRes.data || []));
        setProductSales(mapFromSupabase<ProductSale[]>(salesRes.data || []));
        setIsLoading(false);
    }, [negocio]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;
    
    const reportData = useMemo(() => {
        const start = initialStartDate ? new Date(initialStartDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const end = initialEndDate ? new Date(initialEndDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        const currentAppointments = appointments.filter(item => {
            const itemDate = item.startTime;
            if (!itemDate) return false;
            const d = new Date(itemDate);
            return d >= start && d <= end;
        });
        
        const currentTransactions = transactions.filter(item => {
            const itemDate = item.date;
            if (!itemDate) return false;
            const d = new Date(itemDate);
            return d >= start && d <= end;
        });

        const currentSales = productSales.filter(item => {
            const itemDate = item.createdAt;
            if (!itemDate) return false;
            const d = new Date(itemDate);
            return d >= start && d <= end;
        });
        
        const faturamento = currentTransactions
            .filter(t => t.type === 'revenue')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const produtosVendidos = currentSales.reduce((sum, sale) => sum + sale.quantity, 0);

        const agendamentosConcluidos = currentAppointments.filter(a => a.status === 'completed').length;
        const ticketMedio = agendamentosConcluidos > 0 ? faturamento / agendamentosConcluidos : 0;
        const totalAppointmentsInPeriod = currentAppointments.length;
        const taxaConversao = totalAppointmentsInPeriod > 0 ? (agendamentosConcluidos / totalAppointmentsInPeriod) * 100 : 0;
        
        const dailyData = (() => {
            const daysInRange: { date: Date, revenue: number, count: number }[] = [];
            let currentDate = new Date(start);
            while(currentDate <= end) {
                daysInRange.push({ date: new Date(currentDate), revenue: 0, count: 0 });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            currentTransactions.filter(t => t.type === 'revenue' && t.date).forEach(t => {
                const dayIndex = daysInRange.findIndex(d => d.date.toDateString() === new Date(t.date!).toDateString());
                if (dayIndex !== -1) {
                    daysInRange[dayIndex].revenue += t.amount;
                }
            });

            currentAppointments.filter(a => a.status === 'completed' && a.startTime).forEach(a => {
                const dayIndex = daysInRange.findIndex(d => d.date.toDateString() === new Date(a.startTime!).toDateString());
                if (dayIndex !== -1) {
                    daysInRange[dayIndex].count += 1;
                }
            });
            return daysInRange;
        })();
        
        const bestDay = dailyData.reduce((best, day) => day.revenue > best.revenue ? day : best, { revenue: -1, date: new Date() });

        return {
            dateRangeText: `${start.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})} - ${end.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'})}`,
            kpis: {
                faturamento: { value: faturamento.toFixed(2), comparison: '—' },
                agendamentos: { value: String(agendamentosConcluidos), comparison: '—' },
                produtosVendidos: { value: String(produtosVendidos), comparison: '—' },
                conversao: { value: taxaConversao.toFixed(0), comparison: '—' },
                ticketMedio: { value: ticketMedio.toFixed(2), comparison: '—' },
            },
            dailyRevenue: {
                data: dailyData,
                total: formatCurrency(faturamento),
                average: formatCurrency(dailyData.length > 0 ? faturamento / dailyData.length : 0),
                bestDayValue: formatCurrency(bestDay.revenue > 0 ? bestDay.revenue : 0),
                bestDayDate: bestDay.revenue > 0 ? bestDay.date.toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'}) : '--/--/----',
            },
        };

    }, [appointments, transactions, productSales, initialStartDate, initialEndDate]);

    if (isLoading) return <div className="text-center p-8">Carregando...</div>;
    
    const dailyMaxRevenue = Math.max(...reportData.dailyRevenue.data.map(d => d.revenue), 1);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <KPIStatCard symbol="R$" title="Faturamento no período" value={reportData.kpis.faturamento.value} comparison={reportData.kpis.faturamento.comparison} />
                <KPIStatCard symbol="#" title="Agendamentos Concluídos" value={reportData.kpis.agendamentos.value} comparison={reportData.kpis.agendamentos.comparison} />
                <KPIStatCard symbol="#" title="Produtos Vendidos" value={reportData.kpis.produtosVendidos.value} comparison={reportData.kpis.produtosVendidos.comparison} />
                <KPIStatCard symbol="%" title="Taxa de Conversão" value={reportData.kpis.conversao.value} comparison={reportData.kpis.conversao.comparison} />
                <KPIStatCard symbol="R$" title="Ticket Médio" value={reportData.kpis.ticketMedio.value} comparison={reportData.kpis.ticketMedio.comparison} />
            </div>
            
            <InfoCard title={`Receita Diária - ${reportData.dateRangeText}`} subtitle="Acompanhe o faturamento diário e identifique tendências">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <DailyStatCard title="Total no Período" value={reportData.dailyRevenue.total} icon={<DollarSignIcon className="h-7 w-7"/>} />
                    <DailyStatCard title="Média Diária" value={reportData.dailyRevenue.average} icon={<CalendarIcon className="h-7 w-7"/>} />
                    <DailyStatCard title="Melhor Dia" value={reportData.dailyRevenue.bestDayValue} icon={<TrendingUpIcon className="h-7 w-7"/>} />
                    <DailyStatCard title="Data do Melhor Dia" value={reportData.dailyRevenue.bestDayDate} icon={<CalendarIcon className="h-7 w-7"/>} />
                </div>
                
                <h4 className="text-lg font-semibold text-white mb-2">Gráfico de Receita Diária</h4>
                
                <div className="relative">
                    <div className="flex items-end h-32 border-b-2 border-gray-700/50 pb-1" style={{ gap: '2px' }}>
                        {reportData.dailyRevenue.data.map(({ date, revenue, count }) => {
                            const barHeight = dailyMaxRevenue > 0 ? (revenue / dailyMaxRevenue) * 95 : 0;
                            return (
                                <div key={date.toISOString()} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                                    <div className="absolute bottom-full mb-2 w-max max-w-xs p-2 text-xs text-white bg-brand-dark rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <p className="font-bold">{date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
                                        <p>Receita: {formatCurrency(revenue)}</p>
                                        <p>{count} agendamentos concluídos</p>
                                    </div>
                                    <div
                                        className="w-full bg-gray-700 group-hover:bg-brand-gold transition-colors duration-200"
                                        style={{ height: `${barHeight > 0 ? Math.max(barHeight, 2) : 0}%` }}
                                    ></div>
                                </div>
                            );
                        })}
                    </div>
                     <div className="flex mt-2" style={{ gap: '2px' }}>
                        {reportData.dailyRevenue.data.map(({ date }) => {
                            const dayOfWeek = date.getDay();
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                            return (
                                <div key={date.toISOString()} className="flex-1 text-center">
                                    <p className={`text-xs ${isWeekend ? 'text-red-400' : 'text-gray-400'}`}>{date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3)}</p>
                                    <p className="text-xs font-bold text-gray-300">{date.getDate()}</p>
                                </div>
                            );
                        })}
                    </div>
                     <div className="flex justify-center items-center gap-4 mt-4 text-xs text-gray-400">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-green-500"></span> Dias úteis</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-orange-500"></span> Fins de semana</div>
                        <span>•</span>
                        <span>Passe o mouse sobre as barras para ver detalhes</span>
                    </div>
                </div>
            </InfoCard>
        </div>
    );
};