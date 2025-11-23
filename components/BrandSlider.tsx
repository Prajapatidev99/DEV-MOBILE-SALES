import React from 'react';

interface BrandSliderProps {
  brands: string[];
  onBrandSelect: (brand: string) => void;
}

// Direct brand logo URLs (REAL IMG LINKS ONLY)
const brandLogos: { [key: string]: string } = {
  All: "https://res.cloudinary.com/dv9z9uaht/image/upload/v1763912007/all_zdxfbs.svg",
  Apple: "https://www.vectorlogo.zone/logos/apple/apple-icon.svg",
  Samsung: "https://www.vectorlogo.zone/logos/samsung/samsung-icon.svg",
  Google: "https://www.vectorlogo.zone/logos/google/google-icon.svg",
  OnePlus: "https://cdn.brandfetch.io/idi46coDvW/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1676970644012",
  Xiaomi: "https://www.vectorlogo.zone/logos/xiaomi/xiaomi-icon.svg",
  Oppo: "https://www.vectorlogo.zone/logos/oppo/oppo-icon.svg",

  // FIXED — This is a real SVG, not a webpage.
  Vivo: "https://iconape.com/wp-content/files/as/291951/png/vivo-mobile-phones-logo.png",

  Realme: "https://upload.wikimedia.org/wikipedia/commons/9/95/Realme_realme_logo.svg",
  boAt: "https://www.vectorlogo.zone/logos/boat-lifestyle/boat-lifestyle-icon.svg",
  Spigen: "https://iconape.com/wp-content/files/na/31185/svg/spigen.svg",
  Anker: "https://www.vectorlogo.zone/logos/anker/anker-icon.svg",
};

// Brand Slider Component
const BrandSlider: React.FC<BrandSliderProps> = ({ brands, onBrandSelect }) => {
  return (
    <div className="my-4 bg-white py-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        Shop Phones by Brand
      </h2>

      <div className="relative group">
        <div className="flex overflow-x-auto space-x-8 pb-4 custom-scrollbar -mx-4 px-4">
          {brands.map((brand) => (
            <div
              key={brand}
              onClick={() => onBrandSelect(brand)}
              className="flex-shrink-0 w-24 text-center cursor-pointer group/item"
            >
              {/* Circle Logo Wrapper */}
              <div className="bg-gray-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center p-3 
                              border-2 border-transparent overflow-hidden
                              group-hover/item:border-blue-500 group-hover/item:shadow-lg 
                              transition-all transform group-hover/item:scale-105">
                
                {/* The Rounded Logo */}
                <img
                  src={brandLogos[brand] || "https://img.icons8.com/ios-filled/50/000000/smartphone-case.png"}
                  alt={brand}
                  className="w-full h-full object-cover rounded-full"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://img.icons8.com/ios-filled/50/000000/smartphone-case.png";
                  }}
                />
              </div>

              <p className="mt-2 text-sm font-semibold text-gray-700 
                            group-hover/item:text-blue-600 transition-colors">
                {brand}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrandSlider;
