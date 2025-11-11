// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { Product, ProductVariant } from '../types';
import ProductCard from './ProductCard';

interface FeaturedProductsProps {
  products: Product[];
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  onNotifyMe: (productId: number) => void;
  notificationList: number[];
  compareList: number[];
  onToggleCompare: (productId: number) => void;
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products, onToggleLike, likedItems, onNotifyMe, notificationList, compareList, onToggleCompare }) => {
  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-100">Featured Products</h2>
      <div className="flex overflow-x-auto space-x-8 pb-4 -mx-4 px-4 scrollbar-thin">
        {products.map((product, index) => (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-80 animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <ProductCard 
              product={product}
              onToggleLike={onToggleLike}
              isLiked={likedItems.includes(product.id)}
              onNotifyMe={onNotifyMe}
              notificationList={notificationList}
              compareList={compareList}
              onToggleCompare={onToggleCompare}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;