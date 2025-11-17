import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { 
    CheckIcon,
    GlobeIcon,
    CalendarIcon,
    MessageSquareIcon,
    UsersIcon,
    PlaneIcon,
    DollarSignIcon,
    BotIcon,
    ClipboardListIcon
} from '../lib/icons';

// Header Component for this page
const Header = () => (
    <header className="absolute top-0 left-0 right-0 z-20 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
            <Link to="/"><Logo /></Link>
            <nav className="hidden md:flex items-center space-x-6">
                <a href="/#features" className="text-gray-300 hover:text-brand-gold transition">Funcionalidades</a>
                <Link to="/pricing" className="text-brand-gold font-semibold transition">Planos</Link>
                <a href="/#faq" className="text-gray-300 hover:text-brand-gold transition">FAQ</a>
            </nav>
            <div className="flex items-center space-x-4">
                <Link to="/login">
                    <Button variant="secondary" size="sm">Entrar</Button>
                </Link>
                <Link to="/signup">
                    <Button variant="primary" size="sm">Criar Conta</Button>
                </Link>
            </div>
        </div>
    </header>
);

// Footer Component for this page
const Footer = () => (
    <footer className="bg-black py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-400">
            <Logo className="justify-center mb-4"/>
            <p>Gestão 360 é a plataforma de agendamento online, definitiva para prestadores de serviço. Otimize a sua rotina, reduza as faltas e liberte seu tempo para focar no que realmente importa: o seu cliente.</p>
            <p className="text-sm mt-6">&copy; {new Date().getFullYear()} Gestão 360. Todos os direitos reservados.</p>
        </div>
    </footer>
);

// FAQItem component (re-used from LandingPage)
const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
    <details className="bg-brand-dark-2 p-4 rounded-lg cursor-pointer group">
        <summary className="font-semibold text-white flex justify-between items-center">
            {question}
            <span className="transform transition-transform duration-300 group-open:rotate-45">+</span>
        </summary>
        <p className="text-gray-400 mt-2">
            {answer}
        </p>
    </details>
);

const FeatureDetailCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="bg-brand-dark-2 p-6 rounded-lg text-left">
        <div className="flex items-center mb-3">
            <div className="inline-block p-2 bg-brand-gold/10 rounded-full mr-4">
                {icon}
            </div>
            <h4 className="text-lg font-bold text-white">{title}</h4>
        </div>
        <p className="text-gray-400 text-sm">{text}</p>
    </div>
);


export const PricingPage: React.FC = () => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    return (
        <div className="bg-brand-dark text-brand-light font-sans">
            <Header />

            <main>
                {/* Pricing Section */}
                <section id="pricing" className="pt-40 pb-20 bg-brand-dark-2">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Escolha o plano perfeito para o seu crescimento.</h1>
                        <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-12">Planos flexíveis que crescem com você. Sem surpresas ou taxas escondidas.</p>

                        {/* Billing Cycle Toggle */}
                        <div className="flex justify-center items-center p-1 rounded-lg bg-brand-dark max-w-xs mx-auto mb-12">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                    billingCycle === 'monthly' ? 'bg-brand-gold text-brand-dark' : 'text-gray-300 hover:bg-brand-dark-2'
                                }`}
                            >
                                Mensal
                            </button>
                            <button
                                onClick={() => setBillingCycle('annual')}
                                className={`w-1/2 px-4 py-2 text-sm font-semibold rounded-md transition-colors relative ${
                                    billingCycle === 'annual' ? 'bg-brand-gold text-brand-dark' : 'text-gray-300 hover:bg-brand-dark-2'
                                }`}
                            >
                                Anual
                                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    SEM TAXA
                                </span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                            {/* Basic Plan */}
                            <div className="bg-brand-dark p-8 rounded-lg border border-gray-700 flex flex-col">
                                <h3 className="text-2xl font-bold text-white">Básico</h3>
                                <p className="text-gray-400 mt-2 mb-4">Para quem está começando</p>
                                
                                <div className="h-24">
                                {billingCycle === 'monthly' ? (
                                    <>
                                        <p className="text-4xl font-bold text-white">
                                            R$ 49,90
                                            <span className="text-lg font-normal text-gray-400">/mês</span>
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">+ R$ 150,00 de taxa de implementação</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-4xl font-bold text-white">
                                            R$ 49,90
                                            <span className="text-lg font-normal text-gray-400">/mês</span>
                                            <span className="text-xs font-semibold text-gray-400 align-top ml-1">(x12)</span>
                                        </p>
                                        <p className="text-sm text-green-400 mt-2 font-semibold">Sem taxa de implementação no plano anual</p>
                                    </>
                                )}
                                </div>

                                <ul className="space-y-4 text-left mb-8 flex-grow">
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Clientes ilimitados</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Agendamentos ilimitados</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Serviços ilimitados</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Gestão de Clientes (CRM)</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Controle Financeiro</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Suporte ao cliente</li>
                                </ul>
                                <a 
                                    href={billingCycle === 'monthly' ? 'https://www.asaas.com/c/671xkptcyf1ie08l' : 'https://www.asaas.com/c/ed4tanymxn0pv4pa'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="secondary" className="w-full">Começar Agora</Button>
                                </a>
                            </div>

                            {/* Premium Plan */}
                            <div className="bg-brand-dark p-8 rounded-lg border-2 border-brand-gold relative flex flex-col lg:scale-105">
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-dark px-4 py-1 rounded-full text-sm font-bold">MAIS POPULAR</div>
                                <h3 className="text-2xl font-bold text-brand-gold">Premium</h3>
                                <p className="text-gray-400 mt-2 mb-4">Para negócios em crescimento</p>
                                
                                <div className="h-24">
                                {billingCycle === 'monthly' ? (
                                    <>
                                        <p className="text-4xl font-bold text-white">
                                            R$ 149,90
                                            <span className="text-lg font-normal text-gray-400">/mês</span>
                                        </p>
                                        <p className="text-sm text-gray-400 mt-2">+ R$ 150,00 de taxa de implementação</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-4xl font-bold text-white">
                                            R$ 149,90
                                            <span className="text-lg font-normal text-gray-400">/mês</span>
                                            <span className="text-xs font-semibold text-gray-400 align-top ml-1">(x12)</span>
                                        </p>
                                        <p className="text-sm text-green-400 mt-2 font-semibold">Sem taxa de implementação no plano anual</p>
                                    </>
                                )}
                                </div>

                                <ul className="space-y-4 text-left mb-8 flex-grow">
                                    <li className="font-bold text-brand-gold mb-2">Tudo do plano Básico e mais:</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Integração com WhatsApp</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Mensagem de Agradecimento Pós-Serviço</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Reativação de Clientes Inativos</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Mensagem de Aniversário</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Cobranças de serviços</li>
                                    <li className="flex items-center"><CheckIcon className="h-5 w-5 text-brand-gold mr-3"/> Envio automático de cobrança</li>
                                </ul>
                                <a
                                    href={billingCycle === 'monthly' ? 'https://www.asaas.com/c/ypcrv7tsyc5ywvm9' : 'https://www.asaas.com/c/i0otn73jp27utcod'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="primary" className="w-full">Assinar Premium</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* All Features Section */}
                <section className="py-20 bg-brand-dark">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">Funcionalidades completas para transformar seu negócio</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureDetailCard 
                                icon={<GlobeIcon className="h-7 w-7 text-brand-gold" />}
                                title="Agendamento Online 24/7"
                                text="Ofereça um link personalizado para seus clientes agendarem sozinhos, a qualquer hora, em qualquer dia."
                            />
                            <FeatureDetailCard 
                                icon={<CalendarIcon className="h-7 w-7 text-brand-gold" />}
                                title="Agenda Inteligente"
                                text="Controle múltiplos profissionais, serviços, intervalos e bloqueios pontuais em um só lugar, com atualizações em tempo real."
                            />
                            <FeatureDetailCard 
                                icon={<MessageSquareIcon className="h-7 w-7 text-brand-gold" />}
                                title="Lembretes via WhatsApp"
                                text="Reduza as faltas em até 90% com confirmações e lembretes de agendamento enviados automaticamente."
                            />
                            <FeatureDetailCard 
                                icon={<UsersIcon className="h-7 w-7 text-brand-gold" />}
                                title="Gestão de Clientes (CRM)"
                                text="Mantenha um histórico completo de cada cliente: serviços, gastos, e última visita para criar ofertas personalizadas."
                            />
                             <FeatureDetailCard 
                                icon={<PlaneIcon className="h-7 w-7 text-brand-gold" />}
                                title="Site Público Personalizado"
                                text="Tenha um site profissional gerado automaticamente com suas informações, serviços e equipe."
                            />
                            <FeatureDetailCard 
                                icon={<DollarSignIcon className="h-7 w-7 text-brand-gold" />}
                                title="Controle Financeiro Completo"
                                text="Saiba exatamente seu lucro líquido. O painel soma receitas e subtrai despesas e comissões automaticamente."
                            />
                            <FeatureDetailCard 
                                icon={<ClipboardListIcon className="h-7 w-7 text-brand-gold" />}
                                title="Serviços Ilimitados"
                                text="Cadastre quantos serviços seu negócio oferecer, com durações e preços personalizados."
                            />
                            <FeatureDetailCard 
                                icon={<BotIcon className="h-7 w-7 text-brand-gold" />}
                                title="Agradecimento Pós-Serviço"
                                text="Envie uma mensagem de agradecimento e peça uma avaliação automaticamente após a conclusão do serviço."
                            />
                            <FeatureDetailCard 
                                icon={<BotIcon className="h-7 w-7 text-brand-gold" />}
                                title="Reativação de Clientes Inativos"
                                text="Identifique e envie ofertas especiais para clientes que não agendam há um tempo, de forma automática."
                            />
                            <FeatureDetailCard 
                                icon={<BotIcon className="h-7 w-7 text-brand-gold" />}
                                title="Mensagem de Aniversário"
                                text="Programe mensagens com um cupom de desconto para serem enviadas no aniversário de cada cliente."
                            />
                            <FeatureDetailCard 
                                icon={<BotIcon className="h-7 w-7 text-brand-gold" />}
                                title="Cobrança Automatizada"
                                text="Automatize o envio de lembretes e links de pagamento para serviços avulsos ou planos recorrentes."
                            />
                        </div>
                    </div>
                </section>
                
                {/* FAQ Section */}
                <section id="faq" className="py-20 bg-brand-dark-2">
                    <div className="container mx-auto px-4 max-w-3xl">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">Perguntas Frequentes (FAQ)</h2>
                        <div className="space-y-4">
                            <FAQItem 
                                question="O sistema é fácil de usar?"
                                answer="Com certeza. A gente sabe que a rotina é corrida. Por isso, a Gestão 360 foi criada para ser simples e intuitiva. A plataforma tem um visual limpo e direto, onde você encontra tudo o que precisa sem complicação."
                            />
                            <FAQItem 
                                question="A Gestão 360 funciona no meu celular?"
                                answer="Sim! A Gestão 360 é 100% responsiva e funciona perfeitamente em qualquer dispositivo: celular, tablet ou computador. Você pode gerenciar seu negócio de onde estiver, na palma da sua mão."
                            />
                            <FAQItem 
                                question="Posso testar o sistema antes de assinar?"
                                answer="Nós oferecemos uma garantia de satisfação de 7 dias. Se por qualquer motivo você não estiver 100% satisfeito após assinar, basta nos contatar e nós devolveremos todo o seu investimento."
                            />
                             <FAQItem 
                                question="O cliente precisa pagar ou baixar um aplicativo para agendar?"
                                answer="Não. O agendamento para o cliente é totalmente gratuito e sem a necessidade de baixar nada. Ele apenas acessa o link exclusivo do seu negócio, escolhe o serviço e o horário, e pronto. É fácil, rápido e profissional."
                            />
                        </div>
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};