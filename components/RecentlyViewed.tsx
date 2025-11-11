import * as React from 'react';
import type { Product, ProductVariant } from '../types';
import ProductCard from './ProductCard';

interface RecentlyViewedProps {
  products: Product[];
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  onAddToCart: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
}

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ products, likedItems, onToggleLike, onAddToCart }) => {
    const scrollContainer = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="my-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Recently Viewed</h2>
                <div className="flex space-x-2">
                    <button onClick={() => scroll('left')} className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => scroll('right')} className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
            <div ref={scrollContainer} className="flex overflow-x-auto space-x-6 pb-4 custom-scrollbar -mx-6 px-6">
                {products.map((product) => (
                    <div key={product.id} className="flex-shrink-0 w-48 sm:w-60">
                        <ProductCard
                            product={product}
                            likedItems={likedItems}
                            onToggleLike={onToggleLike}
                            onAddToCart={onAddToCart}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
export default RecentlyViewed;