// FIX: Changed React import to `import React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import React from 'react';

interface BrandSliderProps {
  brands: string[];
  onBrandSelect: (brand: string) => void;
}

// Brand logos mapping
const brandLogos: { [key: string]: string } = {
    'All': 'https://res.cloudinary.com/dv9z9uaht/image/upload/v1763912007/all_zdxfbs.svg',
    'Apple': 'https://www.vectorlogo.zone/logos/apple/apple-icon.svg',
    'Samsung': 'https://www.vectorlogo.zone/logos/samsung/samsung-icon.svg',
    'Google': 'https://www.vectorlogo.zone/logos/google/google-icon.svg',
    'OnePlus': 'https://cdn.brandfetch.io/idi46coDvW/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1676970644012',
    'Xiaomi': 'https://www.vectorlogo.zone/logos/xiaomi/xiaomi-icon.svg',
    'Oppo': 'https://www.vectorlogo.zone/logos/oppo/oppo-icon.svg',
    'Vivo': 'https://smpl-prod-app-v2.gumlet.io/brands/11/1665495586.png',
    'Realme': 'https://logowik.com/content/uploads/images/realme-new-20239330.logowik.com.webp',
    'boAt': 'https://www.vectorlogo.zone/logos/boat-lifestyle/boat-lifestyle-icon.svg',
    'Spigen': 'https://iconape.com/wp-content/files/na/31185/svg/spigen.svg',
    'Anker': 'https://www.vectorlogo.zone/logos/anker/anker-icon.svg',
};

// FIX: Reconstructed the BrandSlider component which was corrupted, causing a "no default export" error. The component now correctly renders a scrollable list of brand logos and has a default export statement.
const BrandSlider: React.FC<BrandSliderProps> = ({ brands, onBrandSelect }) => {
  return (
    <div className="my-4 bg-white py-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Shop Phones by Brand</h2>
      <div className="relative group">
        <div className="flex overflow-x-auto space-x-8 pb-4 custom-scrollbar -mx-4 px-4">
          {brands.map(brand => (
            <div
              key={brand}
              onClick={() => onBrandSelect(brand)}
              className="flex-shrink-0 w-24 text-center cursor-pointer group/item"
            >
              <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center p-3 border-2 border-transparent group-hover/item:border-blue-500 group-hover/item:shadow-lg transition-all transform group-hover/item:scale-105">
                <img
                  src={brandLogos[brand] || 'https://img.icons8.com/ios-filled/50/000000/smartphone-case.png'}
                  alt={brand}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
              <p className="mt-2 text-sm font-semibold text-gray-700 group-hover/item:text-blue-600 transition-colors">{brand}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSlider;
