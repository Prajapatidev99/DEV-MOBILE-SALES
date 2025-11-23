import React, { useState, useEffect, useRef } from 'react';
import type { Product, ProductVariant } from '../types';
import ImageResolver, { getCloudinaryUrl } from './ImageResolver';

interface ProductGalleryProps {
  product: Product;
  selectedVariant: ProductVariant;
}

const ProductGallery: React.FC<ProductGalleryProps> = ({ product, selectedVariant }) => {
  const [mainImagePublicId, setMainImagePublicId] = useState('');
  const [viewMode, setViewMode] = useState<'gallery' | '360'>('gallery');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset/Update main image when variant changes
    const imageIds = product.imagePublicIds || [];
    setMainImagePublicId(selectedVariant?.imagePublicId || (imageIds.length > 0 ? imageIds[0] : ''));
    setViewMode('gallery');
    setCurrentFrame(0);
  }, [selectedVariant, product.imagePublicIds]);

  // Preload 360 images
  useEffect(() => {
    if (viewMode === '360' && product.image360Urls) {
      product.image360Urls.forEach((url: string) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [viewMode, product.image360Urls]);

  const thumbnailPublicIds = React.useMemo(() => {
    const imageIds = product.imagePublicIds || [];
    const mainImage = selectedVariant?.imagePublicId || (imageIds.length > 0 ? imageIds[0] : '');
    const variantImages = (product.variants || [])
        .map(v => v.imagePublicId)
        .filter((id): id is string => !!id);
    const allImages = [mainImage, ...variantImages, ...imageIds];
    return [...new Set(allImages)];
  }, [product.variants, product.imagePublicIds, selectedVariant]);

  // 360 Viewer Drag Handlers
  const totalFrames = product.image360Urls?.length || 0;

  const handle360DragStart = (clientX: number) => {
      setIsDragging(true);
      setDragStartX(clientX);
  };

  const handle360DragMove = (clientX: number) => {
      if (!isDragging || totalFrames <= 1) return;
      const dragDelta = clientX - dragStartX;
      const sensitivity = 8; 
      const frameDelta = Math.floor(dragDelta / sensitivity);

      if (Math.abs(frameDelta) > 0) {
          const nextFrame = (currentFrame - frameDelta + totalFrames) % totalFrames;
          setCurrentFrame(nextFrame);
          setDragStartX(clientX);
      }
  };

  const handle360DragEnd = () => setIsDragging(false);

  return (
    <div className="relative group">
      <div className="animate-float">
          {viewMode === 'gallery' ? (
            <div 
              className="relative w-full aspect-square overflow-hidden rounded-lg shadow-sm border border-gray-200 mb-4"
            >
              <ImageResolver 
                ref={imageRef}
                publicId={mainImagePublicId}
                alt={product.name}
                width={800}
                height={800}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110"
                loading="eager"
                decoding="async"
                key={mainImagePublicId}
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
          {thumbnailPublicIds.map((publicId, index) => (
            <img
              key={index}
              src={getCloudinaryUrl(publicId, 100)}
              alt={`${product.name} thumbnail ${index + 1}`}
              onClick={() => setMainImagePublicId(publicId)}
              className={`w-16 h-16 object-contain rounded-md cursor-pointer border-2 p-1 transition-all flex-shrink-0 ${mainImagePublicId === publicId ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'}`}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
