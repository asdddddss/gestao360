import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { ReportShell } from '../../components/dashboard/reports/ReportShell';
import { DashboardReportView } from '../../components/dashboard/reports/DashboardReportView';
import { RankingReportView } from '../../components/dashboard/reports/RankingReportView';
import { HeatmapReportView } from '../../components/dashboard/reports/HeatmapReportView';
import { FinancialReportView } from '../../components/dashboard/reports/FinancialReportView';
import { ProductSalesReportView } from '../../components/dashboard/reports/ProductSalesReportView';
import { ProductStockReportView } from '../../components/dashboard/reports/ProductStockReportView';
import { ProfessionalPaymentsReportView } from '../../components/dashboard/reports/ProfessionalPaymentsReportView';
import { TrendingUpIcon, DollarSignIcon, UsersIcon, ClipboardListIcon, CalendarIcon, ArchiveIcon } from '../../lib/icons';

// Define a type for a report component that can accept date props and others
type ReportComponentType = React.FC<{ startDate?: Date, endDate?: Date, [key: string]: any }>;

// Define the config item type for better type safety
interface ReportConfig {
    id: string;
    title: string;
    description: string;
    category: string;
    icon: React.ReactNode;
    component: ReportComponentType;
    props?: { [key: string]: any };
}


const reportsConfig: ReportConfig[] = [
    { 
        id: 'dashboard', 
        title: 'Dashboard de Relatórios', 
        description: 'Visão geral da performance do seu negócio.', 
        category: 'Visão Geral', 
        component: DashboardReportView,
        icon: <TrendingUpIcon className="h-8 w-8 text-brand-gold"/>
    },
    // Rankings
    { 
        id: 'ranking_clients', 
        title: 'Ranking de Clientes', 
        description: 'Clientes que mais geraram receita no período.', 
        category: 'Rankings', 
        component: RankingReportView,
        props: { type: 'clients' },
        icon: <UsersIcon className="h-8 w-8 text-brand-gold"/>
    },
    { 
        id: 'ranking_services', 
        title: 'Ranking de Serviços', 
        description: 'Serviços mais vendidos em quantidade e valor.', 
        category: 'Rankings', 
        component: RankingReportView,
        props: { type: 'services' },
        icon: <ClipboardListIcon className="h-8 w-8 text-brand-gold"/>
    },
    { 
        id: 'ranking_professionals', 
        title: 'Ranking de Profissionais', 
        description: 'Profissionais que mais faturaram no período.', 
        category: 'Rankings', 
        component: RankingReportView,
        props: { type: 'professionals' },
        icon: <UsersIcon className="h-8 w-8 text-brand-gold"/>
    },
    { 
        id: 'ranking_products', 
        title: 'Ranking de Produtos', 
        description: 'Produtos mais vendidos por receita no período.', 
        category: 'Rankings', 
        component: RankingReportView,
        props: { type: 'products' },
        icon: <ArchiveIcon className="h-8 w-8 text-brand-gold"/>
    },
    // Agendamentos
    { 
        id: 'heatmap', 
        title: 'Mapa de Calor de Agendamentos', 
        description: 'Visualize os dias e horários de maior movimento.', 
        category: 'Análise de Agendamentos', 
        component: HeatmapReportView,
        icon: <CalendarIcon className="h-8 w-8 text-brand-gold"/>
    },
    // Financeiro
    {
        id: 'financial_period',
        title: 'Relatório Financeiro por Período',
        description: 'Todas as transações (receitas, despesas, etc) no período.',
        category: 'Financeiro',
        component: FinancialReportView,
        icon: <DollarSignIcon className="h-8 w-8 text-brand-gold"/>
    },
    {
        id: 'professional_payments_report',
        title: 'Relatório de Pagamentos',
        description: 'Lista todos os pagamentos fechados para os profissionais no período.',
        category: 'Financeiro',
        component: ProfessionalPaymentsReportView,
        icon: <UsersIcon className="h-8 w-8 text-brand-gold"/>
    },
    // Produtos
    {
        id: 'product_sales',
        title: 'Vendas de Produtos',
        description: 'Relatório detalhado de todos os produtos vendidos no período.',
        category: 'Análise de Produtos',
        component: ProductSalesReportView,
        icon: <ArchiveIcon className="h-8 w-8 text-brand-gold"/>
    },
    {
        id: 'product_stock',
        title: 'Relatório de Estoque',
        description: 'Visão geral do seu estoque atual, valores e lucro potencial.',
        category: 'Análise de Produtos',
        component: ProductStockReportView,
        icon: <ArchiveIcon className="h-8 w-8 text-brand-gold"/>
    },
];

const reportCategories = ['Visão Geral', 'Rankings', 'Análise de Agendamentos', 'Financeiro', 'Análise de Produtos'];

export const ReportsPage: React.FC = () => {
    const [activeReportId, setActiveReportId] = useState<string | null>(null);

    const renderReport = () => {
        if (!activeReportId) return null;

        const reportConfig = reportsConfig.find(r => r.id === activeReportId);
        if (!reportConfig) return null;

        const ReportComponent = reportConfig.component;
        const componentProps = reportConfig.props || {};

        return (
            <ReportShell title={reportConfig.title} onBack={() => setActiveReportId(null)}>
                <ReportComponent {...componentProps} />
            </ReportShell>
        );
    };

    if (activeReportId) {
        return renderReport();
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-white">Central de Relatórios</h2>
                <p className="text-gray-400">Selecione um relatório para analisar a performance do seu negócio.</p>
            </div>

            {reportCategories.map(category => (
                <div key={category}>
                    <h3 className="text-xl font-semibold text-white mb-4">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {reportsConfig.filter(r => r.category === category).map(report => (
                            <Card 
                                key={report.id} 
                                className="cursor-pointer hover:border-brand-gold border-2 border-transparent transition-colors flex flex-col"
                                onClick={() => setActiveReportId(report.id)}
                            >
                                <div className="flex-shrink-0 mb-3">{report.icon}</div>
                                <h4 className="text-lg font-bold text-white">{report.title}</h4>
                                <p className="text-sm text-gray-400 mt-1 flex-grow">{report.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};