// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  onRemoveFromCart: (variantId: string) => void;
  onUpdateQuantity: (variantId: string, newQuantity: number) => void;
  onCheckout: () => void;
  subtotal: number;
  shipping: number;
  total: number;
  userPinCode: string | null;
}

const Cart: React.FC<CartProps> = ({ 
    cartItems, 
    onRemoveFromCart, 
    onUpdateQuantity, 
    onCheckout, 
    subtotal,
    shipping,
    total,
    userPinCode
}) => {
  if (cartItems.length === 0) {
    return null;
  }

  const getVariantDescription = (variant: CartItem['variant']) => {
    return Object.values(variant.attributes).filter(Boolean).join(' / ');
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Cart</h2>
      <div className="space-y-4">
        {cartItems.map(item => (
          <div key={item.variant.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-md flex-wrap gap-4 border border-gray-200">
            <div className="flex items-center flex-grow min-w-[200px]">
              <img src={item.variant.imageUrl || item.product.imageUrls[0]} alt={item.product.name} className="w-16 h-16 rounded-md object-cover mr-4" loading="lazy" decoding="async" />
              <div>
                <h3 className="font-semibold text-lg text-gray-800">{item.product.name}</h3>
                <p className="text-sm text-gray-600">{getVariantDescription(item.variant)}</p>
                <p className="text-gray-700">₹{item.variant.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center">
                    <button onClick={() => onUpdateQuantity(item.variant.id, item.quantity - 1)} className="px-3 py-1 bg-gray-200 rounded-l-md hover:bg-gray-300 transition-colors">-</button>
                    <span className="px-4 py-1 bg-white font-semibold border-t border-b border-gray-200">{item.quantity}</span>
                    <button onClick={() => onUpdateQuantity(item.variant.id, item.quantity + 1)} className="px-3 py-1 bg-gray-200 rounded-r-md hover:bg-gray-300 transition-colors">+</button>
                </div>
                <p className="font-bold text-gray-800 text-lg w-24 text-right">₹{(item.variant.price * item.quantity).toLocaleString('en-IN')}</p>
                <button onClick={() => onRemoveFromCart(item.variant.id)} className="text-red-600 hover:text-red-800 font-semibold text-sm">
                Remove
                </button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="max-w-sm ml-auto space-y-2 mb-6">
            <div className="flex justify-between text-lg text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-lg text-gray-700">
                <span>Shipping{userPinCode && ` to ${userPinCode}`}:</span>
                <span className="font-semibold">₹{shipping.toLocaleString('en-IN')}</span>
            </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 border-t border-gray-300 gap-4">
            <div className="text-center sm:text-left">
              <p className="text-2xl font-bold text-gray-900">Total:</p>
              <p className="text-3xl font-bold text-gray-900">₹{total.toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">(Inclusive of all taxes)</p>
            </div>
            <button
            onClick={onCheckout}
            className="w-full sm:w-auto bg-yellow-400 text-black font-bold py-3 px-8 rounded-md hover:bg-yellow-500 transition-colors duration-300 text-lg"
            >
            Proceed to Checkout
            </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;