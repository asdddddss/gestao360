import React, { useState, useEffect } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EditIcon, TrashIcon, CheckIcon, XIcon } from '../../lib/icons';
import type { Plan, PlanFrequency, Professional } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';

interface PlanFormErrors {
    name?: string;
    price?: string;
    frequency?: string;
}

const frequencyOptions: { value: PlanFrequency, label: string }[] = [
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'bimonthly', label: 'Bimestral' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
];

export const PlansPage: React.FC = () => {
    const { negocio } = useAppData();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [frequency, setFrequency] = useState<PlanFrequency>('monthly');
    const [description, setDescription] = useState('');
    const [professionalId, setProfessionalId] = useState<string>('');
    const [errors, setErrors] = useState<PlanFormErrors>({});

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<Omit<Plan, 'id' | 'negocioId'>>({ name: '', price: 0, frequency: 'monthly', professionalId: '' });
    
    useEffect(() => {
        const fetchData = async () => {
            if (!negocio) return;
            setIsLoading(true);
            const [plansRes, profsRes] = await Promise.all([
                supabase.from('plans').select('*').eq('barbershop_id', negocio.id),
                supabase.from('professionals').select('*').eq('barbershop_id', negocio.id)
            ]);
            if (plansRes.data) setPlans(mapFromSupabase<Plan[]>(plansRes.data));
            if (profsRes.data) setProfessionals(mapFromSupabase<Professional[]>(profsRes.data));
            setIsLoading(false);
        };
        fetchData();
    }, [negocio]);

    const addPlan = async (data: Omit<Plan, 'id' | 'negocioId'>) => {
        if (!negocio) return;
        const { data: newPlan, error } = await supabase
            .from('plans')
            .insert({ ...mapToSupabase(data), barbershop_id: negocio.id })
            .select()
            .single();
        if (newPlan && !error) {
            setPlans(prev => [...prev, mapFromSupabase<Plan>(newPlan)]);
        }
    };
    
    const updatePlan = async (id: string, data: Partial<Omit<Plan, 'id' | 'negocioId'>>) => {
        const { data: updatedPlan, error } = await supabase
            .from('plans')
            .update(mapToSupabase(data))
            .eq('id', id)
            .select()
            .single();
        if (updatedPlan && !error) {
            setPlans(prev => prev.map(p => p.id === id ? mapFromSupabase<Plan>(updatedPlan) : p));
        }
    };

    const deletePlan = async (id: string) => {
        const { error } = await supabase.from('plans').delete().eq('id', id);
        if (!error) {
            setPlans(prev => prev.filter(p => p.id !== id));
        }
    };

    const validateNewPlan = (): boolean => {
        const newErrors: PlanFormErrors = {};
        if (!name.trim()) newErrors.name = "Nome é obrigatório.";
        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) newErrors.price = "Deve ser >= 0.";
        if (!frequency) newErrors.frequency = "Selecione uma frequência.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateNewPlan()) return;
        addPlan({ name, price: parseFloat(price), frequency, description, professionalId: professionalId || undefined });
        setName('');
        setPrice('');
        setFrequency('monthly');
        setDescription('');
        setProfessionalId('');
        setErrors({});
    };

    const handleStartEdit = (plan: Plan) => {
        setEditingId(plan.id);
        setEditedData({ name: plan.name || '', price: plan.price, frequency: plan.frequency, description: plan.description, professionalId: plan.professionalId || '' });
    };
    
    const handleCancelEdit = () => setEditingId(null);
    
    const handleSaveEdit = () => {
        if (!editingId) return;
        if(editedData.name?.trim() && (editedData.price || 0) >= 0) {
            updatePlan(editingId, editedData);
            setEditingId(null);
        }
    };
    
    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: name === 'price' ? parseFloat(value) || 0 : value }));
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">Gerenciar Planos</h2>
            <Card>
                <h3 className="text-xl font-semibold mb-4">Adicionar Novo Plano</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input label="Nome do Plano" id="name" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
                        <Input label="Preço (R$)" id="price" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} error={errors.price} />
                        <Select label="Frequência" id="frequency" value={frequency} onChange={e => setFrequency(e.target.value as PlanFrequency)} error={errors.frequency}>
                            {frequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </Select>
                        <Select label="Profissional (Opcional)" id="professionalId" value={professionalId} onChange={e => setProfessionalId(e.target.value)}>
                            <option value="">Nenhum</option>
                            {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </div>
                    <Input label="Descrição (Opcional)" id="description" value={description} onChange={e => setDescription(e.target.value)} />
                    <div className="flex justify-end">
                        <Button type="submit">Adicionar Plano</Button>
                    </div>
                </form>
            </Card>

            <Card>
                <h3 className="text-xl font-semibold mb-4">Lista de Planos</h3>
                {isLoading ? <p>Carregando planos...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700">
                                <tr>
                                    <th className="p-3">Nome</th>
                                    <th className="p-3">Preço</th>
                                    <th className="p-3">Frequência</th>
                                    <th className="p-3">Profissional</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {plans.map(plan => (
                                    editingId === plan.id ? (
                                        <tr key={plan.id}>
                                            <td className="p-2"><Input id={`edit-name-${plan.id}`} label="" name="name" value={editedData.name || ''} onChange={handleEditChange} /></td>
                                            <td className="p-2"><Input id={`edit-price-${plan.id}`} label="" name="price" type="number" value={editedData.price ?? ''} onChange={handleEditChange} /></td>
                                            <td className="p-2">
                                                <Select id={`edit-freq-${plan.id}`} label="" name="frequency" value={editedData.frequency} onChange={handleEditChange}>
                                                    {frequencyOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                                </Select>
                                            </td>
                                            <td className="p-2">
                                                <Select id={`edit-prof-${plan.id}`} label="" name="professionalId" value={editedData.professionalId || ''} onChange={handleEditChange}>
                                                    <option value="">Nenhum</option>
                                                    {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </Select>
                                            </td>
                                            <td className="p-2 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={handleSaveEdit} title="Salvar"><CheckIcon className="h-5 w-5 text-green-400" /></button>
                                                    <button onClick={handleCancelEdit} title="Cancelar"><XIcon className="h-5 w-5 text-gray-400" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={plan.id} className="border-b border-gray-800">
                                            <td className="p-3">{plan.name || 'Plano Sem Nome'}</td>
                                            <td className="p-3">R$ {(plan.price || 0).toFixed(2)}</td>
                                            <td className="p-3">{frequencyOptions.find(f => f.value === plan.frequency)?.label}</td>
                                            <td className="p-3">{professionals.find(p => p.id === plan.professionalId)?.name || 'N/A'}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => handleStartEdit(plan)} title="Editar"><EditIcon className="h-5 w-5 text-gray-400" /></button>
                                                    <button onClick={() => deletePlan(plan.id)} title="Excluir"><TrashIcon className="h-5 w-5 text-red-500" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};