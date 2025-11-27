import React from 'react';
import type { Product, ProductVariant } from '../types';

interface ProductSpecificationsProps {
  product: Product;
  selectedVariant: ProductVariant;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ product, selectedVariant }) => {
  // Exclude RAM and Storage from base specs as they are displayed from variant attributes
  // Also filter out any empty values to prevent showing blank fields
  const filteredSpecs = Object.entries(product.specifications).filter(([key, value]) => {
      const lowerKey = key.toLowerCase();
      const isRedundant = lowerKey === 'ram' || lowerKey === 'storage';
      const hasValue = value && String(value).trim().length > 0;
      return !isRedundant && hasValue;
  });

  const hasStorage = selectedVariant?.attributes.Storage && selectedVariant.attributes.Storage.trim().length > 0;
  const hasRam = selectedVariant?.attributes.RAM && selectedVariant.attributes.RAM.trim().length > 0;

  // If absolutely no specs to show, hide the section completely
  if (filteredSpecs.length === 0 && !hasStorage && !hasRam) {
      return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg my-6 border border-gray-200 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
      <ul className="space-y-2 text-gray-700 text-sm">
        {filteredSpecs.map(([key, value]) => (
          <li key={key} className="grid grid-cols-2">
            <span className="font-medium capitalize text-gray-600">{key}:</span>
            <span>{value}</span>
          </li>
        ))}
          {hasStorage && (
            <li className="grid grid-cols-2"><span className="font-medium capitalize text-gray-600">Storage:</span><span>{selectedVariant.attributes.Storage}</span></li>
          )}
          {hasRam && (
            <li className="grid grid-cols-2"><span className="font-medium capitalize text-gray-600">RAM:</span><span>{selectedVariant.attributes.RAM}</span></li>
          )}
      </ul>
    </div>
  );
};

export default ProductSpecifications;