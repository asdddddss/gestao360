import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { ProductSale } from '../../../types';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

interface ProductSalesReportViewProps {
    startDate?: Date;
    endDate?: Date;
}

export const ProductSalesReportView: React.FC<ProductSalesReportViewProps> = ({ startDate, endDate }) => {
    const { negocio } = useAppData();
    const [sales, setSales] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!negocio || !startDate || !endDate) return;
        setIsLoading(true);

        const start = new Date(startDate); start.setHours(0, 0, 0, 0);
        const end = new Date(endDate); end.setHours(23, 59, 59, 999);
        
        const { data } = await supabase
            .from('product_sales')
            .select('*, products(name)')
            .eq('barbershop_id', negocio.id)
            .gte('created_at', start.toISOString())
            .lte('created_at', end.toISOString())
            .order('created_at', { ascending: false });
            
        setSales(mapFromSupabase<any[]>(data || []));
        setIsLoading(false);
    }, [negocio, startDate, endDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const reportSummary = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.salePriceAtTime * sale.quantity, 0);
        const totalProfit = sales.reduce((sum, sale) => sum + (sale.salePriceAtTime - sale.costPriceAtTime) * sale.quantity, 0);
        return { totalRevenue, totalProfit };
    }, [sales]);

    return (
        <Card>
            <div className="mb-4 flex gap-4">
                <div className="flex-1 p-4 bg-brand-dark rounded-lg text-center">
                    <p className="text-sm text-gray-400">Receita Total de Produtos</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(reportSummary.totalRevenue)}</p>
                </div>
                 <div className="flex-1 p-4 bg-brand-dark rounded-lg text-center">
                    <p className="text-sm text-gray-400">Lucro Total de Produtos</p>
                    <p className="text-2xl font-bold text-brand-gold">{formatCurrency(reportSummary.totalProfit)}</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">Data</th>
                            <th className="p-3">Produto</th>
                            <th className="p-3 text-center">Qtd.</th>
                            <th className="p-3 text-right">Preço Unit.</th>
                            <th className="p-3 text-right">Total Venda</th>
                            <th className="p-3 text-right">Lucro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center">Carregando vendas...</td></tr>
                        ) : sales.length > 0 ? sales.map(sale => {
                            const total = sale.salePriceAtTime * sale.quantity;
                            const profit = (sale.salePriceAtTime - sale.costPriceAtTime) * sale.quantity;
                            return (
                                <tr key={sale.id} className="border-b border-gray-800">
                                    <td className="p-3">{new Date(sale.createdAt).toLocaleString('pt-BR')}</td>
                                    <td className="p-3 font-medium">{sale.products?.name || 'Produto Removido'}</td>
                                    <td className="p-3 text-center">{sale.quantity}</td>
                                    <td className="p-3 text-right">{formatCurrency(sale.salePriceAtTime)}</td>
                                    <td className="p-3 text-right font-semibold text-green-400">{formatCurrency(total)}</td>
                                    <td className="p-3 text-right font-semibold text-brand-gold">{formatCurrency(profit)}</td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma venda de produto encontrada para o período.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
