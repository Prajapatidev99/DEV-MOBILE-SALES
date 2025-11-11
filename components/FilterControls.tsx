// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';

interface FilterControlsProps {
  brands: string[];
  selectedBrand: string;
  onBrandSelect: (brand: string) => void;
  maxPrice: number;
  priceLimit: number;
  onPriceChange: (price: number) => void;
  showInStockOnly: boolean;
  onInStockOnlyChange: (show: boolean) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  brands,
  selectedBrand,
  onBrandSelect,
  maxPrice,
  priceLimit,
  onPriceChange,
  showInStockOnly,
  onInStockOnlyChange,
}) => {
  return (
    <div className="my-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col lg:flex-row items-center justify-between gap-6 flex-wrap">
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <label htmlFor="brand-filter" className="text-gray-700 font-semibold whitespace-nowrap">Brand:</label>
        <select
          id="brand-filter"
          value={selectedBrand}
          onChange={(e) => onBrandSelect(e.target.value)}
          className="bg-gray-50 text-gray-800 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none w-full"
          aria-label="Filter by brand"
        >
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-1/2 lg:w-1/3">
        <label htmlFor="price-filter" className="text-gray-700 font-semibold whitespace-nowrap">Max Price:</label>
        <input
          id="price-filter"
          type="range"
          min="0"
          max={maxPrice}
          value={priceLimit}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          aria-label="Filter by price"
        />
        <span className="text-blue-600 font-bold w-24 text-center">₹{priceLimit.toLocaleString('en-IN')}</span>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <input
            type="checkbox"
            id="in-stock-filter"
            checked={showInStockOnly}
            onChange={(e) => onInStockOnlyChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="in-stock-filter" className="text-gray-700 font-semibold">In Stock Only</label>
      </div>
    </div>
  );
};

export default FilterControls;