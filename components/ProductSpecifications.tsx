import React from 'react';
import type { Product, ProductVariant } from '../types';

interface ProductSpecificationsProps {
  product: Product;
  selectedVariant: ProductVariant;
}

const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ product, selectedVariant }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg my-6 border border-gray-200 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
      <ul className="space-y-2 text-gray-700 text-sm">
        {Object.entries(product.specifications).map(([key, value]) => (
          <li key={key} className="grid grid-cols-2">
            <span className="font-medium capitalize text-gray-600">{key}:</span>
            <span>{value}</span>
          </li>
        ))}
          {selectedVariant?.attributes.Storage && (
            <li className="grid grid-cols-2"><span className="font-medium capitalize text-gray-600">Storage:</span><span>{selectedVariant.attributes.Storage}</span></li>
          )}
          {selectedVariant?.attributes.RAM && (
            <li className="grid grid-cols-2"><span className="font-medium capitalize text-gray-600">RAM:</span><span>{selectedVariant.attributes.RAM}</span></li>
          )}
      </ul>
    </div>
  );
};

export default ProductSpecifications;
