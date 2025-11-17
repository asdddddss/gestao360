import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { XIcon, TrashIcon } from '../../lib/icons';
import type { Appointment, AppointmentStatus, PaymentStatus, Client, Service, Professional } from '../../types';
import { Input } from '../ui/Input';

interface AppointmentDetailModalProps {
  appointment: Appointment;
  onClose: () => void;
  onUpdateAppointment: (id: string, data: Partial<Pick<Appointment, 'status' | 'tip'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  clients: Client[];
  services: Service[];
  professionals: Professional[];
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ 
    appointment, onClose, onUpdateAppointment, onDelete, clients, services, professionals 
}) => {

    const [status, setStatus] = useState(appointment.status);
    const [tip, setTip] = useState(String(appointment.tip || ''));

    useEffect(() => {
        setStatus(appointment.status);
        setTip(String(appointment.tip || ''));
    }, [appointment]);

    const client = clients.find(c => c.id === appointment.clientId);
    const service = services.find(s => s.id === appointment.serviceId);
    const professional = professionals.find(p => p.id === appointment.professionalId);

    const handleSave = () => {
        onUpdateAppointment(appointment.id, {
            status,
            tip: parseFloat(tip) || 0,
        });
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
            onDelete(appointment.id);
            onClose();
        }
    };
    
    const statusTranslations: Record<AppointmentStatus, string> = {
        pending: 'Pendente',
        confirmed: 'Confirmado',
        'in-progress': 'Em Andamento',
        completed: 'Concluído',
        cancelled: 'Cancelado',
        'no-show': 'Não Compareceu',
    };

    const getStatusBadge = (status: AppointmentStatus) => {
        const styles: Record<AppointmentStatus, string> = {
            pending: 'bg-yellow-500/20 text-yellow-300',
            confirmed: 'bg-blue-500/20 text-blue-300',
            'in-progress': 'bg-purple-500/20 text-purple-300',
            completed: 'bg-green-500/20 text-green-300',
            cancelled: 'bg-red-500/20 text-red-300',
            'no-show': 'bg-gray-500/20 text-gray-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{statusTranslations[status]}</span>;
    };
    
    const paymentStatusTranslations: Record<PaymentStatus, string> = {
        pending: 'Pendente',
        paid: 'Pago',
    };

    const getPaymentStatusBadge = (status: PaymentStatus) => {
        const styles: Record<PaymentStatus, string> = {
            pending: 'bg-yellow-500/20 text-yellow-300',
            paid: 'bg-green-500/20 text-green-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>{paymentStatusTranslations[status]}</span>;
    };


    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Detalhes do Agendamento</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-3 text-gray-200">
                    <p><strong className="text-gray-400 font-medium w-28 inline-block">Cliente:</strong> {client?.name || 'Cliente Sem Nome'}</p>
                    <p><strong className="text-gray-400 font-medium w-28 inline-block">Serviço:</strong> {service?.name || 'Serviço Sem Nome'}</p>
                    <p><strong className="text-gray-400 font-medium w-28 inline-block">Profissional:</strong> {professional?.name || 'Profissional Sem Nome'}</p>
                    <p><strong className="text-gray-400 font-medium w-28 inline-block">Data:</strong> {appointment.startTime?.toLocaleDateString('pt-BR')}</p>
                    <p><strong className="text-gray-400 font-medium w-28 inline-block">Hora:</strong> {appointment.startTime?.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="flex items-center"><strong className="text-gray-400 font-medium w-28 inline-block">Status Atual:</strong> {getStatusBadge(appointment.status)}</p>
                    <p className="flex items-center"><strong className="text-gray-400 font-medium w-28 inline-block">Pagamento:</strong> {getPaymentStatusBadge(appointment.paymentStatus)}</p>

                    <div className="pt-4 border-t border-gray-700/50 space-y-4">
                        <Select label="Alterar Status" id="status-update" value={status} onChange={e => setStatus(e.target.value as AppointmentStatus)}>
                            <option value="pending">Pendente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="in-progress">Em Andamento</option>
                            <option value="completed">Concluído</option>
                            <option value="cancelled">Cancelado</option>
                            <option value="no-show">Não Compareceu</option>
                        </Select>
                        <Input label="Gorjeta (R$)" id="tip" type="number" step="0.01" value={tip} onChange={e => setTip(e.target.value)} placeholder="0.00" />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-6">
                    <Button variant="danger" onClick={handleDelete}>
                        <TrashIcon className="h-4 w-4 mr-2"/>
                        Excluir
                    </Button>
                    <div className="flex items-center gap-4">
                        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button variant="primary" onClick={handleSave}>Salvar Alterações</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};