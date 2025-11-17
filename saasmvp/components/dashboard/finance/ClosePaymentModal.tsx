import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { XIcon } from '../../../lib/icons';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

interface ClosePaymentModalProps {
    paymentData: any;
    onClose: () => void;
    onConfirm: (paymentData: any, paidAmount: number) => void;
}

const StatRow: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className = '' }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b border-gray-700/50 last:border-b-0">
        <span className="text-gray-400">{label}</span>
        <span className={`font-semibold ${className}`}>{value}</span>
    </div>
);


export const ClosePaymentModal: React.FC<ClosePaymentModalProps> = ({ paymentData, onClose, onConfirm }) => {
    const [paidAmount, setPaidAmount] = useState(paymentData.totalToPay.toFixed(2));
    const [error, setError] = useState('');

    const handleConfirm = () => {
        const amount = parseFloat(paidAmount);
        if (isNaN(amount) || amount < 0) {
            setError('Valor de pagamento inválido.');
            return;
        }
        setError('');
        onConfirm(paymentData, amount);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Fechar Pagamento para {paymentData.professional.name}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-400">Confira os valores calculados para o período e confirme o valor a ser pago.</p>
                    <div className="p-4 bg-brand-dark rounded-md space-y-1">
                        <StatRow label="Receita Gerada" value={formatCurrency(paymentData.revenueGenerated)} />
                        <StatRow label="Comissão" value={formatCurrency(paymentData.commission)} />
                        <StatRow label="Gorjetas" value={formatCurrency(paymentData.totalTips)} />
                        <StatRow label="Salário Base" value={formatCurrency(paymentData.baseSalary)} />
                        <StatRow label="Vales/Adiantamentos" value={`- ${formatCurrency(paymentData.deductions)}`} className="text-red-400" />
                        <div className="pt-2">
                           <StatRow label="Total Calculado" value={formatCurrency(paymentData.totalToPay)} className="text-brand-gold text-lg" />
                        </div>
                    </div>
                    <Input 
                        label="Valor Final do Pagamento (R$)"
                        id="paidAmount"
                        type="number"
                        step="0.01"
                        value={paidAmount}
                        onChange={e => setPaidAmount(e.target.value)}
                        error={error}
                    />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleConfirm}>Confirmar Pagamento</Button>
                </div>
            </div>
        </div>
    );
};