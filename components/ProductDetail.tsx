// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { Product, Review, User, ProductVariant, PriceComparison } from '../types';
import { ShoppingCartIcon, StarIcon, CompareIcon } from './icons';
import RelatedProducts from './RelatedProducts';
import AddReviewForm from './AddReviewForm';
import AnimateOnScroll from './AnimateOnScroll';
import CountdownTimer from './CountdownTimer';

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product, variant: ProductVariant, event: React.MouseEvent) => void;
  relatedProducts: Product[];
  onToggleLike: (productId: number) => void;
  likedItems: number[];
  currentUser: User | null;
  onAddReview: (productId: number, rating: number, comment: string) => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  userPinCode: string | null;
  onPinCodeChange: (pinCode: string) => boolean;
  onNotifyMe: (productId: number) => void;
  notificationList: number[];
  onWatchPrice: (productId: number) => void;
  priceWatchList: number[];
  compareList: number[];
  onToggleCompare: (productId: number) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
    product, 
    onAddToCart, 
    relatedProducts, 
    onToggleLike,
    likedItems,
    currentUser,
    onAddReview,
    addToast,
    userPinCode,
    onPinCodeChange,
    onNotifyMe,
    notificationList,
    onWatchPrice,
    priceWatchList,
    compareList,
    onToggleCompare
}) => {
  const [selectedVariant, setSelectedVariant] = React.useState<ProductVariant>(() => product.variants.find(v => (v.inventory || []).some(s => s.quantity > 0)) || product.variants[0]);
  const [mainImageUrl, setMainImageUrl] = React.useState(selectedVariant.imageUrl || product.imageUrls[0]);
  const [pinCode, setPinCode] = React.useState('');
  const [deliveryStatus, setDeliveryStatus] = React.useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const imageRef = React.useRef<HTMLImageElement>(null);

  // 360 viewer state
  const [viewMode, setViewMode] = React.useState<'gallery' | '360'>('gallery');
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStartX, setDragStartX] = React.useState(0);
  const [currentFrame, setCurrentFrame] = React.useState(0);
  
  // Price comparison state
  const [comparisonResults, setComparisonResults] = React.useState<PriceComparison[] | null>(null);
  const [isComparingPrices, setIsComparingPrices] = React.useState(false);
  const [comparisonError, setComparisonError] = React.useState<string | null>(null);


  React.useEffect(() => {
    // Reset state when the product changes
    const initialVariant = product.variants.find(v => (v.inventory || []).some(s => s.quantity > 0)) || product.variants[0];
    setSelectedVariant(initialVariant);
    
    setViewMode('gallery');
    setCurrentFrame(0);
    setDeliveryStatus('idle');
    if (userPinCode) setPinCode(userPinCode);
    else setPinCode('');
    
    // Reset price comparison on product change
    setComparisonResults(null);
    setComparisonError(null);
    setIsComparingPrices(false);

  }, [product, userPinCode]);

  React.useEffect(() => {
    setMainImageUrl(selectedVariant?.imageUrl || product.imageUrls[0]);
  }, [selectedVariant, product.imageUrls]);
  
  const options = React.useMemo(() => {
    const allOptions: { [key: string]: { value: string, colorCode?: string }[] } = {};
    product.variants.forEach(variant => {
        Object.entries(variant.attributes).forEach(([key, value]) => {
            if (!value) return;
            if (!allOptions[key]) allOptions[key] = [];
            if (!allOptions[key].some(o => o.value === value)) {
                allOptions[key].push({ value, colorCode: key === 'Color' ? variant.colorCode : undefined });
            }
        });
    });
    return allOptions;
  }, [product.variants]);

  const thumbnailImages = React.useMemo(() => {
    const mainImage = selectedVariant?.imageUrl || product.imageUrls[0];
    const variantImages = product.variants
        .map(v => v.imageUrl)
        .filter((url): url is string => !!url);
    // Combine, create unique set, and make sure the currently selected variant's image is first if it exists.
    const allImages = [mainImage, ...variantImages, ...product.imageUrls];
    return [...new Set(allImages)];
  }, [product.variants, product.imageUrls, selectedVariant]);
  
  const handleOptionSelect = (key: string, value: string) => {
    const currentAttributes = { ...selectedVariant.attributes };
    currentAttributes[key as keyof typeof currentAttributes] = value;
    
    // Find the best matching variant
    let bestMatch = product.variants.find(v => 
        Object.entries(currentAttributes).every(([attrKey, attrValue]) => v.attributes[attrKey as keyof typeof v.attributes] === attrValue)
    );

    // If no exact match, find the first available that matches the new selection
    if (!bestMatch) {
       bestMatch = product.variants.find(v => v.attributes[key as keyof typeof v.attributes] === value) || selectedVariant;
    }
    
    setSelectedVariant(bestMatch);
  };

  // Preload 360 images for smooth rotation
  React.useEffect(() => {
    if (viewMode === '360' && product.image360Urls) {
      product.image360Urls.forEach((url: string) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [viewMode, product.image360Urls]);

  const handlePinCodeCheck = () => {
    setDeliveryStatus('checking');
    setTimeout(() => {
        if (pinCode.length === 6 && /^\d+$/.test(pinCode)) {
            const success = onPinCodeChange(pinCode);
            setDeliveryStatus(success ? 'available' : 'unavailable');
        } else {
            setDeliveryStatus('unavailable');
            addToast('Please enter a valid 6-digit PIN code.', 'error');
        }
    }, 1000);
  };
  
  const getDeliveryMessage = () => {
      switch(deliveryStatus) {
          case 'available':
              return <p className="text-green-600 mt-2 text-sm">Great! Delivery is available to your area.</p>;
          case 'unavailable':
              return <p className="text-red-600 mt-2 text-sm">Sorry, delivery is not available for this PIN code.</p>;
          case 'checking':
              return <p className="text-gray-500 mt-2 text-sm">Checking...</p>;
          default:
              return null;
      }
  };
  
   const handleComparePrices = async () => {
    setIsComparingPrices(true);
    setComparisonError(null);
    setComparisonResults(null);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const schema = {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING },
                    url: { type: Type.STRING }
                },
                required: ['platform', 'url']
            }
        };
        const variantDetails = Object.entries(selectedVariant.attributes)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
            
        const prompt = `You are an expert price comparison assistant for electronics in India. Your goal is to generate a direct search URL for a specific product variant on major e-commerce sites.

Product Name: "${product.name}"
Variant Details: "${variantDetails}"

Based on this, create a search URL for this exact product on amazon.in and flipkart.com. The URL should take the user to the search results page for that product. For example, for a "Samsung Galaxy S24" on Amazon, the URL should be something like "https://www.amazon.in/s?k=Samsung+Galaxy+S24".

Respond ONLY with the JSON object that matches the provided schema. If you cannot generate a URL for a platform, omit it from the result array.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const jsonString = response.text;
        const results = JSON.parse(jsonString) as PriceComparison[];
        setComparisonResults(results);

    } catch (error) {
        console.error("Error fetching price comparison links:", error);
        setComparisonError("Sorry, we couldn't generate search links at this time.");
    } finally {
        setIsComparingPrices(false);
    }
  };


  const averageRating = product.reviews.length > 0
    ? (product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  // 360 Viewer Drag Handlers
  const totalFrames = product.image360Urls?.length || 0;

  const handle360DragStart = (clientX: number) => {
      setIsDragging(true);
      setDragStartX(clientX);
  };

  const handle360DragMove = (clientX: number) => {
      if (!isDragging || totalFrames <= 1) return;
      const dragDelta = clientX - dragStartX;
      const sensitivity = 8; // Lower is more sensitive
      const frameDelta = Math.floor(dragDelta / sensitivity);

      if (Math.abs(frameDelta) > 0) {
          const nextFrame = (currentFrame - frameDelta + totalFrames) % totalFrames;
          setCurrentFrame(nextFrame);
          setDragStartX(clientX);
      }
  };

  const handle360DragEnd = () => setIsDragging(false);

    const ShareButtons: React.FC = () => {
        const url = window.location.href;
        const text = `Check out this deal on the ${product.name} at Dev Mobile!`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        
        const handleCopy = () => {
            navigator.clipboard.writeText(url).then(() => {
                addToast('Link copied to clipboard!', 'success');
            });
        };

        return (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
                <span className="text-sm font-semibold text-gray-700">Share:</span>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-600 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.296-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <button onClick={handleCopy} aria-label="Copy link" className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                </button>
            </div>
        );
    };

  const isLiked = likedItems.includes(product.id);
  const isWatchingPrice = priceWatchList.includes(product.id);
  const isInCompare = compareList.includes(product.id);
  const isInStock = (selectedVariant.inventory || []).some(s => s.quantity > 0);

  const structuredData = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: product.imageUrls,
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    sku: product.id.toString(),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'INR',
      lowPrice: Math.min(...product.variants.map(v => v.price)),
      highPrice: Math.max(...product.variants.map(v => v.price)),
      offerCount: product.variants.length,
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: averageRating,
        reviewCount: product.reviews.length,
      }
    })
  };

  return (
    <div className="text-gray-800">
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-md border border-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          <div className="relative group">
            <div className="animate-float">
                {viewMode === 'gallery' ? (
                  <div 
                    className="relative w-full aspect-square overflow-hidden rounded-lg shadow-sm border border-gray-200 mb-4"
                  >
                    <img 
                      ref={imageRef}
                      src={mainImageUrl} 
                      alt={product.name}
                      className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      key={mainImageUrl} // Force re-render on image change
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-sm border border-gray-200 mb-4 cursor-grab active:cursor-grabbing"
                    onMouseDown={(e) => handle360DragStart(e.clientX)}
                    onMouseMove={(e) => handle360DragMove(e.clientX)}
                    onMouseUp={handle360DragEnd}
                    onMouseLeave={handle360DragEnd}
                    onTouchStart={(e) => handle360DragStart(e.touches[0].clientX)}
                    onTouchMove={(e) => handle360DragMove(e.touches[0].clientX)}
                    onTouchEnd={handle360DragEnd}
                  >
                    <img 
                      ref={imageRef}
                      src={product.image360Urls?.[currentFrame]}
                      alt={`${product.name} 360 view`}
                      className="w-full h-full object-contain"
                      draggable="false"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white bg-black/50 px-4 py-2 rounded-lg">Drag to rotate</p>
                    </div>
                  </div>
                )}
            </div>
            
            {product.image360Urls && product.image360Urls.length > 0 && (
                <div className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur-sm rounded-full p-1 flex items-center text-sm">
                    <button onClick={() => setViewMode('gallery')} className={`px-3 py-1 rounded-full transition-colors ${viewMode === 'gallery' ? 'bg-blue-600 text-white shadow' : 'text-gray-700'}`}>Gallery</button>
                    <button onClick={() => setViewMode('360')} className={`px-3 py-1 rounded-full transition-colors ${viewMode === '360' ? 'bg-blue-600 text-white shadow' : 'text-gray-700'}`}>360°</button>
                </div>
            )}

            {viewMode === 'gallery' && (
              <div className="flex space-x-2 overflow-x-auto custom-scrollbar pb-2">
                {thumbnailImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    onClick={() => setMainImageUrl(url)}
                    className={`w-16 h-16 object-contain rounded-md cursor-pointer border-2 p-1 transition-all flex-shrink-0 ${mainImageUrl === url ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'}`}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-start">
                <div>
                  <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{product.brand}</span>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 my-2">{product.name}</h1>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => onToggleLike(product.id)} className={`p-3 rounded-full transition-colors ${isLiked ? 'bg-red-100 text-red-500' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-500'}`} aria-label={isLiked ? 'Unlike product' : 'Like product'}>
                        <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 20.25l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                    </button>
                     <button onClick={() => onWatchPrice(product.id)} className={`p-3 rounded-full transition-colors ${isWatchingPrice ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`} aria-label={isWatchingPrice ? 'Stop watching price' : 'Watch price'}>
                        <svg className="w-6 h-6" fill={isWatchingPrice ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    </button>
                    <button 
                        onClick={() => onToggleCompare(product.id)} 
                        className={`p-3 rounded-full transition-colors ${isInCompare ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'}`}
                        aria-label={isInCompare ? 'Remove from compare' : 'Add to compare'}
                    >
                        <CompareIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="flex items-center my-4 gap-4 flex-wrap">
              <div className="flex items-center">
                  <StarIcon className="w-5 h-5 text-yellow-400" />
                  <span className="ml-2 text-gray-700 text-md">{averageRating} ({product.reviews.length} reviews)</span>
              </div>
              <div>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-gray-900">₹{selectedVariant.price.toLocaleString('en-IN')}</span>
                    {selectedVariant.originalPrice && (
                        <>
                        <span className="text-xl text-gray-500 line-through">₹{selectedVariant.originalPrice.toLocaleString('en-IN')}</span>
                        <span className="text-sm font-bold text-green-700 bg-green-100 px-2 py-1 rounded-md">
                            {Math.round(((selectedVariant.originalPrice - selectedVariant.price) / selectedVariant.originalPrice) * 100)}% OFF
                        </span>
                        </>
                    )}
                    {selectedVariant.discountLabel && (
                        <span className="text-sm font-bold text-white bg-red-500 px-2 py-1 rounded-md">
                            {selectedVariant.discountLabel}
                        </span>
                    )}
                </div>
                <p className="text-sm text-green-600 font-semibold mt-1">✓ Free & Fast Delivery</p>
              </div>
            </div>
            
            {selectedVariant.specialOffer?.expiry && (
                <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center gap-4">
                    <span className="font-bold text-red-600 text-sm animate-pulse">Offer ends in:</span>
                    <CountdownTimer expiry={selectedVariant.specialOffer.expiry} />
                </div>
            )}

            <div className="space-y-4">
                {Object.entries(options).map(([key, values]) => (
                    <div key={key}>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">{key}: <span className="font-normal text-gray-700">{selectedVariant.attributes[key as keyof typeof selectedVariant.attributes]}</span></h3>
                        <div className="flex flex-wrap gap-2">
                            {values.map(({ value, colorCode }) =>
                                key === 'Color' ? (
                                     <button 
                                        key={value}
                                        onClick={() => handleOptionSelect(key, value)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform transform hover:scale-110 ${selectedVariant.attributes.Color === value ? 'border-white' : 'border-gray-300'}`}
                                        style={{ 
                                            backgroundColor: colorCode,
                                            ...(selectedVariant.attributes.Color === value && {
                                                boxShadow: `0 0 0 2px white, 0 0 0 4px ${colorCode || '#007bff'}`
                                            })
                                        }}
                                        aria-label={`Select color ${value}`}
                                    />
                                ) : (
                                    <button
                                        key={value}
                                        onClick={() => handleOptionSelect(key, value)}
                                        className={`px-4 py-1 border rounded-md text-sm font-medium transition-colors ${selectedVariant.attributes[key as keyof typeof selectedVariant.attributes] === value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
                                    >
                                        {value}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                ))}
            </div>


            <p className="text-gray-700 mt-4 mb-6 leading-relaxed">{product.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
              {isInStock ? (
                  <button
                    onClick={(e) => onAddToCart(product, selectedVariant, e)}
                    className="CartBtn CartBtn-lg w-full sm:col-span-3"
                  >
                    <span className="IconContainer">
                        <ShoppingCartIcon className="icon text-gray-900" />
                    </span>
                    <span className="text">Add to Cart</span>
                  </button>
              ) : (
                  <button
                    onClick={() => onNotifyMe(product.id)}
                    disabled={notificationList.includes(product.id)}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-md hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 flex items-center justify-center text-lg disabled:bg-gray-400 disabled:cursor-not-allowed sm:col-span-3"
                  >
                    {notificationList.includes(product.id) 
                      ? <><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> On the List</>
                      : <><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>Notify Me</>
                    }
                  </button>
              )}
               <button onClick={handleComparePrices} disabled={isComparingPrices} className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-md hover:bg-black transition-transform transform hover:scale-105 duration-300 flex items-center justify-center text-lg disabled:bg-gray-400 sm:col-span-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Check Live Prices
                </button>
            </div>
            
            <ShareButtons />
            
            {(isComparingPrices || comparisonResults || comparisonError) && (
              <AnimateOnScroll>
                <div className="bg-gray-50 p-4 rounded-lg mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">Check Live Prices</h3>
                    <p className="text-xs text-gray-500 mb-3">For: {product.name} ({Object.values(selectedVariant.attributes).filter(Boolean).join(' / ')})</p>
                    {isComparingPrices && (
                        <div className="space-y-3 animate-pulse">
                          <div className="h-10 bg-gray-200 rounded w-full"></div>
                          <div className="h-10 bg-gray-200 rounded w-full"></div>
                        </div>
                    )}
                    {comparisonError && <p className="text-red-600">{comparisonError}</p>}
                    {comparisonResults && (
                        <div className="space-y-3">
                          {comparisonResults.map(result => (
                              <a 
                                key={result.platform} 
                                href={result.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex items-center justify-between text-sm bg-white p-3 rounded-md border hover:bg-gray-50 transition-colors"
                              >
                                <span className="font-semibold text-blue-600 capitalize">Check on {result.platform}</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                              </a>
                          ))}
                           <div className="flex items-start gap-2 text-xs text-gray-500 pt-2 border-t mt-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                <span>AI-generated links to help you find the best price. Please verify all details on the retailer's site.</span>
                           </div>
                        </div>
                    )}
                </div>
              </AnimateOnScroll>
            )}
            
             <AnimateOnScroll>
              <div className="bg-gray-50 p-4 rounded-lg my-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key} className="grid grid-cols-2">
                      <span className="font-medium capitalize text-gray-600">{key}:</span>
                      <span>{value}</span>
                    </li>
                  ))}
                   {selectedVariant.attributes.Storage && (
                     <li className="grid grid-cols-2"><span className="font-medium capitalize text-gray-600">Storage:</span><span>{selectedVariant.attributes.Storage}</span></li>
                   )}
                   {selectedVariant.attributes.RAM && (
                     <li className="grid grid-cols-2"><span className="font-medium capitalize text-gray-600">RAM:</span><span>{selectedVariant.attributes.RAM}</span></li>
                   )}
                </ul>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll>
              <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200 space-y-4">
                  <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Check Delivery Availability</h3>
                      <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value)}
                            placeholder="Enter 6-digit PIN code"
                            className="flex-grow px-3 py-2 bg-white text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={6}
                           />
                          <button onClick={handlePinCodeCheck} disabled={deliveryStatus === 'checking'} className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-md hover:bg-black disabled:bg-gray-400">
                            Check
                          </button>
                      </div>
                      {getDeliveryMessage()}
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                       <h3 className="font-semibold text-gray-800 mb-2">Check in-store availability</h3>
                       <p className="text-sm text-gray-700">Available for pickup at our stores. Choose 'Pick Up In-Store' at checkout.</p>
                  </div>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
        
        <AnimateOnScroll className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Ratings & Reviews</h2>
            {currentUser && (
              <AddReviewForm productId={product.id} onAddReview={onAddReview} addToast={addToast} />
            )}
            {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? (
                product.reviews.map((review: Review) => (
                    <div key={review.id} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold text-gray-800">{review.author}</h3>
                            <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                        <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                                <StarIcon key={i} className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                    </div>
                ))
            ) : (
                <p className="text-gray-600 text-center py-4">No reviews yet. Be the first to write one!</p>
            )}
        </AnimateOnScroll>
      </div>

      {relatedProducts.length > 0 && (
          <AnimateOnScroll className="mt-16">
              <RelatedProducts 
                  products={relatedProducts}
                  onToggleLike={onToggleLike}
                  likedItems={likedItems}
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

export default ProductDetail;