// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { Product, DisplayableProduct, ProductVariant } from '../types';
import { HeartIcon, ShoppingCartIcon, CompareIcon } from './icons';

interface ProductCardProps {
  product: Product | DisplayableProduct;
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  searchQuery?: string;
  onAddToCart?: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
  viewOptionsText?: string;
  onNotifyMe?: (productId: number) => void;
  notificationList?: number[];
  compareList?: number[];
  onToggleCompare?: (productId: number) => void;
}

const isDisplayableProduct = (p: Product | DisplayableProduct): p is DisplayableProduct => 'parentId' in p;

const ProductCard: React.FC<ProductCardProps> = ({ 
    product, 
    onToggleLike, 
    likedItems, 
    searchQuery, 
    onAddToCart, 
    viewOptionsText = "View Options",
    onNotifyMe,
    notificationList,
    compareList,
    onToggleCompare
}) => {
  let href: string;
  let imageUrl: string;
  let name: string;
  let priceDisplay: string;
  let inStock: boolean;
  let parentId: number;
  let isLiked: boolean;
  let subtitle: string | null = null;
  let hasDiscount = false;
  let discountLabel: string | undefined = undefined;
  let originalPrice: number | undefined = undefined;
  
  const isVariantCard = isDisplayableProduct(product);

  if (isVariantCard) {
    parentId = product.parentId;
    href = `#/product/${parentId}`;
    imageUrl = product.imageUrl;
    name = product.product.name; // Use base product name for a cleaner look
    priceDisplay = `₹${product.price.toLocaleString('en-IN')}`;
    inStock = product.inStock;
    const { RAM, Storage } = product.variant.attributes;
    const details = [Storage, RAM].filter(Boolean).join(' / ');
    if (details) {
        subtitle = details;
    }
    if (product.originalPrice && product.originalPrice > product.price) {
        hasDiscount = true;
        originalPrice = product.originalPrice;
    }
    discountLabel = product.variant.discountLabel;
  } else {
    parentId = product.id;
    href = `#/product/${parentId}`;
    const prices = product.variants.map(v => v.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    priceDisplay = minPrice === maxPrice 
        ? `₹${minPrice.toLocaleString('en-IN')}`
        : `From ₹${minPrice.toLocaleString('en-IN')}`;
    const firstAvailableVariant = product.variants.find(v => (v.inventory || []).some(s => s.quantity > 0));
    inStock = !!firstAvailableVariant;
    imageUrl = firstAvailableVariant?.imageUrl || product.imageUrls[0];
    name = product.name;
    hasDiscount = product.variants.some(v => v.originalPrice && v.originalPrice > v.price);
    discountLabel = product.variants.find(v => v.discountLabel)?.discountLabel;
  }
  
  isLiked = likedItems.includes(parentId);
  const isNotifying = notificationList?.includes(parentId);
  const isInCompare = compareList?.includes(parentId);


  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight || !highlight.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} className="font-bold text-blue-600 bg-blue-100/50 rounded">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when liking
    e.stopPropagation();
    onToggleLike(parentId);
  };
  
  const handleAddToCartClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!onAddToCart) return;

      if (isDisplayableProduct(product)) {
          onAddToCart(product.product, product.variant, e);
      } else {
          // This is a full Product, find the first in-stock variant to add.
          const variantToAdd = product.variants.find(v => (v.inventory || []).some(s => s.quantity > 0));
          if (variantToAdd) {
              onAddToCart(product, variantToAdd, e);
          }
      }
  };

  return (
    <div
      className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.03] transition-all duration-300 flex flex-col h-full group"
    >
      <a href={href} className="flex flex-col flex-grow">
        <div className="relative">
          <div 
            className="p-4 relative overflow-hidden"
          >
            <img 
              className="w-full h-40 object-contain transition-transform duration-300 group-hover:scale-110"
              src={imageUrl} 
              alt={name} 
              loading="lazy"
              decoding="async"
            />
          </div>
          {discountLabel && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                {discountLabel}
            </div>
          )}
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleLikeClick}
              className="p-2 bg-white/80 rounded-full text-gray-600 hover:text-red-500 transition-colors"
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              <HeartIcon className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
            </button>
            {onToggleCompare && compareList && (
                <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleCompare(parentId); }}
                className="p-2 bg-white/80 rounded-full text-gray-600 hover:text-blue-500 transition-colors"
                aria-label={isInCompare ? 'Remove from Compare' : 'Add to Compare'}
                >
                <CompareIcon className={`w-5 h-5 ${isInCompare ? 'text-blue-500' : ''}`} />
                </button>
            )}
          </div>
        </div>
        <div className="p-4 pt-0 flex flex-col flex-grow text-center">
          <div className="mb-2 h-14 flex flex-col justify-center">
            <h3 
              className="text-sm font-semibold text-gray-700"
              title={name}
            >
              {searchQuery ? getHighlightedText(name, searchQuery) : name}
            </h3>
            {subtitle && (
                <p className="text-xs text-gray-600 mt-1 truncate" title={subtitle}>{subtitle}</p>
            )}
          </div>
          <div className="mt-auto">
            <div className="flex items-baseline justify-center gap-2">
                <p className={`text-lg font-bold ${hasDiscount ? 'text-red-600' : 'text-gray-900'}`}>
                    {priceDisplay}
                </p>
                {originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                        ₹{originalPrice.toLocaleString('en-IN')}
                    </p>
                )}
            </div>
             <p className="text-xs text-green-600 font-semibold mt-1">Free Delivery</p>
          </div>
        </div>
      </a>
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 mt-auto">
        {inStock ? (
            onAddToCart ? (
                <button onClick={handleAddToCartClick} className="CartBtn w-full">
                    <span className="IconContainer">
                        <ShoppingCartIcon className="icon h-6 w-6 text-gray-900" />
                    </span>
                    <span className="text">Add to Cart</span>
                </button>
            ) : (
                 <a
                    href={href}
                    className="w-full bg-yellow-400 text-black font-bold py-2 px-4 rounded-md text-sm hover:bg-yellow-500 transition-colors flex items-center justify-center"
                >
                    {viewOptionsText}
                </a>
            )
        ) : (
             onNotifyMe && notificationList ? (
                <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onNotifyMe(parentId); }}
                disabled={isNotifying}
                className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                {isNotifying ? 'On Waitlist' : 'Notify Me'}
                </button>
            ) : (
                <a
                    href={href}
                    className="w-full bg-gray-200 text-gray-600 font-bold py-2 px-4 rounded-md text-sm flex items-center justify-center cursor-pointer hover:bg-gray-300"
                >
                    Notify Me
                </a>
            )
        )}
      </div>
    </div>
  );
};

export default React.memo(ProductCard);