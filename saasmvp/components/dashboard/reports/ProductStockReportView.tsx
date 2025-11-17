import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppData } from '../../../hooks/useAppData';
import { Card } from '../../ui/Card';
import { supabase } from '../../../lib/supabase';
import { mapFromSupabase } from '../../../lib/mappers';
import type { Product } from '../../../types';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2)}`;

export const ProductStockReportView: React.FC = () => {
    const { negocio } = useAppData();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!negocio) return;
        setIsLoading(true);
        const { data } = await supabase.from('products').select('*').eq('barbershop_id', negocio.id).order('name');
        setProducts(mapFromSupabase<Product[]>(data || []));
        setIsLoading(false);
    }, [negocio]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const reportSummary = useMemo(() => {
        const totalStockCost = products.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0);
        const totalPotentialProfit = products.reduce((sum, p) => sum + (p.salePrice - p.costPrice) * p.stockQuantity, 0);
        return { totalStockCost, totalPotentialProfit };
    }, [products]);

    return (
        <Card>
            <div className="mb-4 flex gap-4">
                <div className="flex-1 p-4 bg-brand-dark rounded-lg text-center">
                    <p className="text-sm text-gray-400">Valor Total do Estoque (a Custo)</p>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(reportSummary.totalStockCost)}</p>
                </div>
                 <div className="flex-1 p-4 bg-brand-dark rounded-lg text-center">
                    <p className="text-sm text-gray-400">Lucro Potencial Total do Estoque</p>
                    <p className="text-2xl font-bold text-brand-gold">{formatCurrency(reportSummary.totalPotentialProfit)}</p>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="border-b border-gray-700">
                        <tr>
                            <th className="p-3">Produto</th>
                            <th className="p-3 text-center">Estoque Atual</th>
                            <th className="p-3 text-right">Preço Custo</th>
                            <th className="p-3 text-right">Preço Venda</th>
                            <th className="p-3 text-right">Valor Estoque (Custo)</th>
                            <th className="p-3 text-right">Lucro Potencial</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-8 text-center">Carregando produtos...</td></tr>
                        ) : products.length > 0 ? products.map(p => {
                            const stockValue = p.costPrice * p.stockQuantity;
                            const potentialProfit = (p.salePrice - p.costPrice) * p.stockQuantity;
                            return (
                                <tr key={p.id} className="border-b border-gray-800">
                                    <td className="p-3 font-medium">{p.name}</td>
                                    <td className={`p-3 text-center font-bold ${p.stockQuantity < p.minStockAlert ? 'text-red-400' : ''}`}>{p.stockQuantity}</td>
                                    <td className="p-3 text-right">{formatCurrency(p.costPrice)}</td>
                                    <td className="p-3 text-right">{formatCurrency(p.salePrice)}</td>
                                    <td className="p-3 text-right font-semibold text-blue-400">{formatCurrency(stockValue)}</td>
                                    <td className="p-3 text-right font-semibold text-brand-gold">{formatCurrency(potentialProfit)}</td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan={6} className="p-8 text-center text-gray-500">Nenhum produto cadastrado.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
