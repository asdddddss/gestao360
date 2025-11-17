import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import type { Transaction, TransactionCategory } from '../../types';
import { useAppData } from '../../hooks/useAppData';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';

interface AddTransactionModalProps {
    onClose: () => void;
    onSave: (data: Omit<Transaction, 'id' | 'negocioId'>) => Promise<void>;
    onCategoryAdded: (newCategory: TransactionCategory) => void;
    transactionType: 'revenue' | 'expense' | 'investment';
    categories: TransactionCategory[];
}

interface FormErrors {
    description?: string;
    amount?: string;
    date?: string;
    categoryId?: string;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ onClose, onSave, onCategoryAdded, transactionType, categories }) => {
    const { negocio } = useAppData();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date());
    const [categoryId, setCategoryId] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});

    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!description.trim()) newErrors.description = "Descrição é obrigatória.";
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) newErrors.amount = "Valor deve ser maior que zero.";
        if (!date) newErrors.date = "Data é obrigatória.";

        if (isCreatingCategory) {
            if (!newCategoryName.trim()) newErrors.categoryId = "O nome da nova categoria é obrigatório.";
        } else {
            if (!categoryId) newErrors.categoryId = "Categoria é obrigatória.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === '__CREATE_NEW__') {
            setIsCreatingCategory(true);
            setCategoryId('');
        } else {
            setIsCreatingCategory(false);
            setCategoryId(e.target.value);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!negocio) return;
        
        let finalCategoryId = categoryId;

        if (isCreatingCategory) {
            const { data, error } = await supabase
                .from('transaction_categories')
                .insert({
                    name: newCategoryName,
                    type: transactionType,
                    barbershop_id: negocio.id
                })
                .select()
                .single();
            
            if (error || !data) {
                alert('Erro ao criar categoria.');
                console.error(error);
                return;
            }

            const newCategory = mapFromSupabase<TransactionCategory>(data);
            onCategoryAdded(newCategory);
            finalCategoryId = newCategory.id;
        }
        
        const sourceMap = {
            revenue: 'manual_revenue',
            expense: 'manual_expense',
            investment: 'manual_investment'
        } as const;

        await onSave({
            type: transactionType,
            description,
            amount: parseFloat(amount),
            date,
            categoryId: finalCategoryId,
            sourceType: sourceMap[transactionType]
        });
    };
    
    const titleMap = {
        revenue: 'Lançar Receita',
        expense: 'Lançar Despesa',
        investment: 'Lançar Investimento'
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-white">
                    {titleMap[transactionType]}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Descrição" id="description" value={description} onChange={e => setDescription(e.target.value)} required error={errors.description} />
                    <Input label="Valor (R$)" id="amount" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required error={errors.amount} />
                    
                    {!isCreatingCategory ? (
                        <Select label="Categoria" id="categoryId" value={categoryId} onChange={handleCategoryChange} required error={errors.categoryId}>
                            <option value="">Selecione uma categoria...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            <option value="__CREATE_NEW__" className="text-brand-gold font-semibold">--- Criar Nova Categoria ---</option>
                        </Select>
                    ) : (
                        <div className="p-3 bg-brand-dark rounded-md">
                            <div className="flex items-end gap-2">
                                <Input label="Nome da Nova Categoria" id="newCategoryName" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} error={errors.categoryId} />
                                <Button type="button" size="sm" variant="secondary" onClick={() => { setIsCreatingCategory(false); setErrors({}); }}>Voltar</Button>
                            </div>
                        </div>
                    )}

                    <DatePicker label="Data" selectedDate={date} onDateChange={setDate} error={errors.date} />
                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};