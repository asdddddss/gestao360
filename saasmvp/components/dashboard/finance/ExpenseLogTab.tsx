import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../../lib/mappers';
import type { Transaction, TransactionCategory } from '../../../types';
import { AddTransactionModal } from '../AddTransactionModal';
import { TrashIcon } from '../../../lib/icons';
import { DatePicker } from '../../ui/DatePicker';

const StatCard: React.FC<{ title: string; value: string; colorClass: string; }> = ({ title, value, colorClass }) => (
    <Card className="p-4 text-center">
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </Card>
);

export const ExpenseLogTab: React.FC = () => {
    const { negocio } = useAppData();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'revenue' | 'expense' | 'investment'>('expense');

    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

    const fetchData = useCallback(async () => {
        if (!negocio) return;
        setIsLoading(true);
        const [transRes, catRes] = await Promise.all([
            supabase.from('transactions').select('*').eq('barbershop_id', negocio.id).order('date', { ascending: false }),
            supabase.from('transaction_categories').select('*').eq('barbershop_id', negocio.id).order('name')
        ]);
        if (transRes.data) setTransactions(mapFromSupabase<Transaction[]>(transRes.data));
        if (catRes.data) setCategories(mapFromSupabase<TransactionCategory[]>(catRes.data));
        setIsLoading(false);
    }, [negocio]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredData = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        const transactionsInPeriod = transactions.filter(t => t.date && new Date(t.date) >= start && new Date(t.date) <= end);
        
        const totalRevenue = transactionsInPeriod.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactionsInPeriod.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const totalInvestment = transactionsInPeriod.filter(t => t.type === 'investment').reduce((sum, t) => sum + t.amount, 0);
        const result = totalRevenue - totalExpense;

        return { transactions: transactionsInPeriod, totalRevenue, totalExpense, totalInvestment, result };
    }, [transactions, startDate, endDate]);

    const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

    const handleAddTransaction = async (data: Omit<Transaction, 'id' | 'negocioId'>) => {
        if (!negocio) return;
        const { data: newTransaction, error } = await supabase
            .from('transactions')
            .insert({ ...mapToSupabase(data), barbershop_id: negocio.id })
            .select()
            .single();

        if (newTransaction && !error) {
            setTransactions(prev => [mapFromSupabase<Transaction>(newTransaction), ...prev].sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime()));
        }
        setIsModalOpen(false);
    };
    
    const handleCategoryAdded = (newCategory: TransactionCategory) => {
        setCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
    };

    const handleDeleteTransaction = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
            const { error } = await supabase.from('transactions').delete().eq('id', id);
            if (!error) {
                setTransactions(prev => prev.filter(t => t.id !== id));
            }
        }
    };
    
    const openModal = (type: 'revenue' | 'expense' | 'investment') => {
        setModalType(type);
        setIsModalOpen(true);
    };

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
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <h3 className="text-lg font-semibold text-white">Controle de entrada e saída</h3>
                    <div className="flex items-center gap-2">
                        <DatePicker label="" selectedDate={startDate} onDateChange={setStartDate} />
                        <span className="pt-5 text-gray-400">até</span>
                        <DatePicker label="" selectedDate={endDate} onDateChange={setEndDate} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Receita" value={formatCurrency(filteredData.totalRevenue)} colorClass="text-green-400" />
                    <StatCard title="Despesa" value={formatCurrency(filteredData.totalExpense)} colorClass="text-red-400" />
                    <StatCard title="Resultado" value={formatCurrency(filteredData.result)} colorClass={filteredData.result >= 0 ? 'text-blue-400' : 'text-red-400'} />
                </div>
            </Card>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button onClick={() => openModal('revenue')} className="w-full sm:w-auto">Lançar Receita</Button>
                <Button onClick={() => openModal('expense')} className="w-full sm:w-auto">Lançar Despesa</Button>
                <Button onClick={() => openModal('investment')} className="w-full sm:w-auto">Lançar Investimento</Button>
            </div>

            <Card>
                <h3 className="text-xl font-semibold mb-4">Lançamentos</h3>
                {isLoading ? <p>Carregando...</p> : filteredData.transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Descrição</th>
                                    <th className="p-3">Tipo</th>
                                    <th className="p-3">Categoria</th>
                                    <th className="p-3 text-right">Valor</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.transactions.map(t => {
                                    const category = categories.find(c => c.id === t.categoryId);
                                    const amountColor = { revenue: 'text-green-400', expense: 'text-red-400', investment: 'text-blue-400' }[t.type];
                                    return (
                                        <tr key={t.id} className="border-b border-gray-800">
                                            <td className="p-3">{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : '-'}</td>
                                            <td className="p-3">{t.description}</td>
                                            <td className="p-3">{getTypeBadge(t.type)}</td>
                                            <td className="p-3">{category?.name || 'Sem Categoria'}</td>
                                            <td className={`p-3 text-right font-semibold ${amountColor}`}>{formatCurrency(t.amount)}</td>
                                            <td className="p-3 text-right">
                                                <button onClick={() => handleDeleteTransaction(t.id)} title="Excluir"><TrashIcon className="h-5 w-5 text-red-500 hover:text-red-400" /></button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <p>Nenhum lançamento foi encontrado no período selecionado.</p>
                        <p className="text-sm">Selecione “Lançar despesa” ou “Lançar receita” para adicionar um novo registro.</p>
                    </div>
                )}
            </Card>

            {isModalOpen && (
                <AddTransactionModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleAddTransaction}
                    onCategoryAdded={handleCategoryAdded}
                    transactionType={modalType}
                    categories={categories.filter(c => c.type === modalType)}
                />
            )}
        </div>
    );
};
