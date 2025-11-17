import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { DatePicker } from '../../ui/DatePicker';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../../lib/mappers';
import type { Professional, Appointment, Service, Transaction, ProfessionalPayment } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { ProfessionalPaymentHistoryModal } from './ProfessionalPaymentHistoryModal';
import { ClosePaymentModal } from './ClosePaymentModal';

const StatRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-700/50 last:border-b-0">
        <span className="text-gray-400">{label}</span>
        <span className={`font-semibold ${className}`}>{value}</span>
    </div>
);

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

const ProfessionalPaymentCard: React.FC<{
    paymentData: any;
    onSaveSettings: (id: string, data: any) => void;
    onClosePayment: () => void;
    isPaid: boolean;
}> = ({ paymentData, onSaveSettings, onClosePayment, isPaid }) => {
    const { professional } = paymentData;
    const [isEditing, setIsEditing] = useState(false);
    const [settings, setSettings] = useState({
        commissionType: professional.commissionType,
        commissionValue: professional.commissionValue || 0,
        baseSalary: professional.baseSalary || 0,
    });
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    useEffect(() => {
        setSettings({
            commissionType: professional.commissionType,
            commissionValue: professional.commissionValue || 0,
            baseSalary: professional.baseSalary || 0,
        });
    }, [professional]);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: name.includes('Value') || name.includes('Salary') ? parseFloat(value) || 0 : value }));
    };

    const handleSave = () => {
        onSaveSettings(professional.id, settings);
        setIsEditing(false);
    };

    return (
        <Card>
            <div className="flex items-center gap-4 mb-4">
                <img src={professional.photoUrl || ''} alt={professional.name || ''} className="w-16 h-16 rounded-full object-cover" />
                <div>
                    <h4 className="text-lg font-bold text-white">{professional.name}</h4>
                    <p className="text-sm text-gray-400">Resumo do Período</p>
                </div>
            </div>
            
            {isEditing ? (
                <div className="space-y-3 mb-4 p-3 bg-brand-dark rounded-md">
                    <Select label="Tipo de Comissão" name="commissionType" value={settings.commissionType} onChange={handleSettingsChange}>
                        <option value="percentage">Percentual (%)</option>
                        <option value="fixed">Fixo (R$)</option>
                    </Select>
                    <Input label="Valor da Comissão" name="commissionValue" type="number" step="0.01" value={settings.commissionValue} onChange={handleSettingsChange} />
                    <Input label="Salário Base" name="baseSalary" type="number" step="0.01" value={settings.baseSalary} onChange={handleSettingsChange} />
                    <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button size="sm" onClick={handleSave}>Salvar Config.</Button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsEditing(true)} className="text-xs text-brand-gold hover:underline mb-4 w-full text-right">Editar Configurações</button>
            )}

            <div className="space-y-1">
                <StatRow label="Receita Gerada" value={formatCurrency(paymentData.revenueGenerated)} />
                <StatRow label="Comissão" value={formatCurrency(paymentData.commission)} />
                <StatRow label="Gorjetas" value={formatCurrency(paymentData.totalTips)} />
                <StatRow label="Salário Base" value={formatCurrency(paymentData.baseSalary)} />
                <StatRow label="Vales/Adiantamentos" value={`- ${formatCurrency(paymentData.deductions)}`} className="text-red-400" />
                <div className="pt-2">
                   <StatRow label="Total a Pagar" value={formatCurrency(paymentData.totalToPay)} className="text-brand-gold text-lg" />
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-2">
                {isPaid ? (
                    <>
                        <div className="text-center font-semibold text-green-400 p-2 rounded-md bg-green-500/10">Pagamento Fechado</div>
                        <Button variant="secondary" size="sm" onClick={onClosePayment}>
                            Pagar Novamente
                        </Button>
                    </>
                ) : (
                    <Button onClick={onClosePayment} disabled={paymentData.totalToPay <= 0}>Fechar Pagamento</Button>
                )}
                <Button variant="secondary" onClick={() => setIsHistoryOpen(true)}>Ver Histórico</Button>
            </div>
            {isHistoryOpen && <ProfessionalPaymentHistoryModal professionalId={professional.id} onClose={() => setIsHistoryOpen(false)} />}
        </Card>
    );
};

const toYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ProfessionalPaymentsTab: React.FC = () => {
    const { negocio } = useAppData();
    const [professionals, setProfessionals] = useState<Professional[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [paymentHistory, setPaymentHistory] = useState<ProfessionalPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

    const [closingPaymentData, setClosingPaymentData] = useState<any | null>(null);

    const fetchData = useCallback(async () => {
        if (!negocio) return;
        setIsLoading(true);
        const [profsRes, apptsRes, servicesRes, transRes, paymentsRes] = await Promise.all([
            supabase.from('professionals').select('*').eq('barbershop_id', negocio.id),
            supabase.from('appointments').select('*').eq('barbershop_id', negocio.id),
            supabase.from('services').select('*').eq('barbershop_id', negocio.id),
            supabase.from('transactions').select('*').eq('barbershop_id', negocio.id).eq('type', 'expense'),
            supabase.from('professional_payments').select('*').eq('barbershop_id', negocio.id),
        ]);
        if (profsRes.data) setProfessionals(mapFromSupabase<Professional[]>(profsRes.data));
        if (apptsRes.data) setAppointments(mapFromSupabase<Appointment[]>(apptsRes.data));
        if (servicesRes.data) setServices(mapFromSupabase<Service[]>(servicesRes.data));
        if (transRes.data) setTransactions(mapFromSupabase<Transaction[]>(transRes.data));
        if (paymentsRes.data) setPaymentHistory(mapFromSupabase<ProfessionalPayment[]>(paymentsRes.data));
        setIsLoading(false);
    }, [negocio]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    const handleSaveSettings = async (id: string, data: any) => {
        const { error } = await supabase.from('professionals').update(mapToSupabase(data)).eq('id', id);
        if (!error) {
            fetchData(); // Refetch to recalculate
        } else {
            alert('Falha ao salvar configurações.');
        }
    };
    
    const confirmAndClosePayment = async (data: any, paidAmount: number) => {
        if (!negocio) return;

        // 1. Create Expense Transaction
        const transactionPayload = {
            barbershop_id: negocio.id,
            type: 'expense' as const,
            amount: paidAmount,
            description: `Pagamento para ${data.professional.name} (Período: ${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')})`,
            date: new Date().toISOString(),
            professional_id: data.professional.id,
        };
        const { data: newTransaction, error: transError } = await supabase.from('transactions').insert(transactionPayload).select().single();
        if (transError || !newTransaction) {
            alert('Erro ao criar a transação de despesa.');
            console.error(transError);
            setClosingPaymentData(null);
            return;
        }

        // 2. Create Payment History Record
        const paymentPayload = {
            barbershop_id: negocio.id,
            professional_id: data.professional.id,
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
            total_to_pay: paidAmount,
            revenue_generated: data.revenueGenerated,
            commission: data.commission,
            tips: data.totalTips,
            base_salary: data.baseSalary,
            deductions: data.deductions,
            transaction_id: newTransaction.id,
        };
        const { error: paymentError } = await supabase.from('professional_payments').insert(paymentPayload);
        if (paymentError) {
            alert('Erro ao salvar o histórico de pagamento. A despesa foi criada, mas o histórico falhou.');
            console.error(paymentError);
        } else {
            alert('Pagamento fechado com sucesso!');
            fetchData();
        }
        setClosingPaymentData(null);
    };

    const paymentData = useMemo(() => {
        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);

        return professionals.map(prof => {
            const profAppointments = appointments.filter(a =>
                a.professionalId === prof.id &&
                a.status === 'completed' &&
                a.startTime &&
                new Date(a.startTime) >= start &&
                new Date(a.startTime) <= end
            );
            
            const revenueGenerated = profAppointments.reduce((sum, a) => sum + (services.find(s => s.id === a.serviceId)?.price || 0), 0);
            const totalTips = profAppointments.reduce((sum, a) => sum + (a.tip || 0), 0);
            let commission = 0;
            if (prof.commissionType === 'percentage' && prof.commissionValue) {
                commission = (revenueGenerated * prof.commissionValue) / 100;
            } else if (prof.commissionType === 'fixed' && prof.commissionValue) {
                commission = profAppointments.length * prof.commissionValue;
            }
            const baseSalary = prof.baseSalary || 0;
            const deductions = transactions.filter(t => t.professionalId === prof.id && t.date && new Date(t.date) >= start && new Date(t.date) <= end).reduce((sum, t) => sum + t.amount, 0);
            const totalToPay = (baseSalary + commission + totalTips) - deductions;

            return { professional: prof, revenueGenerated, totalTips, commission, baseSalary, deductions, totalToPay };
        });
    }, [professionals, appointments, services, transactions, startDate, endDate]);
    
    const paidInPeriod = useMemo(() => {
        const startYMD = toYMD(startDate);
        const endYMD = toYMD(endDate);
        
        return new Set(paymentHistory
            .filter(p => toYMD(new Date(p.startDate)) === startYMD && toYMD(new Date(p.endDate)) === endYMD)
            .map(p => p.professionalId)
        );
    }, [paymentHistory, startDate, endDate]);

    if (isLoading) return <p>Calculando pagamentos...</p>;

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Pagamentos dos Profissionais</h3>
                        <p className="text-sm text-gray-400">Calcule e feche o pagamento da sua equipe com base em comissões, gorjetas e salário.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <DatePicker label="" selectedDate={startDate} onDateChange={setStartDate} />
                        <span className="pt-5 text-gray-400">até</span>
                        <DatePicker label="" selectedDate={endDate} onDateChange={setEndDate} />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paymentData.map(data => (
                    <ProfessionalPaymentCard
                        key={data.professional.id}
                        paymentData={data}
                        onSaveSettings={handleSaveSettings}
                        onClosePayment={() => setClosingPaymentData(data)}
                        isPaid={paidInPeriod.has(data.professional.id)}
                    />
                ))}
            </div>
            {closingPaymentData && (
                <ClosePaymentModal
                    paymentData={closingPaymentData}
                    onClose={() => setClosingPaymentData(null)}
                    onConfirm={confirmAndClosePayment}
                />
            )}
        </div>
    );
};