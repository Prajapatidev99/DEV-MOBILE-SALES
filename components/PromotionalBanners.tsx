// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { PromoBannerConfig } from '../types';
import ImageResolver from './ImageResolver';

interface PromotionalBannersProps {
    banners: PromoBannerConfig[];
    scrollOffset: number;
}

const PromotionalBanners: React.FC<PromotionalBannersProps> = ({ banners, scrollOffset }) => {
    return (
        <div className="my-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {banners.map(banner => (
                    <div key={banner.id} className="relative h-64 rounded-lg overflow-hidden group shadow-sm border border-gray-200">
                        <ImageResolver 
                            src={banner.imageUrl} 
                            alt={banner.title} 
                            className="absolute inset-0 w-full h-full object-cover" 
                            style={{
                                objectPosition: `${banner.focalPoint?.x || 50}% ${banner.focalPoint?.y || 50}%`
                            }}
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end">
                            <div>
                                <h3 className="text-xl font-bold text-white">{banner.title}</h3>
                                <p className="text-white text-xs mb-2">{banner.subtitle}</p>
                                <a 
                                    href={banner.link}
                                    className="inline-block bg-yellow-400 text-black text-xs font-bold py-1 px-3 rounded-md hover:bg-yellow-500 transition-colors"
                                >
                                    Shop Now
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PromotionalBanners;