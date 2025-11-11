import * as React from 'react';
import type { Product, ProductVariant } from '../types';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  products: Product[];
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  onNotifyMe: (productId: number) => void;
  notificationList: number[];
  compareList: number[];
  onToggleCompare: (productId: number) => void;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, onToggleLike, likedItems, onNotifyMe, notificationList, compareList, onToggleCompare }) => {
  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <ProductCard 
              product={product}
              onToggleLike={onToggleLike}
              likedItems={likedItems}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;