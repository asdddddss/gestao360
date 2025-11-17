import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { ProfessionalPayment } from '../../../types';
import { XIcon } from '../../../lib/icons';
import { Button } from '../../ui/Button';

interface ProfessionalPaymentHistoryModalProps {
    professionalId: string;
    onClose: () => void;
}

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;
const formatDate = (date: Date) => new Date(date).toLocaleDateString('pt-BR');

export const ProfessionalPaymentHistoryModal: React.FC<ProfessionalPaymentHistoryModalProps> = ({ professionalId, onClose }) => {
    const [history, setHistory] = useState<ProfessionalPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('professional_payments')
                .select('*')
                .eq('professional_id', professionalId)
                .order('payment_date', { ascending: false });
            
            if (data) {
                setHistory(mapFromSupabase<ProfessionalPayment[]>(data));
            }
            setIsLoading(false);
        };
        fetchHistory();
    }, [professionalId]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Histórico de Pagamentos</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    {isLoading ? <p>Carregando histórico...</p> : history.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-brand-dark-2 border-b border-gray-700">
                                <tr>
                                    <th className="p-3">Data do Pagamento</th>
                                    <th className="p-3">Período</th>
                                    <th className="p-3 text-right">Valor Pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(payment => (
                                    <tr key={payment.id} className="border-b border-gray-800">
                                        <td className="p-3">{formatDate(payment.paymentDate)}</td>
                                        <td className="p-3">{`${formatDate(payment.startDate)} - ${formatDate(payment.endDate)}`}</td>
                                        <td className="p-3 text-right font-semibold text-brand-gold">{formatCurrency(payment.totalToPay)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-400 py-8">Nenhum pagamento registrado.</p>
                    )}
                </div>
                 <div className="flex justify-end mt-6">
                    <Button variant="secondary" onClick={onClose}>Fechar</Button>
                </div>
            </div>
        </div>
    );
};