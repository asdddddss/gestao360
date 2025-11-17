import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { Transaction, TransactionCategory } from '../../../types';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

interface FinancialReportViewProps {
    startDate?: Date;
    endDate?: Date;
}

export const FinancialReportView: React.FC<FinancialReportViewProps> = ({ startDate, endDate }) => {
    const { negocio } = useAppData();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!negocio || !startDate || !endDate) return;
        setIsLoading(true);

        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        
        const [transRes, catRes] = await Promise.all([
            supabase
                .from('transactions')
                .select('*')
                .eq('barbershop_id', negocio.id)
                .gte('date', start.toISOString())
                .lte('date', end.toISOString())
                .order('date', { ascending: false }),
            supabase.from('transaction_categories').select('id, name').eq('barbershop_id', negocio.id)
        ]);

        setTransactions(mapFromSupabase<Transaction[]>(transRes.data || []));
        setCategories(mapFromSupabase<TransactionCategory[]>(catRes.data || []));
        setIsLoading(false);
    }, [negocio, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

    const getTypeBadge = (type: 'revenue' | 'expense' | 'investment') => {
        const styles = {
            revenue: 'bg-green-500/20 text-green-300',
            expense: 'bg-red-500/20 text-red-300',
            investment: 'bg-blue-500/20 text-blue-300'
        };
        const text = { revenue: 'Receita', expense: 'Despesa', investment: 'Investimento' };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[type]}`}>{text[type]}</span>;
    };
    
    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">Data</th>
                            <th className="p-3">Descrição</th>
                            <th className="p-3">Tipo</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3 text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-8 text-center">Carregando transações...</td></tr>
                        ) : transactions.length > 0 ? transactions.map(t => {
                            const amountColor = { revenue: 'text-green-400', expense: 'text-red-400', investment: 'text-blue-400' }[t.type];
                            return (
                                <tr key={t.id} className="border-b border-gray-800">
                                    <td className="p-3">{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '-'}</td>
                                    <td className="p-3">{t.description}</td>
                                    <td className="p-3">{getTypeBadge(t.type)}</td>
                                    <td className="p-3">{t.categoryId ? categoryMap.get(t.categoryId) || 'Sem Categoria' : 'Sem Categoria'}</td>
                                    <td className={`p-3 text-right font-semibold ${amountColor}`}>{formatCurrency(t.amount)}</td>
                                </tr>
                            );
                        }) : (
                             <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhuma transação encontrada para o período.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};