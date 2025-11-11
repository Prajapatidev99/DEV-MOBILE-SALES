// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { FocalPoint } from '../types';
import ImageResolver from './ImageResolver';

interface HeroBannerProps {
    title: string;
    imageUrl: string;
    onShopNowClick: () => void;
    scrollOffset: number;
    focalPoint?: FocalPoint;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ title, imageUrl, onShopNowClick, scrollOffset, focalPoint = { x: 50, y: 50 } }) => {
    return (
        <div className="relative h-80 bg-gray-800 rounded-lg overflow-hidden mb-4 shadow-sm border border-gray-200 animate-fade-in">
            <ImageResolver 
                src={imageUrl} 
                alt="Promotional banner" 
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                    objectPosition: `${focalPoint?.x || 50}% ${focalPoint?.y || 50}%`,
                    transform: `translateY(${scrollOffset * 0.3}px) scale(1.15)`,
                }}
                loading="eager"
                decoding="async"
                fetchPriority="high"
            />
            <div className="relative h-full flex flex-col items-start justify-center text-left p-8 md:p-12 bg-gradient-to-r from-black/60 to-transparent">
                <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg max-w-md">{title}</h2>
                <button 
                    onClick={onShopNowClick}
                    className="mt-6 bg-yellow-400 text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-500 transition-transform transform hover:scale-105 duration-300 text-md shadow-lg">
                    Shop Now
                </button>
            </div>
        </div>
    );
};

export default HeroBanner;