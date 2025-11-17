import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import type { Professional, TransactionCategory } from '../../types';
import { TrashIcon } from '../../lib/icons';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';

const ProfessionalFinanceCard: React.FC<{ professional: Professional, onSave: Function }> = ({ professional, onSave }) => {
    const [commissionType, setCommissionType] = useState(professional.commissionType);
    const [commissionValue, setCommissionValue] = useState(professional.commissionValue);
    const [salary, setSalary] = useState(professional.baseSalary);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setCommissionType(professional.commissionType);
        setCommissionValue(professional.commissionValue);
        setSalary(professional.baseSalary);
    }, [professional]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = { 
            commissionType, 
            commissionValue: parseFloat(String(commissionValue)) || 0, 
            baseSalary: parseFloat(String(salary)) || 0 
        };
        onSave(professional.id, dataToSave);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <Card className="flex flex-col md:flex-row items-start gap-6">
            <div className="text-center md:text-left">
                <img src={professional.photoUrl || ''} alt={professional.name || 'Foto do profissional'} className="w-20 h-20 rounded-full object-cover mx-auto md:mx-0" />
                <h4 className="font-bold text-lg mt-2">{professional.name || 'Sem Nome'}</h4>
            </div>
            <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select label="Tipo de Comissão" id={`ct-${professional.id}`} value={commissionType} onChange={e => setCommissionType(e.target.value as 'percentage' | 'fixed')}>
                        <option value="percentage">Percentual (%)</option>
                        <option value="fixed">Fixo (R$)</option>
                    </Select>
                    <Input 
                        label={commissionType === 'percentage' ? 'Valor (%)' : 'Valor (R$)'}
                        id={`cv-${professional.id}`}
                        type="number" 
                        step="0.01"
                        value={commissionValue ?? ''}
                        onChange={e => setCommissionValue(parseFloat(e.target.value) || 0)}
                    />
                </div>
                <Input label="Salário Base (R$)" id={`s-${professional.id}`} type="number" step="0.01" value={salary ?? ''} onChange={e => setSalary(parseFloat(e.target.value) || 0)} />
                <div className="flex justify-end items-center gap-4">
                    {isSaved && <span className="text-sm text-green-400">Salvo!</span>}
                    <Button type="submit">Salvar</Button>
                </div>
            </form>
        </Card>
    );
};

export const FinanceSettingsPage: React.FC = () => {
    const { negocio } = useAppData();
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [transactionCategories, setTransactionCategories] = useState<TransactionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryType, setNewCategoryType] = useState<'expense' | 'revenue'>('expense');
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        const fetchData = async () => {
            if (!negocio) return;
            setIsLoading(true);
            const [profsRes, catsRes] = await Promise.all([
                supabase.from('professionals').select('*').eq('barbershop_id', negocio.id),
                supabase.from('transaction_categories').select('*').eq('barbershop_id', negocio.id)
            ]);
            if (profsRes.data) setProfessionals(mapFromSupabase<Professional[]>(profsRes.data));
            if (catsRes.data) setTransactionCategories(mapFromSupabase<TransactionCategory[]>(catsRes.data));
            setIsLoading(false);
        };
        fetchData();
    }, [negocio]);

    const updateProfessionalFinancials = async (id: string, data: { commissionType: 'percentage' | 'fixed'; commissionValue: number; baseSalary: number }) => {
        const { data: updatedProf, error } = await supabase.from('professionals').update(mapToSupabase(data)).eq('id', id).select().single();
        if (updatedProf && !error) {
            setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
        }
    };
    
    const addTransactionCategory = async (name: string, type: 'expense' | 'revenue') => {
        if (!negocio) return;
        const { data: newCat, error } = await supabase.from('transaction_categories').insert({ name, type, barbershop_id: negocio.id }).select().single();
        if (newCat && !error) {
            setTransactionCategories(prev => [...prev, mapFromSupabase<TransactionCategory>(newCat)]);
        }
    };

    const deleteTransactionCategory = async (id: string) => {
        const { error } = await supabase.from('transaction_categories').delete().eq('id', id);
        if (!error) {
            setTransactionCategories(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            setError('O nome da categoria não pode ser vazio.');
            return;
        }
        addTransactionCategory(newCategoryName, newCategoryType);
        setNewCategoryName('');
        setError(undefined);
    };
    
    if (isLoading) return <div className="text-center p-8">Carregando configurações...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Configurações de Pagamento</h3>
                <p className="text-gray-400">
                    Defina as regras de comissão e pagamento para cada profissional. Os valores serão usados para calcular automaticamente os repasses no resumo financeiro.
                </p>
            </div>
            <div className="space-y-4">
                {professionals.map(prof => (
                    <ProfessionalFinanceCard key={prof.id} professional={prof} onSave={updateProfessionalFinancials} />
                ))}
            </div>
            <hr className="border-gray-700" />
            
            <Card>
                <h3 className="text-xl font-semibold mb-4 text-white">Categorias de Transação</h3>
                <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
                    <Input label="Nova Categoria" id="new-category" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="Ex: Venda de Produtos" error={error}/>
                    <Select label="Tipo" id="new-cat-type" value={newCategoryType} onChange={e => setNewCategoryType(e.target.value as 'expense' | 'revenue')}>
                        <option value="expense">Despesa</option>
                        <option value="revenue">Receita</option>
                    </Select>
                    <div className="pt-7"><Button type="submit">Adicionar</Button></div>
                </form>
                <div className="space-y-2">
                    {transactionCategories.map(cat => (
                        <div key={cat.id} className="flex justify-between items-center p-2 bg-brand-dark rounded-md">
                            <div>
                                <span>{cat.name}</span>
                                <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${cat.type === 'expense' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                                    {cat.type === 'expense' ? 'Despesa' : 'Receita'}
                                </span>
                            </div>
                            <button onClick={() => deleteTransactionCategory(cat.id)} title="Excluir Categoria" className="text-red-500 hover:text-red-400"><TrashIcon className="h-4 w-4" /></button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};
