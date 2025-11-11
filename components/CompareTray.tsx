import * as React from 'react';
import type { Product } from '../types';

interface CompareTrayProps {
    products: Product[];
    onCompare: () => void;
    onClear: () => void;
    onRemove: (productId: number) => void;
}

const CompareTray: React.FC<CompareTrayProps> = ({ products, onCompare, onClear, onRemove }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-30 animate-tray-slide-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-bold hidden sm:block">Compare Products</h3>
                        {products.map(product => (
                            <div key={product.id} className="relative flex items-center bg-gray-700 p-1 rounded-md">
                                <img src={product.imageUrls[0]} alt={product.name} className="w-12 h-12 object-contain rounded-md" />
                                <button
                                    onClick={() => onRemove(product.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
                                    aria-label={`Remove ${product.name} from comparison`}
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                        {Array.from({ length: 2 - products.length }).map((_, index) => (
                            <div key={`placeholder-${index}`} className="w-14 h-14 bg-gray-700 rounded-md border-2 border-dashed border-gray-500 hidden sm:block"></div>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onCompare}
                            disabled={products.length < 2}
                            className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Compare ({products.length}/2)
                        </button>
                        <button
                            onClick={onClear}
                            className="text-gray-400 hover:text-white text-sm"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompareTray;