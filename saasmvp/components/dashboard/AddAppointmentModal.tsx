import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { DatePicker } from '../ui/DatePicker';
import type { Appointment, Service, Professional, Client } from '../../types';
import { useAppData } from '../../hooks/useAppData';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase } from '../../lib/mappers';

interface AddAppointmentModalProps {
  onClose: () => void;
  // Fix: The 'tip' property is handled by the parent component, so it should be omitted from the data passed to this function.
  onAddAppointment: (data: Omit<Appointment, 'id' | 'negocioId' | 'status' | 'paymentStatus' | 'tip'>) => Promise<void>;
  onClientAdded: (newClient: Client) => void;
  services: Service[];
  professionals: Professional[];
  clients: Client[];
}

interface ApptFormErrors {
    clientId?: string;
    newClientName?: string;
    serviceId?: string;
    professionalId?: string;
    date?: string;
    time?: string;
}

export const AddAppointmentModal: React.FC<AddAppointmentModalProps> = ({ onClose, onAddAppointment, onClientAdded, services, professionals, clients }) => {
    const { negocio } = useAppData();
    const [clientId, setClientId] = useState('');
    const [serviceId, setServiceId] = useState('');
    const [professionalId, setProfessionalId] = useState('');
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState('');
    const [errors, setErrors] = useState<ApptFormErrors>({});

    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');
    const [newClientBirthDate, setNewClientBirthDate] = useState('');


    const availableProfessionals = useMemo(() => {
        if (!serviceId) return [];
        return professionals.filter(p => p.services && p.services.includes(serviceId));
    }, [serviceId, professionals]);

    const validate = (): boolean => {
        const newErrors: ApptFormErrors = {};
        if (isCreatingClient) {
            if (!newClientName.trim()) newErrors.newClientName = "Nome do cliente é obrigatório.";
        } else {
            if (!clientId) newErrors.clientId = "Selecione um cliente ou crie um novo.";
        }
        if (!serviceId) newErrors.serviceId = "Selecione um serviço.";
        if (!professionalId) newErrors.professionalId = "Selecione um profissional.";
        if (!date) newErrors.date = "Data é obrigatória.";
        if (!time) newErrors.time = "Hora é obrigatória.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!negocio) {
            alert("Erro: Negócio não encontrado.");
            return;
        }

        let finalClientId = clientId;

        if (isCreatingClient) {
            const { data: newClientData, error: clientError } = await supabase
                .from('clients')
                .insert({
                    barbershop_id: negocio.id,
                    name: newClientName,
                    phone: newClientPhone.replace(/\D/g, '') || null,
                    birth_date: newClientBirthDate || null,
                })
                .select()
                .single();
            
            if (clientError || !newClientData) {
                console.error("Failed to create client:", clientError);
                alert("Falha ao criar o novo cliente.");
                return;
            }
            const mappedClient = mapFromSupabase<Client>(newClientData);
            onClientAdded(mappedClient);
            finalClientId = mappedClient.id;
        }


        const [hours, minutes] = time.split(':').map(Number);
        const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);

        await onAddAppointment({ clientId: finalClientId, serviceId, professionalId, startTime });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-white">Novo Agendamento</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {isCreatingClient ? (
                        <div className="p-4 bg-brand-dark rounded-md space-y-4">
                            <h4 className="font-semibold text-gray-300">Novo Cliente</h4>
                            <Input label="Nome do Cliente" id="newClientName" value={newClientName} onChange={e => setNewClientName(e.target.value)} required error={errors.newClientName} />
                            <Input label="Telefone (Opcional)" id="newClientPhone" type="tel" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                            <Input label="Data de Nascimento (Opcional)" id="newClientBirthDate" type="date" value={newClientBirthDate} onChange={e => setNewClientBirthDate(e.target.value)} />
                            <Button type="button" variant="secondary" size="sm" onClick={() => { setIsCreatingClient(false); setErrors({}); }}>
                                Voltar para a lista
                            </Button>
                        </div>
                    ) : (
                         <div className="flex items-end gap-2">
                             <div className="flex-grow">
                                <Select label="Cliente" id="clientId" value={clientId} onChange={e => setClientId(e.target.value)} required error={errors.clientId}>
                                    <option value="">Selecione um Cliente</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{(c.name || 'Cliente Sem Nome')} - {c.phone}</option>)}
                                </Select>
                             </div>
                            <Button type="button" variant="secondary" onClick={() => { setIsCreatingClient(true); setClientId(''); setErrors({}); }}>
                                Criar Novo
                            </Button>
                        </div>
                    )}
                    
                    <Select label="Serviço" id="serviceId" value={serviceId} onChange={e => { setServiceId(e.target.value); setProfessionalId(''); }} required error={errors.serviceId}>
                        <option value="">Selecione um Serviço</option>
                        {services.map(s => <option key={s.id} value={s.id}>{s.name || 'Serviço Sem Nome'}</option>)}
                    </Select>

                    <Select label="Profissional" id="professionalId" value={professionalId} onChange={e => setProfessionalId(e.target.value)} required disabled={!serviceId} error={errors.professionalId}>
                        <option value="">Selecione um Profissional</option>
                        {availableProfessionals.map(p => <option key={p.id} value={p.id}>{p.name || 'Profissional sem nome'}</option>)}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <DatePicker label="Data" selectedDate={date} onDateChange={setDate} error={errors.date} />
                        <Input label="Hora" id="time" type="time" value={time} onChange={e => setTime(e.target.value)} required error={errors.time} />
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Agendar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};