// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';

interface BrandSliderProps {
  brands: string[];
  onBrandSelect: (brand: string) => void;
}


const BrandSlider: React.FC<BrandSliderProps> = ({ brands, onBrandSelect }) => {
  const [selected, setSelected] = React.useState('All');
  
  const handleSelect = (brand: string) => {
    setSelected(brand);
    onBrandSelect(brand);
  }

  return (
    <div className="my-4">
      <div className="flex overflow-x-auto items-center space-x-3 pb-2 custom-scrollbar">
        {brands.map(brand => (
          <button 
            key={brand} 
            onClick={() => handleSelect(brand)}
            className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-semibold transition-colors duration-200 ${selected === brand ? 'bg-black text-white' : 'bg-white text-gray-700 hover:bg-gray-200'}`}>
            {brand}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BrandSlider;