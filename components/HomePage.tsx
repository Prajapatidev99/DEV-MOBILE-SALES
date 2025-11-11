// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { Product, DisplayableProduct, HomepageConfig, ProductVariant } from '../types';
import HeroBanner from './HeroBanner';
import BrandSlider from './BrandSlider';
import PromotionalBanners from './PromotionalBanners';
import ProductCard from './ProductCard';
import RecentlyViewed from './RecentlyViewed';
import AnimateOnScroll from './AnimateOnScroll';

interface ProductCarouselProps {
  title: string;
  products: DisplayableProduct[];
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  onAddToCart: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, products, onToggleLike, likedItems, onAddToCart }) => {
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
  const bestSelling = [...allProducts].sort((a,b) => b.rating - a.rating).slice(0, 10);
  const topSmartWatches = allProducts.filter(p => p.product.category === 'Smartwatches').slice(0, 10);

  return (
    <div className="space-y-4">
      <HeroBanner 
        title={homepageConfig.hero.title}
        imageUrl={homepageConfig.hero.imageUrl}
        focalPoint={homepageConfig.hero.focalPoint}
        onShopNowClick={() => onBrandSelect('All')} 
        scrollOffset={scrollOffset} 
      />
      <AnimateOnScroll><BrandSlider brands={brands} onBrandSelect={onBrandSelect} /></AnimateOnScroll>
      
      {isRecommendationsLoading ? (
        <CarouselSkeleton title="Recommended for You" />
      ) : recommendedProducts.length > 0 && (
        <AnimateOnScroll>
        <ProductCarousel 
            title="Recommended for You"
            products={newlyLaunched} // Using newly launched as placeholder for recommendations
            likedItems={likedItems}
            onToggleLike={onToggleLike}
            onAddToCart={onAddToCart}
        />
        </AnimateOnScroll>
      )}

      <AnimateOnScroll>
      <ProductCarousel 
        title="Newly Launched and Trending"
        products={newlyLaunched}
        likedItems={likedItems}
        onToggleLike={onToggleLike}
        onAddToCart={onAddToCart}
      />
      </AnimateOnScroll>
      <AnimateOnScroll><PromotionalBanners banners={homepageConfig.promos} scrollOffset={scrollOffset} /></AnimateOnScroll>
      <AnimateOnScroll>
       <ProductCarousel 
        title="Best Selling Phones"
        products={bestSelling}
        likedItems={likedItems}
        onToggleLike={onToggleLike}
        onAddToCart={onAddToCart}
      />
      </AnimateOnScroll>
      {recentlyViewedProducts.length > 0 && (
         <AnimateOnScroll>
         <RecentlyViewed
            products={recentlyViewedProducts}
            likedItems={likedItems}
            onToggleLike={onToggleLike}
            onAddToCart={onAddToCart}
        />
        </AnimateOnScroll>
      )}
      <AnimateOnScroll>
       <ProductCarousel 
        title="Explore Top Smartwatches"
        products={topSmartWatches.length ? topSmartWatches : newlyLaunched} // fallback data
        likedItems={likedItems}
        onToggleLike={onToggleLike}
        onAddToCart={onAddToCart}
      />
      </AnimateOnScroll>
    </div>
  );
};

export default HomePage;