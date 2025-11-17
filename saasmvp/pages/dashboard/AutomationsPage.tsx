import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { BotIcon } from '../../lib/icons';
import { Switch } from '../../components/ui/Switch';
import { useAppData } from '../../hooks/useAppData';
import { Button } from '../../components/ui/Button';

interface AutomationCardProps {
    title: string;
    description: string;
    id: string;
    disabled: boolean;
}

const AutomationCard: React.FC<AutomationCardProps> = ({ title, description, id, disabled }) => {
    const [isEnabled, setIsEnabled] = React.useState(false);

    return (
        <Card className={`flex justify-between items-center ${disabled ? 'opacity-60' : ''}`}>
            <div>
                <h4 className="text-lg font-semibold text-white">{title}</h4>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
            <Switch
                id={id}
                checked={isEnabled}
                onChange={setIsEnabled}
                disabled={disabled}
            />
        </Card>
    );
};


export const AutomationsPage: React.FC = () => {
    const { negocio, user } = useAppData();
    const isAdmin = user?.email === 'admin@admin.com';
    const isPremium = negocio?.plan === 'premium' || isAdmin;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Automações</h2>
                    <p className="text-gray-400">Ative automações com IA para otimizar a gestão do seu negócio.</p>
                </div>
                {!isPremium && (
                     <Link to="/dashboard/upgrade">
                        <Button>Fazer Upgrade para Premium</Button>
                    </Link>
                )}
            </div>

            {!isPremium && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-lg p-4 text-center">
                    <p><span className="font-bold">Funcionalidade Premium:</span> Você pode ver as automações disponíveis, mas precisa do plano Premium para ativá-las.</p>
                </div>
            )}
            
            <div className="space-y-4">
                <AutomationCard 
                    id="confirm-appt"
                    title="Confirmação de Agendamento via WhatsApp"
                    description="Envie uma mensagem automática para o cliente 24h antes do agendamento para confirmação."
                    disabled={!isPremium}
                />
                 <AutomationCard 
                    id="thank-you-msg"
                    title="Mensagem de Agradecimento Pós-Serviço"
                    description="Envie uma mensagem de agradecimento e peça uma avaliação após a conclusão do serviço."
                    disabled={!isPremium}
                />
                 <AutomationCard 
                    id="inactive-client"
                    title="Reativação de Clientes Inativos"
                    description="Envie uma oferta especial para clientes que não agendam há mais de 90 dias."
                    disabled={!isPremium}
                />
                 <AutomationCard 
                    id="birthday-msg"
                    title="Mensagem de Aniversário"
                    description="Envie uma mensagem com um cupom de desconto no aniversário do cliente."
                    disabled={!isPremium}
                />
                <AutomationCard 
                    id="service-billing"
                    title="Cobranças de serviços"
                    description="Cobre o cliente por algum serviço ou plano específico."
                    disabled={!isPremium}
                />
                <AutomationCard 
                    id="recurring-billing"
                    title="Envio automático de cobrança"
                    description="Para configurar cobranças recorrentes."
                    disabled={!isPremium}
                />
            </div>

            <Card className="text-center p-8 mt-8 border-2 border-dashed border-brand-gold/30">
                <BotIcon className="h-12 w-12 mx-auto text-brand-gold mb-4" />
                <h3 className="text-xl font-semibold text-white">Sugira uma Automação</h3>
                <p className="text-gray-400 mt-2">
                   Tem uma ideia para uma nova automação? Em breve você poderá nos contar por aqui!
                </p>
            </Card>
        </div>
    );
};