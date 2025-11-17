import React, { useState } from 'react';
import { ExpenseLogTab } from '../../components/dashboard/finance/ExpenseLogTab';
import { ExpenseTypesTab } from '../../components/dashboard/finance/ExpenseTypesTab';
import { ProfessionalPaymentsTab } from '../../components/dashboard/finance/ProfessionalPaymentsTab';

type FinanceTab = 'log' | 'types' | 'payments';

export const FinancePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<FinanceTab>('log');

    const renderContent = () => {
        switch (activeTab) {
            case 'log':
                return <ExpenseLogTab />;
            case 'types':
                return <ExpenseTypesTab />;
            case 'payments':
                return <ProfessionalPaymentsTab />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-white">Financeiro</h2>
            </div>

            <div className="border-b border-gray-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('log')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'log'
                                ? 'border-brand-gold text-brand-gold'
                                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Lançamentos
                    </button>
                    <button
                        onClick={() => setActiveTab('types')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'types'
                                ? 'border-brand-gold text-brand-gold'
                                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Tipos de Despesa
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'payments'
                                ? 'border-brand-gold text-brand-gold'
                                : 'border-transparent text-gray-400 hover:text-white hover:border-gray-500'
                        }`}
                    >
                        Pagamentos
                    </button>
                </nav>
            </div>
            
            <div>
                {renderContent()}
            </div>
        </div>
    );
};