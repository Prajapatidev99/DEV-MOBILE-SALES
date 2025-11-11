import * as React from 'react';
import type { Product, ProductVariant } from '../types';
import ProductList from './ProductList';
import { HeartIcon } from './icons';
import AnimateOnScroll from './AnimateOnScroll';

interface WishlistPageProps {
  products: Product[];
  likedItems: number[];
  onToggleLike: (productId: number) => void;
  onNotifyMe: (productId: number) => void;
  notificationList: number[];
  compareList: number[];
  onToggleCompare: (productId: number) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ products, likedItems, onToggleLike, onNotifyMe, notificationList, compareList, onToggleCompare }) => {
  const wishlistProducts = products.filter(p => likedItems.includes(p.id));

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Your Wishlist</h1>
      {wishlistProducts.length > 0 ? (
        <ProductList
          products={wishlistProducts}
          onToggleLike={onToggleLike}
          likedItems={likedItems}
          onNotifyMe={onNotifyMe}
          notificationList={notificationList}
          compareList={compareList}
          onToggleCompare={onToggleCompare}
          viewOptionsText="Make Yours"
        />
      ) : (
        <AnimateOnScroll>
          <div className="text-center bg-white p-12 rounded-lg shadow-md border border-gray-200">
            <HeartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't liked any products yet. Start exploring to find something you love!</p>
            <a
              href="#/shop"
              className="inline-block bg-yellow-400 text-black font-bold py-3 px-8 rounded-md hover:bg-yellow-500 transition-transform transform hover:scale-105 duration-300"
            >
              Make Yours
            </a>
          </div>
        </AnimateOnScroll>
      )}
    </div>
  );
};

export default WishlistPage;