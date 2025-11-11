import * as React from 'react';

interface SortDropdownProps {
  sortOption: string;
  onSortChange: (option: string) => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ sortOption, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-options" className="text-gray-700 font-semibold whitespace-nowrap text-sm">Sort by:</label>
      <select
        id="sort-options"
        value={sortOption}
        onChange={(e) => onSortChange(e.target.value)}
        className="bg-white text-gray-800 rounded-md p-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
        aria-label="Sort products"
      >
        <option value="rating-desc">Best Rating</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="newest">Newest Arrivals</option>
      </select>
    </div>
  );
};

export default SortDropdown;