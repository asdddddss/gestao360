import React, { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import type { TransactionCategory } from '../../../types';

interface AddExpenseTypeModalProps {
    category: TransactionCategory | null;
    onClose: () => void;
    onSave: (data: Omit<TransactionCategory, 'id' | 'negocioId' | 'type'>, id?: string) => Promise<void>;
}

type FormData = {
    name: string;
    group: string;
    relationType: 'none' | 'professional' | 'supplier';
    status: 'active' | 'inactive';
};

interface FormErrors {
    name?: string;
}

const relationTypeMap = {
    none: 'Sem relação definida',
    professional: 'Relacionada a profissional',
    supplier: 'Relacionada a fornecedor',
};

export const AddExpenseTypeModal: React.FC<AddExpenseTypeModalProps> = ({ category, onClose, onSave }) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        group: '',
        relationType: 'none',
        status: 'active',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                group: category.group || '',
                relationType: category.relationType || 'none',
                status: category.status || 'active',
            });
        }
    }, [category]);
    
    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = "O nome da despesa é obrigatório.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave(formData, category?.id);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-white">{category ? 'Editar Tipo de Despesa' : 'Cadastrar Despesa'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Despesa" id="name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required />
                    <Input label="Categoria (Agrupamento)" id="group" name="group" value={formData.group} onChange={handleChange} placeholder="Ex: Despesas Fixas, Pessoal" />
                    <Select label="Relação" id="relationType" name="relationType" value={formData.relationType} onChange={handleChange}>
                        {Object.entries(relationTypeMap).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </Select>
                    <Select label="Status" id="status" name="status" value={formData.status} onChange={handleChange}>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </Select>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
