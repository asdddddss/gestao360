import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { TrashIcon, EditIcon, DollarSignIcon, ArchiveIcon, TrendingUpIcon } from '../../lib/icons';
import type { Product, ProductSale } from '../../types';
import { supabase } from '../../lib/supabase';
import { mapFromSupabase, mapToSupabase } from '../../lib/mappers';
import { ProductSaleModal } from '../../components/dashboard/ProductSaleModal';

// --- MODAL PARA ADICIONAR/EDITAR PRODUTO ---
interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (productData: Omit<Product, 'id' | 'negocioId'>, id?: string) => Promise<void>;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '', stockQuantity: '', salePrice: '', costPrice: '', minStockAlert: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                stockQuantity: String(product.stockQuantity),
                salePrice: String(product.salePrice),
                costPrice: String(product.costPrice),
                minStockAlert: String(product.minStockAlert),
            });
        } else {
             setFormData({ name: '', stockQuantity: '', salePrice: '', costPrice: '', minStockAlert: '' });
        }
    }, [product]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório.';
        if (isNaN(Number(formData.stockQuantity)) || Number(formData.stockQuantity) < 0) newErrors.stockQuantity = 'Valor inválido.';
        if (isNaN(Number(formData.salePrice)) || Number(formData.salePrice) < 0) newErrors.salePrice = 'Valor inválido.';
        if (isNaN(Number(formData.costPrice)) || Number(formData.costPrice) < 0) newErrors.costPrice = 'Valor inválido.';
        if (isNaN(Number(formData.minStockAlert)) || Number(formData.minStockAlert) < 0) newErrors.minStockAlert = 'Valor inválido.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        onSave({
            name: formData.name,
            stockQuantity: Number(formData.stockQuantity),
            salePrice: Number(formData.salePrice),
            costPrice: Number(formData.costPrice),
            minStockAlert: Number(formData.minStockAlert),
        }, product?.id);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4 text-white">{product ? 'Editar Produto' : 'Novo Produto'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Nome do Produto" id="name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Estoque Atual" id="stockQuantity" name="stockQuantity" type="number" value={formData.stockQuantity} onChange={handleChange} error={errors.stockQuantity} />
                         <Input label="Alerta Mínimo" id="minStockAlert" name="minStockAlert" type="number" value={formData.minStockAlert} onChange={handleChange} error={errors.minStockAlert} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Preço de Custo (R$)" id="costPrice" name="costPrice" type="number" step="0.01" value={formData.costPrice} onChange={handleChange} error={errors.costPrice} />
                        <Input label="Preço de Venda (R$)" id="salePrice" name="salePrice" type="number" step="0.01" value={formData.salePrice} onChange={handleChange} error={errors.salePrice} />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- CARD DE ESTATÍSTICA ---
const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; prefix?: string }> = ({ icon, title, value, prefix }) => (
    <Card className="p-4">
        <div className="flex justify-between items-start">
            <p className="text-sm text-gray-400">{title}</p>
            <div className="text-gray-500">{icon}</div>
        </div>
        <p className="text-3xl font-bold text-white mt-2">
            {prefix && <span className="text-xl mr-1">{prefix}</span>}
            {value}
        </p>
    </Card>
);

// --- COMPONENTE PRINCIPAL DA PÁGINA ---
export const StorePage: React.FC = () => {
    const { negocio } = useAppData();
    const [products, setProducts] = useState<Product[]>([]);
    const [sales, setSales] = useState<ProductSale[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const fetchProducts = useCallback(async () => {
        if (!negocio) return;
        setIsLoading(true);
        const [productsRes, salesRes] = await Promise.all([
             supabase.from('products').select('*').eq('barbershop_id', negocio.id).order('name'),
             supabase.from('product_sales').select('*').eq('barbershop_id', negocio.id)
        ]);
        if (productsRes.data) setProducts(mapFromSupabase<Product[]>(productsRes.data));
        if (salesRes.data) setSales(mapFromSupabase<ProductSale[]>(salesRes.data));
        setIsLoading(false);
    }, [negocio]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const stats = useMemo(() => {
        const totalStockValue = products.reduce((sum, p) => sum + (p.costPrice * p.stockQuantity), 0);
        const belowMinimum = products.filter(p => p.stockQuantity < p.minStockAlert).length;
        const potentialProfit = products.reduce((sum, p) => sum + ((p.salePrice - p.costPrice) * p.stockQuantity), 0);
        return { totalStockValue, belowMinimum, potentialProfit };
    }, [products]);

    const productRanking = useMemo(() => {
        const rankingMap = new Map<string, { name: string, profit: number, revenue: number, quantity: number }>();
        sales.forEach(sale => {
            const product = products.find(p => p.id === sale.productId);
            if (product) {
                const saleProfit = (sale.salePriceAtTime - sale.costPriceAtTime) * sale.quantity;
                const saleRevenue = sale.salePriceAtTime * sale.quantity;

                const current = rankingMap.get(product.id) || { name: product.name, profit: 0, revenue: 0, quantity: 0 };
                current.profit += saleProfit;
                current.revenue += saleRevenue;
                current.quantity += sale.quantity;
                rankingMap.set(product.id, current);
            }
        });
        return Array.from(rankingMap.values()).sort((a,b) => b.profit - a.profit);
    }, [sales, products]);

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'negocioId'>, id?: string) => {
        if (!negocio) return;
        if (id) { // Update
            const { data: updated, error } = await supabase.from('products').update(mapToSupabase(productData)).eq('id', id).select().single();
            if (updated && !error) setProducts(products.map(p => p.id === id ? mapFromSupabase<Product>(updated) : p));
        } else { // Create
            const { data: newProd, error } = await supabase.from('products').insert({ ...mapToSupabase(productData), barbershop_id: negocio.id }).select().single();
            if (newProd && !error) setProducts([...products, mapFromSupabase<Product>(newProd)]);
        }
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = async (id: string) => {
        if(window.confirm('Tem certeza? Esta ação não pode ser desfeita.')) {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (!error) setProducts(products.filter(p => p.id !== id));
        }
    };

    const handleSaveSale = async (cart: { product: Product, quantity: number }[]) => {
        if (!negocio || cart.length === 0) return;
        const totalAmount = cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);

        try {
            // 1. Create transaction
            const { data: transaction, error: transError } = await supabase
                .from('transactions')
                .insert({
                    barbershop_id: negocio.id,
                    type: 'revenue',
                    amount: totalAmount,
                    description: `Venda de ${cart.reduce((sum, i) => sum + i.quantity, 0)} produto(s).`,
                    date: new Date().toISOString(),
                    source_type: 'product_sale',
                })
                .select('id')
                .single();
            
            if (transError || !transaction) throw transError || new Error("Falha ao criar transação.");

            const transactionId = transaction.id;

            // 2. Create product_sales records
            const salesData = cart.map(item => ({
                barbershop_id: negocio.id,
                transaction_id: transactionId,
                product_id: item.product.id,
                quantity: item.quantity,
                sale_price_at_time: item.product.salePrice,
                cost_price_at_time: item.product.costPrice,
            }));
            const { error: salesError } = await supabase.from('product_sales').insert(salesData);
            if (salesError) throw salesError;

            // 3. Update stock for each product
            const stockUpdates = cart.map(item => 
                supabase
                    .from('products')
                    .update({ stock_quantity: item.product.stockQuantity - item.quantity })
                    .eq('id', item.product.id)
            );
            await Promise.all(stockUpdates);

            alert('Venda registrada com sucesso!');
        } catch (error: any) {
            console.error("Sale Error:", error);
            alert(`Erro ao registrar venda: ${error.message}`);
        } finally {
            // 4. Close modal and refetch data
            setIsSaleModalOpen(false);
            fetchProducts();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Gestão de Estoque</h2>
                </div>
                <div className="flex gap-4">
                    <Button variant="secondary" onClick={() => setIsSaleModalOpen(true)}>Registrar Venda</Button>
                    <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}>Adicionar Produto</Button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<DollarSignIcon className="h-6 w-6"/>} title="Valor Total em Estoque (Custo)" value={stats.totalStockValue.toFixed(2)} prefix="R$" />
                <StatCard icon={<ArchiveIcon className="h-6 w-6"/>} title="Produtos Abaixo do Mínimo" value={stats.belowMinimum} />
                <StatCard icon={<TrendingUpIcon className="h-6 w-6"/>} title="Lucro Potencial em Estoque" value={stats.potentialProfit.toFixed(2)} prefix="R$"/>
            </div>

            <Card>
                <h3 className="text-xl font-semibold mb-4">Produtos</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr>
                                <th className="p-3">Nome</th><th className="p-3">Estoque</th><th className="p-3">Preço Venda</th>
                                <th className="p-3">Preço Custo</th><th className="p-3">Alerta Mínimo</th><th className="p-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="text-center p-8">Carregando...</td></tr>
                            ) : products.length > 0 ? products.map(product => (
                                <tr key={product.id} className="border-b border-gray-800">
                                    <td className="p-3 font-medium">{product.name}</td>
                                    <td className={`p-3 ${product.stockQuantity < product.minStockAlert ? 'text-red-400 font-bold' : ''}`}>{product.stockQuantity}</td>
                                    <td className="p-3">R$ {product.salePrice.toFixed(2)}</td>
                                    <td className="p-3">R$ {product.costPrice.toFixed(2)}</td>
                                    <td className="p-3">{product.minStockAlert}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => { setEditingProduct(product); setIsModalOpen(true); }} title="Editar"><EditIcon className="h-5 w-5 text-gray-400 hover:text-white" /></button>
                                            <button onClick={() => handleDeleteProduct(product.id)} title="Excluir"><TrashIcon className="h-5 w-5 text-red-500 hover:text-red-400" /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="text-center p-8 text-gray-500">Nenhum produto cadastrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            
            <Card>
                <h3 className="text-xl font-semibold mb-4">Ranking de Produtos Mais Lucrativos</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700">
                            <tr><th className="p-3">Produto</th><th className="p-3">Lucro</th><th className="p-3">Receita</th><th className="p-3">Quantidade</th></tr>
                        </thead>
                        <tbody>
                            {productRanking.length > 0 ? productRanking.map(item => (
                                <tr key={item.name} className="border-b border-gray-800">
                                    <td className="p-3 font-medium">{item.name}</td>
                                    <td className="p-3 text-green-400">R$ {item.profit.toFixed(2)}</td>
                                    <td className="p-3">R$ {item.revenue.toFixed(2)}</td>
                                    <td className="p-3">{item.quantity}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={4} className="text-center p-8 text-gray-500">Sem dados no período.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && <ProductModal product={editingProduct} onClose={() => setIsModalOpen(false)} onSave={handleSaveProduct} />}
            {isSaleModalOpen && <ProductSaleModal products={products} onClose={() => setIsSaleModalOpen(false)} onSave={handleSaveSale} />}
        </div>
    );
};