import React from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Logo } from '../../components/ui/Logo';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const PendingApprovalPage: React.FC = () => {
    const { logout } = useAppData();
    return (
        <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-4 text-center">
            <Logo className="mb-8" />
            <Card className="max-w-md">
                <h1 className="text-2xl font-bold text-white mb-4">
                    Conta em Análise
                </h1>
                <p className="text-gray-300 mb-6">
                    Obrigado por se cadastrar! Sua conta está atualmente pendente de aprovação pela nossa equipe.
                    Você receberá um email assim que sua conta for ativada.
                </p>
                <Button variant="secondary" onClick={logout}>
                    Sair
                </Button>
            </Card>
        </div>
    );
};
