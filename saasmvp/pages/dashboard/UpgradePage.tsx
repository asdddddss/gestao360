
import React from 'react';
import { Card } from '../../components/ui/Card';
import { BotIcon } from '../../lib/icons';

export const UpgradePage: React.FC = () => {
    return (
        <div className="space-y-6 flex flex-col items-center justify-center h-full text-center">
            <Card className="max-w-md">
                <BotIcon className="h-12 w-12 mx-auto text-brand-gold mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Este é um Recurso Premium!</h2>
                <p className="text-gray-400">
                    A funcionalidade de automações com IA está disponível apenas no plano Premium.
                </p>
                <p className="text-gray-400 mt-4">
                    Para fazer o upgrade do seu plano e destravar esta e outras funcionalidades, por favor, entre em contato com nosso suporte.
                </p>
            </Card>
        </div>
    );
};
