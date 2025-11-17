import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import type { Product } from '../../types';
import { XIcon, TrashIcon } from '../../lib/icons';

interface ProductSaleModalProps {
    products: Product[];
    onClose: () => void;
    onSave: (cart: { product: Product, quantity: number }[]) => Promise<void>;
}

type CartItem = {
    product: Product;
    quantity: number;
};

export const ProductSaleModal: React.FC<ProductSaleModalProps> = ({ products, onClose, onSave }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return [];
        const cartProductIds = new Set(cart.map(item => item.product.id));
        return products
            .filter(p => !cartProductIds.has(p.id) && p.stockQuantity > 0)
            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, products, cart]);

    const addToCart = (product: Product) => {
        setCart(prev => [...prev, { product, quantity: 1 }]);
        setSearchTerm('');
    };

    const updateQuantity = (productId: string, newQuantity: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const updatedQuantity = Math.max(1, Math.min(newQuantity, item.product.stockQuantity));
                return { ...item, quantity: updatedQuantity };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const total = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    }, [cart]);

    const handleSubmit = async () => {
        if (cart.length === 0) return;
        setIsSaving(true);
        await onSave(cart);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-brand-dark-2 rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Registrar Venda de Produto</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><XIcon className="h-6 w-6" /></button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Input
                            label="Buscar Produto"
                            id="product-search"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Digite o nome do produto..."
                        />
                        {searchTerm && filteredProducts.length > 0 && (
                            <ul className="absolute z-10 w-full bg-brand-dark border border-gray-700 rounded-md mt-1 max-h-48 overflow-y-auto">
                                {filteredProducts.map(p => (
                                    <li key={p.id} onClick={() => addToCart(p)} className="p-2 hover:bg-brand-dark-2 cursor-pointer">
                                        {p.name} <span className="text-xs text-gray-400">(Estoque: {p.stockQuantity})</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                        {cart.length === 0 ? (
                            <p className="text-center text-gray-500 py-4">Nenhum produto na venda.</p>
                        ) : cart.map(item => (
                            <div key={item.product.id} className="flex items-center gap-4 p-2 bg-brand-dark rounded-md">
                                <span className="flex-grow font-medium">{item.product.name}</span>
                                <Input
                                    label=""
                                    type="number"
                                    min="1"
                                    max={item.product.stockQuantity}
                                    value={item.quantity}
                                    onChange={e => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                    className="w-20"
                                />
                                <span className="w-24 text-right">R$ {(item.product.salePrice * item.quantity).toFixed(2)}</span>
                                <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-400">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-gray-700 flex justify-end items-center font-bold text-lg">
                        <span>Total: </span>
                        <span className="ml-2 text-brand-gold">R$ {total.toFixed(2)}</span>
                    </div>

                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button type="button" onClick={handleSubmit} disabled={cart.length === 0 || isSaving}>
                        {isSaving ? 'Salvando...' : 'Confirmar Venda'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
