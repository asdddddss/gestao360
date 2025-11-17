import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';
import { 
    CalendarIcon, 
    DollarSignIcon, 
    UsersIcon, 
    TrendingUpIcon, 
    BotIcon, 
    CheckCircleIcon,
    GlobeIcon,
    XCircleIcon,
    MessageSquareIcon,
    CheckIcon,
    RepeatIcon,
    ArchiveIcon
} from '../lib/icons';

// Header Component
const Header = () => (
    <header className="absolute top-0 left-0 right-0 z-20 py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
            <Logo />
            <nav className="hidden md:flex items-center space-x-6">
                <a href="#features" className="text-gray-300 hover:text-brand-gold transition">Funcionalidades</a>
                <Link to="/pricing" className="text-gray-300 hover:text-brand-gold transition">Planos</Link>
                <a href="#faq" className="text-gray-300 hover:text-brand-gold transition">FAQ</a>
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

// FeatureCard component
const FeatureCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="bg-brand-dark-2 p-6 rounded-lg text-center transform hover:-translate-y-2 transition-transform duration-300">
        <div className="inline-block p-4 bg-brand-gold/10 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{text}</p>
    </div>
);

// FAQItem component
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


// Footer Component
const Footer = () => (
    <footer className="bg-black py-12 border-t border-gray-800">
        <div className="container mx-auto px-6 text-center text-gray-400">
            <Logo className="justify-center mb-4"/>
            <p>Gestão 360 é a plataforma de agendamento online, definitiva para prestadores de serviço. Otimize a sua rotina, reduza as faltas e liberte seu tempo para focar no que realmente importa: o seu cliente.</p>
            <p className="text-sm mt-6">&copy; {new Date().getFullYear()} Gestão 360. Todos os direitos reservados.</p>
        </div>
    </footer>
);


export const LandingPage: React.FC = () => {
    return (
        <div className="bg-brand-dark text-brand-light font-sans">
            <Header />

            <main>
                {/* Hero Section */}
                <section className="relative pt-48 pb-24 text-center bg-brand-dark overflow-hidden">
                    <div className="absolute inset-0 bg-grid-gold/5"></div>
                    <div className="container mx-auto relative px-4">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight animate-fade-in-down">
                            Agendamento e gestão para negócios de sucesso.
                        </h1>
                        <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                           O sistema simples e intuitivo que te ajuda em cada etapa, desde o agendamento do cliente até a gestão completa do seu negócio.
                        </p>
                        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <Link to="/signup">
                                <Button variant="primary" className="px-8 py-3 text-lg">
                                    Comece Agora
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
                
                {/* Social Proof */}
                <section className="py-12 bg-brand-dark-2">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center">
                            <div>
                                <p className="text-3xl font-bold text-brand-gold">3.000+</p>
                                <p className="text-gray-400">Prestadores de Serviço</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-brand-gold">100%</p>
                                <p className="text-gray-400">De satisfação</p>
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-brand-gold">Líder de mercado</p>
                                <p className="text-gray-400">Em número de agendamentos</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-brand-dark">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Funcionalidades que transformam seu negócio</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-12">Ferramentas poderosas e intuitivas que resolvem problemas reais do seu dia a dia e impulsionam seus resultados.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard 
                                icon={<GlobeIcon className="h-8 w-8 text-brand-gold" />}
                                title="Site de Agendamentos Próprio"
                                text="Tenha um site profissional gerado automaticamente com suas informações, onde seus clientes podem agendar 24/7."
                            />
                             <FeatureCard 
                                icon={<MessageSquareIcon className="h-8 w-8 text-brand-gold" />}
                                title="Automações com WhatsApp"
                                text="Reduza as faltas com lembretes automáticos e reative clientes inativos com ofertas especiais, tudo via WhatsApp."
                            />
                            <FeatureCard 
                                icon={<CalendarIcon className="h-8 w-8 text-brand-gold" />}
                                title="Agenda Inteligente"
                                text="Controle múltiplos profissionais, intervalos e bloqueios. Sua agenda pública atualiza tudo em tempo real."
                            />
                            <FeatureCard 
                                icon={<UsersIcon className="h-8 w-8 text-brand-gold" />}
                                title="Gestão de Clientes (CRM)"
                                text="Tenha um histórico completo de cada cliente: serviços, gastos, última visita e identifique clientes inativos."
                            />
                            <FeatureCard 
                                icon={<DollarSignIcon className="h-8 w-8 text-brand-gold" />}
                                title="Financeiro Completo"
                                text="Visualize seu fluxo de caixa, registre despesas, e calcule o pagamento da sua equipe (comissões, salário)."
                            />
                             <FeatureCard 
                                icon={<RepeatIcon className="h-8 w-8 text-brand-gold" />}
                                title="Pacotes e Assinaturas"
                                text="Crie planos mensais e pacotes pré-pagos. Receba adiantado, fidelize clientes e crie uma receita recorrente."
                            />
                            <FeatureCard 
                                icon={<ArchiveIcon className="h-8 w-8 text-brand-gold" />}
                                title="Gestão de Estoque e Vendas"
                                text="Venda produtos no seu negócio. Controle o estoque, registre vendas facilmente e veja os itens mais lucrativos."
                            />
                            <FeatureCard 
                                icon={<TrendingUpIcon className="h-8 w-8 text-brand-gold" />}
                                title="Relatórios e Dashboards"
                                text="Tome decisões baseadas em dados com relatórios de faturamento, ranking de serviços, clientes e produtos."
                            />
                        </div>
                    </div>
                </section>
                
                 {/* Comparison Section */}
                <section className="py-20 bg-brand-dark-2">
                    <div className="container mx-auto px-4 text-center">
                         <h2 className="text-3xl md:text-4xl font-bold text-white mb-12">Existe uma forma mais inteligente de gerenciar.</h2>
                         <div className="flex flex-col md:flex-row justify-center gap-8 max-w-4xl mx-auto">
                            {/* Old Way */}
                            <div className="flex-1 bg-brand-dark p-8 rounded-lg border border-gray-700">
                                <h3 className="text-2xl font-bold text-white mb-6">Outras ferramentas e métodos</h3>
                                <ul className="space-y-4 text-left">
                                    <li className="flex items-center text-gray-400"><XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" /> Agendas de papel e planilhas</li>
                                    <li className="flex items-center text-gray-400"><XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" /> Gestão amadora</li>
                                    <li className="flex items-center text-gray-400"><XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" /> Faltas constantes de clientes</li>
                                    <li className="flex items-center text-gray-400"><XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" /> Falta de gestão financeira</li>
                                    <li className="flex items-center text-gray-400"><XCircleIcon className="h-6 w-6 text-red-500 mr-3 flex-shrink-0" /> Suporte lento e genérico</li>
                                </ul>
                            </div>
                            {/* Gestão 360 Way */}
                            <div className="flex-1 bg-brand-dark p-8 rounded-lg border-2 border-brand-gold">
                                <h3 className="text-2xl font-bold text-brand-gold mb-6">Gestão 360</h3>
                                <ul className="space-y-4 text-left">
                                    <li className="flex items-center text-white"><CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" /> Painel inteligente</li>
                                    <li className="flex items-center text-white"><CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" /> Gestão de clientes e reativação</li>
                                    <li className="flex items-center text-white"><CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" /> Comunicação direta via WhatsApp</li>
                                    <li className="flex items-center text-white"><CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" /> Relatórios e finanças</li>
                                    <li className="flex items-center text-white"><CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" /> Suporte prioritário e rápido</li>
                                </ul>
                            </div>
                         </div>
                    </div>
                </section>
                
                {/* Guarantee Section */}
                <section className="py-16 bg-brand-dark">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Sua satisfação ou seu dinheiro de volta</h2>
                        <p className="text-gray-300">
                            Assine a Gestão 360 hoje e, se por qualquer motivo, dentro de 7 dias, você não estiver 100% satisfeito, basta nos enviar um e-mail e nós devolveremos todo o seu investimento. Simples assim. O risco é todo nosso.
                        </p>
                    </div>
                </section>


                {/* Pricing Teaser Section */}
                <section id="pricing" className="py-20 bg-brand-dark-2">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Planos transparentes para cada fase do seu negócio.</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-8">Escolha o plano ideal para o seu momento, sem surpresas.</p>
                        <Link to="/pricing">
                            <Button variant="primary" className="px-8 py-3 text-lg">
                                Ver todos os planos
                            </Button>
                        </Link>
                    </div>
                </section>
                
                {/* FAQ Section */}
                <section id="faq" className="py-20 bg-brand-dark">
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
                            <FAQItem 
                                question="Como faço para divulgar a minha página de agendamentos?"
                                answer="Ao criar sua conta, a Gestão 360 gera um link personalizado. Você pode compartilhar este link diretamente nas suas redes sociais, no seu perfil do Instagram, no WhatsApp ou em qualquer lugar que seus clientes estejam."
                            />
                        </div>
                    </div>
                </section>

                 {/* CTA Section */}
                <section className="py-20 bg-brand-dark-2">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para profissionalizar seu negócio?</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-8">Sua jornada para uma gestão mais inteligente, começa agora! Leva apenas 2 minutos para começar.</p>
                        <Link to="/signup">
                            <Button variant="primary" className="px-8 py-3 text-lg">
                                Crie sua conta agora
                            </Button>
                        </Link>
                    </div>
                </section>

            </main>
            
            <Footer />
        </div>
    );
};