import React, { useState } from 'react';
import type { ClientSubscription, Client, Plan } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';

interface AddSubscriptionModalProps {
    onClose: () => void;
    onSave: (data: Omit<ClientSubscription, 'id' | 'status'>) => Promise<void>;
    clients: Client[];
    plans: Plan[];
}

interface FormErrors {
    clientId?: string;
    planId?: string;
    startDate?: string;
}

export const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({ onClose, onSave, clients, plans }) => {
    const [clientId, setClientId] = useState('');
    const [planId, setPlanId] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [errors, setErrors] = useState<FormErrors>({});

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!clientId) newErrors.clientId = "Selecione um cliente.";
        if (!planId) newErrors.planId = "Selecione um plano.";
        if (!startDate) newErrors.startDate = "Selecione uma data de início.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        await onSave({
            clientId,
            planId,
            startDate,
        });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-white">Adicionar Nova Assinatura</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select label="Cliente" id="sub-client" value={clientId} onChange={e => setClientId(e.target.value)} error={errors.clientId} required>
                        <option value="">Selecione um cliente...</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>

                    <Select label="Plano" id="sub-plan" value={planId} onChange={e => setPlanId(e.target.value)} error={errors.planId} required>
                         <option value="">Selecione um plano...</option>
                        {plans.map(p => <option key={p.id} value={p.id}>{p.name} (R$ {p.price?.toFixed(2)})</option>)}
                    </Select>
                    
                    <DatePicker label="Data de Início" selectedDate={startDate} onDateChange={setStartDate} error={errors.startDate} />

                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar Assinatura</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};