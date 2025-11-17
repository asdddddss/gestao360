import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../../lib/mappers';
import type { TransactionCategory } from '../../../types';
import { Pagination } from '../../ui/Pagination';
import { EditIcon, TrashIcon } from '../../../lib/icons';
import { AddExpenseTypeModal } from './AddExpenseTypeModal';

const relationTypeMap = {
    none: 'Sem relação definida',
    professional: 'Relacionada a profissional',
    supplier: 'Relacionada a fornecedor',
};

const statusMap = {
    active: 'Ativo',
    inactive: 'Inativo',
};

export const ExpenseTypesTab: React.FC = () => {
    const { negocio } = useAppData();
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<TransactionCategory | null>(null);

    const [filters, setFilters] = useState({ name: '', group: 'all', relationType: 'all', status: 'active' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const fetchData = useCallback(async () => {
        if (!negocio) return;
        setIsLoading(true);
        const { data } = await supabase
            .from('transaction_categories')
            .select('*')
            .eq('barbershop_id', negocio.id)
            .eq('type', 'expense')
            .order('name');
        setCategories(mapFromSupabase<TransactionCategory[]>(data || []));
        setIsLoading(false);
    }, [negocio]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveCategory = async (data: Omit<TransactionCategory, 'id' | 'negocioId' | 'type'>, id?: string) => {
        if (!negocio) return;
        const payload = { ...mapToSupabase(data), type: 'expense', barbershop_id: negocio.id };

        if (id) {
            const { data: updated, error } = await supabase.from('transaction_categories').update(payload).eq('id', id).select().single();
            if (updated && !error) setCategories(prev => prev.map(c => c.id === id ? mapFromSupabase<TransactionCategory>(updated) : c));
        } else {
            const { data: created, error } = await supabase.from('transaction_categories').insert(payload).select().single();
            if (created && !error) setCategories(prev => [...prev, mapFromSupabase<TransactionCategory>(created)]);
        }
        setIsModalOpen(false);
    };

    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('Tem certeza? Excluir uma categoria não afeta os lançamentos já existentes.')) {
            const { error } = await supabase.from('transaction_categories').delete().eq('id', id);
            if (!error) setCategories(prev => prev.filter(c => c.id !== id));
        }
    };
    
    const uniqueGroups = useMemo(() => [...new Set(categories.map(c => c.group).filter(Boolean))], [categories]);

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            return (filters.status === 'all' || cat.status === filters.status) &&
                   (filters.group === 'all' || cat.group === filters.group) &&
                   (filters.relationType === 'all' || cat.relationType === filters.relationType) &&
                   (cat.name.toLowerCase().includes(filters.name.toLowerCase()));
        });
    }, [categories, filters]);

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCategories.slice(start, start + itemsPerPage);
    }, [filteredCategories, currentPage, itemsPerPage]);

    return (
        <div className="space-y-6">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <Input label="Despesa" id="nameFilter" placeholder="Buscar por nome..." value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} />
                    <Select label="Categoria" id="groupFilter" value={filters.group} onChange={e => setFilters({...filters, group: e.target.value})}>
                        <option value="all">Todas</option>
                        {uniqueGroups.map(g => <option key={g} value={g}>{g}</option>)}
                    </Select>
                    <Select label="Relação" id="relationFilter" value={filters.relationType} onChange={e => setFilters({...filters, relationType: e.target.value})}>
                        <option value="all">Todas</option>
                        {Object.entries(relationTypeMap).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </Select>
                    <Select label="Status" id="statusFilter" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}>
                        <option value="all">Todos</option>
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </Select>
                    <div className="pt-7">
                        <Button className="w-full h-11" onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}>Cadastrar Despesa</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3">Despesa</th>
                                <th className="p-3">Categoria</th>
                                <th className="p-3">Relação</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center">Carregando...</td></tr>
                            ) : paginatedCategories.length > 0 ? paginatedCategories.map(cat => (
                                <tr key={cat.id} className="border-b border-gray-800">
                                    <td className="p-3 font-medium">{cat.name}</td>
                                    <td className="p-3">{cat.group || '-'}</td>
                                    <td className="p-3">{relationTypeMap[cat.relationType]}</td>
                                    <td className="p-3">{statusMap[cat.status]}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => { setEditingCategory(cat); setIsModalOpen(true); }} title="Editar"><EditIcon className="h-5 w-5 text-gray-400" /></button>
                                            <button onClick={() => handleDeleteCategory(cat.id)} title="Excluir"><TrashIcon className="h-5 w-5 text-red-500" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Nenhum tipo de despesa encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredCategories.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </Card>

            {isModalOpen && (
                <AddExpenseTypeModal
                    category={editingCategory}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveCategory}
                />
            )}
        </div>
    );
};
