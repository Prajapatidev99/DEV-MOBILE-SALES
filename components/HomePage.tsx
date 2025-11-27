// FIX: Changed React import to `import React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import React, { Suspense } from 'react';
import type { Product, DisplayableProduct, HomepageConfig, ProductVariant } from '../types';
import HeroBanner from './HeroBanner';
import ProductCard from './ProductCard';
import AnimateOnScroll from './AnimateOnScroll';

// Lazy load non-critical components
const BrandSlider = React.lazy(() => import('./BrandSlider'));
const PromotionalBanners = React.lazy(() => import('./PromotionalBanners'));
const RecentlyViewed = React.lazy(() => import('./RecentlyViewed'));

interface ProductCarouselProps {
  title: string;
  products: DisplayableProduct[];
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  onAddToCart: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
  onNotifyMe?: (productId: number) => void;
  notificationList?: number[];
  compareList?: number[];
  onToggleCompare?: (productId: number) => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, onToggleLike, likedItems, onAddToCart, onNotifyMe, notificationList, compareList, onToggleCompare }) => {
    const scrollContainer = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainer.current) {
            const scrollAmount = direction === 'left' ? -300 : 300;
            scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="my-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
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
                    <div 
                        key={product.uniqueId} 
                        className="flex-shrink-0 w-48 sm:w-60"
                    >
                        <ProductCard 
                            product={product}
                            likedItems={likedItems}
                            onToggleLike={onToggleLike}
                            onAddToCart={onAddToCart}
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

const CarouselSkeleton: React.FC<{ title: string }> = ({ title }) => (
    <div className="my-8 bg-white p-6 rounded-lg border border-gray-200 shadow-sm animate-pulse-glow">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex overflow-x-hidden space-x-6 pb-4 -mx-6 px-6">
            {[...Array(4)].map((_, index) => (
                <div key={index} className="flex-shrink-0 w-48 sm:w-60">
                     <div className="bg-gray-200 rounded-lg h-64"></div>
                </div>
            ))}
        </div>
    </div>
);

interface HomePageProps {
  homepageConfig: HomepageConfig | null;
  allProducts: DisplayableProduct[];
  brands: string[];
  onBrandSelect: (brand: string) => void;
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  recentlyViewedProducts: Product[];
  recommendedProducts: Product[];
  isRecommendationsLoading: boolean;
  onNotifyMe: (productId: number) => void;
  notificationList: number[];
  compareList: number[];
  onToggleCompare: (productId: number) => void;
  onAddToCart: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
}

const HomePage: React.FC<HomePageProps> = ({ homepageConfig, allProducts, brands, onBrandSelect, onToggleLike, likedItems, recentlyViewedProducts, recommendedProducts, isRecommendationsLoading, onNotifyMe, notificationList, compareList, onToggleCompare, onAddToCart }) => {
  const [scrollOffset, setScrollOffset] = React.useState(0);

  React.useEffect(() => {
      const handleScroll = () => {
          setScrollOffset(window.pageYOffset);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
          window.removeEventListener('scroll', handleScroll);
      };
  }, []);

  if (!allProducts || allProducts.length === 0 || !homepageConfig) {
    return <div>Loading...</div>;
  }
  
  const newlyLaunched = [...allProducts].sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).slice(0, 10);
  
  // FIX: Filter 'bestSelling' to strictly include only Smartphones.
  // Previously it was sorting all products, causing watches to appear in the "Best Selling Phones" section.
  const bestSelling = allProducts
    .filter(p => p.product.category === 'Smartphones')
    .sort((a,b) => b.rating - a.rating)
    .slice(0, 10);

  const topSmartWatches = allProducts.filter(p => p.product.category === 'Smartwatches').slice(0, 10);
  const refurbishedDeals = allProducts.filter(p => p.product.category === 'Refurbished Phones').slice(0, 10);
  
  // FIX: Converted recommendedProducts (Product[]) to DisplayableProduct[] to match carousel prop types.
  const recommendedDisplayableProducts = React.useMemo(() => {
    if (!recommendedProducts || recommendedProducts.length === 0) return [];
    const recommendedProductIds = new Set(recommendedProducts.map(p => p.id));
    // Filter allProducts to find the displayable versions, ensuring one variant per product.
    const uniqueRecs: DisplayableProduct[] = [];
    const addedParentIds = new Set<number>();
    allProducts.forEach(dp => {
      if (recommendedProductIds.has(dp.parentId) && !addedParentIds.has(dp.parentId)) {
        uniqueRecs.push(dp);
        addedParentIds.add(dp.parentId);
      }
    });
    return uniqueRecs;
  }, [recommendedProducts, allProducts]);

  // FIX: Added a fallback. If AI recommendations are empty, show the top 5 best-selling products instead.
  const recommendationsOrFallback = recommendedDisplayableProducts.length > 0
    ? recommendedDisplayableProducts
    : bestSelling.slice(0, 5);

  return (
    <div className="space-y-4">
      <HeroBanner 
        title={homepageConfig.hero.title}
        imagePublicId={homepageConfig.hero.imagePublicId}
        focalPoint={homepageConfig.hero.focalPoint}
        onShopNowClick={() => onBrandSelect('All')} 
        scrollOffset={scrollOffset} 
      />
      <Suspense fallback={<div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>}>
        <AnimateOnScroll><BrandSlider brands={brands} onBrandSelect={onBrandSelect} /></AnimateOnScroll>
      </Suspense>
      
      {/* FIX: Moved Best Selling carousel here from the bottom */}
      <AnimateOnScroll>
       <ProductCarousel 
        title="Best Selling Phones"
        products={bestSelling}
        likedItems={likedItems}
        onToggleLike={onToggleLike}
        onAddToCart={onAddToCart}
        onNotifyMe={onNotifyMe}
        notificationList={notificationList}
        compareList={compareList}
        onToggleCompare={onToggleCompare}
      />
      </AnimateOnScroll>
      
      <AnimateOnScroll>
      <ProductCarousel 
        title="Newly Launched and Trending"
        products={newlyLaunched}
        likedItems={likedItems}
        onToggleLike={onToggleLike}
        onAddToCart={onAddToCart}
        onNotifyMe={onNotifyMe}
        notificationList={notificationList}
        compareList={compareList}
        onToggleCompare={onToggleCompare}
      />
      </AnimateOnScroll>
      
      <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
        <AnimateOnScroll><PromotionalBanners banners={homepageConfig.promos} /></AnimateOnScroll>
      </Suspense>
      
      {refurbishedDeals.length > 0 && (
        <AnimateOnScroll>
          <ProductCarousel
            title="Top Deals on Refurbished Phones"
            products={refurbishedDeals}
            likedItems={likedItems}
            onToggleLike={onToggleLike}
            onAddToCart={onAddToCart}
            onNotifyMe={onNotifyMe}
            notificationList={notificationList}
            compareList={compareList}
            onToggleCompare={onToggleCompare}
          />
        </AnimateOnScroll>
      )}

      {/* FIX: Moved Recommended for You here, and implemented fallback logic. */}
      {isRecommendationsLoading ? (
        <CarouselSkeleton title="Recommended for You" />
      ) : (
        <AnimateOnScroll>
        <ProductCarousel 
            title="Recommended for You"
            products={recommendationsOrFallback}
            likedItems={likedItems}
            onToggleLike={onToggleLike}
            onAddToCart={onAddToCart}
            onNotifyMe={onNotifyMe}
            notificationList={notificationList}
            compareList={compareList}
            onToggleCompare={onToggleCompare}
        />
        </AnimateOnScroll>
      )}

      {recentlyViewedProducts.length > 0 && (
         <Suspense fallback={<div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>}>
            <AnimateOnScroll>
                <RecentlyViewed
                    products={recentlyViewedProducts}
                    likedItems={likedItems}
                    onToggleLike={onToggleLike}
                    onAddToCart={onAddToCart}
                    onNotifyMe={onNotifyMe}
                    notificationList={notificationList}
                    compareList={compareList}
                    onToggleCompare={onToggleCompare}
                />
            </AnimateOnScroll>
        </Suspense>
      )}
      
      {/* Only show Smartwatches section if there are actual smartwatches. Do not use fallback data which can be misleading. */}
      {topSmartWatches.length > 0 && (
        <AnimateOnScroll>
        <ProductCarousel 
            title="Explore Top Smartwatches"
            products={topSmartWatches}
            likedItems={likedItems}
            onToggleLike={onToggleLike}
            onAddToCart={onAddToCart}
            onNotifyMe={onNotifyMe}
            notificationList={notificationList}
            compareList={compareList}
            onToggleCompare={onToggleCompare}
        />
        </AnimateOnScroll>
      )}
    </div>
  );
};

export default HomePage;