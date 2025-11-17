import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { ProfessionalPayment, Professional } from '../../../types';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;
const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR');

interface ProfessionalPaymentsReportViewProps {
    startDate?: Date;
    endDate?: Date;
}

export const ProfessionalPaymentsReportView: React.FC<ProfessionalPaymentsReportViewProps> = ({ startDate, endDate }) => {
    const { negocio } = useAppData();
    const [payments, setPayments] = useState<ProfessionalPayment[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!negocio || !startDate || !endDate) return;
        setIsLoading(true);

        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        
        const [paymentsRes, profsRes] = await Promise.all([
            supabase
                .from('professional_payments')
                .select('*')
                .eq('barbershop_id', negocio.id)
                .gte('payment_date', start.toISOString())
                .lte('payment_date', end.toISOString())
                .order('payment_date', { ascending: false }),
            supabase.from('professionals').select('id, name').eq('barbershop_id', negocio.id)
        ]);
            
        setPayments(mapFromSupabase<ProfessionalPayment[]>(paymentsRes.data || []));
        setProfessionals(mapFromSupabase<Professional[]>(profsRes.data || []));
        setIsLoading(false);
    }, [negocio, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const professionalMap = useMemo(() => new Map(professionals.map(p => [p.id, p.name])), [professionals]);
    
    const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.totalToPay, 0), [payments]);

    return (
        <Card>
            <div className="mb-4 p-4 bg-brand-dark rounded-lg text-center">
                <p className="text-sm text-gray-400">Total Pago no Período</p>
                <p className="text-2xl font-bold text-brand-gold">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">Data do Pagamento</th>
                            <th className="p-3">Profissional</th>
                            <th className="p-3">Período de Referência</th>
                            <th className="p-3 text-right">Valor Pago</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="p-8 text-center">Carregando pagamentos...</td></tr>
                        ) : payments.length > 0 ? payments.map(payment => (
                            <tr key={payment.id} className="border-b border-gray-800">
                                <td className="p-3">{formatDate(payment.paymentDate)}</td>
                                <td className="p-3 font-medium">{professionalMap.get(payment.professionalId) || 'Profissional Removido'}</td>
                                <td className="p-3">{`${formatDate(payment.startDate)} - ${formatDate(payment.endDate)}`}</td>
                                <td className="p-3 text-right font-semibold text-green-400">{formatCurrency(payment.totalToPay)}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">Nenhum pagamento encontrado para o período.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};