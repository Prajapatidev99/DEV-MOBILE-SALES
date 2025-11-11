  // FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
  import * as React from 'react';
  import type { Product, ProductVariant, DisplayableProduct } from '../types';
  import ProductCard from './ProductCard';

  interface ProductListProps {
    products: (Product | DisplayableProduct)[];
    onToggleLike: (productId: number) => void;
    likedItems: number[];
    searchQuery?: string;
    onNotifyMe: (productId: number) => void;
    notificationList: number[];
    compareList: number[];
    onToggleCompare: (productId: number) => void;
    onAddToCart?: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
    viewOptionsText?: string;
  }

  const ProductList: React.FC<ProductListProps> = ({ products, onToggleLike, likedItems, searchQuery, onAddToCart, viewOptionsText, onNotifyMe, notificationList, compareList, onToggleCompare }) => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div 
            key={'id' in product ? product.id : product.uniqueId}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <ProductCard 
              product={product} 
              onToggleLike={onToggleLike}
              likedItems={likedItems}
              searchQuery={searchQuery}
              onAddToCart={onAddToCart}
              viewOptionsText={viewOptionsText}
              onNotifyMe={onNotifyMe}
              notificationList={notificationList}
              compareList={compareList}
              onToggleCompare={onToggleCompare}
            />
          </div>
        ))}
      </div>
    );
  };

  export default ProductList;