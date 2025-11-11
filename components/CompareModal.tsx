import * as React from 'react';
import type { Product, ProductVariant } from '../types';
import { ShoppingCartIcon, StarIcon, HeartIcon } from './icons';

interface CompareModalProps {
    products: Product[];
    onClose: () => void;
    onAddToCart: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
    onToggleLike: (productId: number) => void;
    likedItems: number[];
}

const CompareModal: React.FC<CompareModalProps> = ({ products, onClose, onAddToCart, onToggleLike, likedItems }) => {

    const specKeys: (keyof Product['specifications'])[] = ['display', 'camera', 'processor', 'battery'];

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-2xl font-bold">Compare Products</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black text-3xl transition-colors">&times;</button>
                </header>
                
                <div className="overflow-y-auto custom-scrollbar">
                    <div className="overflow-x-auto p-1">
                        <table className="w-full text-left compare-table min-w-[600px]">
                            <thead>
                                <tr>
                                    <th className="w-1/4">Feature</th>
                                    {products.map(p => (
                                        <th key={p.id} className="text-center">
                                            <a href={`#/product/${p.id}`} onClick={onClose}>
                                                <img src={p.imageUrls[0]} alt={p.name} className="w-32 h-32 object-contain mx-auto mb-2" loading="lazy" decoding="async" />
                                                <p className="font-bold text-blue-600 hover:underline">{p.name}</p>
                                            </a>
                                        </th>
                                    ))}
                                    {products.length < 2 && <th></th>}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Price</td>
                                    {products.map(p => <td key={p.id} className="text-center font-bold text-lg">From ₹{Math.min(...p.variants.map(v => v.price)).toLocaleString('en-IN')}</td>)}
                                    {products.length < 2 && <td></td>}
                                </tr>
                                <tr>
                                    <td>Rating</td>
                                    {products.map(p => (
                                        <td key={p.id} className="text-center">
                                            <div className="flex items-center justify-center">
                                                <StarIcon className="w-5 h-5 text-yellow-400 mr-1" />
                                                <span>{p.rating} ({p.reviews.length} reviews)</span>
                                            </div>
                                        </td>
                                    ))}
                                    {products.length < 2 && <td></td>}
                                </tr>
                                <tr>
                                    <td>Brand</td>
                                    {products.map(p => <td key={p.id} className="text-center">{p.brand}</td>)}
                                    {products.length < 2 && <td></td>}
                                </tr>
                                {specKeys.map(key => (
                                    <tr key={key}>
                                        <td className="capitalize">{key}</td>
                                        {products.map(p => (
                                            <td key={p.id} className="text-center">{p.specifications[key]}</td>
                                        ))}
                                        {products.length < 2 && <td></td>}
                                    </tr>
                                ))}
                                <tr>
                                    <td></td>
                                    {products.map(p => (
                                        <td key={p.id} className="text-center p-4">
                                            <button
                                                onClick={(e) => onAddToCart(p, p.variants[0], e)}
                                                className="CartBtn mx-auto"
                                            >
                                                <span className="IconContainer">
                                                    <ShoppingCartIcon className="icon h-6 w-6 text-gray-900" />
                                                </span>
                                                <span className="text">Add to Cart</span>
                                            </button>
                                            <button onClick={() => onToggleLike(p.id)} className="mt-2 text-sm text-gray-600 hover:text-red-500 flex items-center justify-center w-full">
                                                <HeartIcon className={`w-4 h-4 mr-1 ${likedItems.includes(p.id) ? 'text-red-500 fill-current' : ''}`} />
                                                {likedItems.includes(p.id) ? 'In Wishlist' : 'Add to Wishlist'}
                                            </button>
                                        </td>
                                    ))}
                                    {products.length < 2 && <td></td>}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareModal;