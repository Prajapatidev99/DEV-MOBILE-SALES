// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { CartItem, Order, Store, User, Address, Coupon } from '../types';
import AddressSelectionModal from './AddressSelectionModal';

// FIX: Updated CheckoutProps to include the 'userLocation' prop and widened the type definition for 'onPlaceOrder' to match the props being passed from the App component, resolving the type mismatch error.
interface CheckoutProps {
    cartItems: CartItem[];
    subtotal: number;
    shippingCost: number;
    onPlaceOrder: (options: {
        deliveryMethod: 'shipping' | 'pickup' | 'quick-delivery';
        details: Order['deliveryAddress'] | { storeId: number };
        total: number;
        gstin?: string;
        companyName?: string;
        couponCode?: string;
        discountAmount?: number;
        fulfilledByStoreId?: number;
    }) => Promise<Order | null>;
    onCancel: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
    userPinCode: string | null;
    onPinCodeChange: (pinCode: string) => boolean;
    stores: Store[];
    currentUser: User | null;
    coupons: Coupon[];
    userLocation: { latitude: number, longitude: number } | null;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, subtotal, shippingCost, onPlaceOrder, onCancel, addToast, userPinCode, onPinCodeChange, stores, currentUser, coupons }) => {
    const [deliveryMethod, setDeliveryMethod] = React.useState<'shipping' | 'pickup'>('shipping');
    const [selectedStore, setSelectedStore] = React.useState<number | undefined>(stores[0]?.id);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);

    // Address State
    const [selectedAddressId, setSelectedAddressId] = React.useState<number | 'new'>('new');
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [city, setCity] = React.useState('');
    const [postalCode, setPostalCode] = React.useState('');
    
    // GST & Coupon State
    const [wantsGst, setWantsGst] = React.useState(false);
    const [gstin, setGstin] = React.useState('');
    const [companyName, setCompanyName] = React.useState('');
    const [couponCode, setCouponCode] = React.useState('');
    const [discountAmount, setDiscountAmount] = React.useState(0);
    const [appliedCoupon, setAppliedCoupon] = React.useState('');
    
    const justAddedAddress = React.useRef(false);


    // Effect 1: Set initial selected address when addresses load
    React.useEffect(() => {
        const defaultAddress = currentUser?.addresses?.find(addr => addr.isDefault);
        setSelectedAddressId(defaultAddress?.id || 'new');
    }, [currentUser?.addresses]);

    // Effect 2: Update form when selected address changes
    React.useEffect(() => {
        if (justAddedAddress.current) {
            justAddedAddress.current = false;
            return;
        }

        const addressToFill = currentUser?.addresses?.find(addr => addr.id === selectedAddressId);

        if (addressToFill) {
            const nameParts = addressToFill.fullName.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setAddress([addressToFill.addressLine1, addressToFill.addressLine2, addressToFill.landmark].filter(Boolean).join(', '));
            setCity(addressToFill.city);
            setPostalCode(addressToFill.pincode);
        } else { // 'new' case, when no default is set
            const nameParts = (currentUser?.name || '').split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setAddress('');
            setCity('');
            setPostalCode(userPinCode || '');
        }
    }, [selectedAddressId, currentUser?.name, currentUser?.addresses, userPinCode]);

    const isAddressValid = () => firstName && lastName && address && city && postalCode;
    
    const currentShippingCost = React.useMemo(() => {
        if (deliveryMethod === 'pickup' || subtotal === 0) return 0;
        return shippingCost;
    }, [deliveryMethod, shippingCost, subtotal]);

    const total = React.useMemo(() => {
        const calculatedTotal = subtotal + currentShippingCost - discountAmount;
        return Math.max(0, calculatedTotal);
    }, [subtotal, currentShippingCost, discountAmount]);
    
    const handleApplyCoupon = () => {
        const code = couponCode.toUpperCase().trim();
        if (!code) return;
    
        const coupon = coupons.find(c => c.code.toUpperCase() === code);
    
        if (!coupon) {
            addToast('Invalid coupon code.', 'error');
            return;
        }
        if (!coupon.isActive) {
            addToast('This coupon is no longer active.', 'error');
            return;
        }
        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            addToast('This coupon has expired.', 'error');
            return;
        }
    
        let discount = (subtotal * coupon.discountPercentage) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
        }
    
        setDiscountAmount(discount);
        setAppliedCoupon(coupon.code);
        addToast(`Coupon "${coupon.code}" applied! You saved ₹${discount.toLocaleString('en-IN')}.`, 'success');
    };
    
    const handleRemoveCoupon = () => {
        setDiscountAmount(0);
        setAppliedCoupon('');
        setCouponCode('');
        addToast('Coupon removed.', 'success');
    };

    const handlePlaceOrderSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // --- Validation First ---
        if (deliveryMethod === 'shipping' && !isAddressValid()) {
            addToast("Please fill out all address fields.", "error");
            return;
        }
        if (deliveryMethod === 'pickup' && !selectedStore) {
            addToast("Please select a pickup store.", "error");
            return;
        }

        setIsLoading(true);

        try {
            const details: Order['deliveryAddress'] | { storeId: number } =
                deliveryMethod === 'shipping'
                    ? { firstName, lastName, address, city, postalCode }
                    : { storeId: selectedStore! };

            // Ensure a clean slate before creating a new payment session.
            sessionStorage.removeItem('pendingOrderId');
            sessionStorage.removeItem('pendingOrderTotal');
            
            const newOrder = await onPlaceOrder({
                deliveryMethod,
                details,
                total,
                gstin: wantsGst ? gstin : undefined,
                companyName: wantsGst ? companyName : undefined,
                couponCode: appliedCoupon || undefined,
                discountAmount: discountAmount > 0 ? discountAmount : undefined,
            });

            if (newOrder) {
                // Store details for the simulated payment page
                sessionStorage.setItem('pendingOrderId', newOrder.id);
                sessionStorage.setItem('pendingOrderTotal', newOrder.total.toString());
                // Redirect to the simulated gateway
                window.location.hash = '/payment-gateway';
            } else {
                addToast("Failed to create order. Please try again.", "error");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Order creation failed:", error);
            addToast("An error occurred while creating your order. Please try again.", "error");
            setIsLoading(false);
        }
    };

    const handleSaveNewAddress = (newAddressData: Omit<Address, 'id' | 'isDefault' | 'country'>) => {
        const { fullName, addressLine1, addressLine2, landmark, city, pincode } = newAddressData;
        const nameParts = fullName.split(' ');
        
        justAddedAddress.current = true;
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setAddress([addressLine1, addressLine2, landmark].filter(Boolean).join(', '));
        setCity(city);
        setPostalCode(pincode);
        setSelectedAddressId('new');
        
        addToast('New delivery address has been set for this order.', 'success');
    };

    const inputClasses = "p-2 bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full";

    return (
        <>
        <div className="max-w-2xl mx-auto animate-fade-in">
             <form onSubmit={handlePlaceOrderSubmit}>
                <div className="space-y-10">
                    <div className="text-center">
                        <h2 className="text-4xl font-extrabold text-gray-800">Checkout</h2>
                    </div>

                     {/* Order Summary */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                            {cartItems.map(item => (
                                <div key={item.variant.id} className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <img src={item.variant.imageUrl || item.product.imageUrls[0]} alt={item.product.name} className="w-12 h-12 rounded-md object-cover mr-3" loading="lazy"/>
                                        <div>
                                            <p className="font-semibold text-sm">{item.product.name}</p>
                                            <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <span className="font-semibold text-sm">₹{(item.variant.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <label htmlFor="coupon" className="font-semibold text-sm text-gray-700">Coupon Code</label>
                            <div className="flex gap-2 mt-1">
                                <input id="coupon" type="text" value={couponCode} onChange={e => setCouponCode(e.target.value)} placeholder="Enter coupon" className={`${inputClasses} flex-grow`} disabled={!!appliedCoupon} />
                                <button type="button" onClick={handleApplyCoupon} disabled={!couponCode || !!appliedCoupon} className="bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-black disabled:bg-gray-400 text-sm">Apply</button>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                            <div className="flex justify-between text-gray-700"><span>Items</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                            <div className="flex justify-between text-gray-700"><span>Delivery</span><span>{currentShippingCost > 0 ? `₹${currentShippingCost.toLocaleString('en-IN')}` : 'Free'}</span></div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-green-600 font-semibold">
                                    <span>Discount ({appliedCoupon}) <button onClick={handleRemoveCoupon} className="text-red-500 text-xs ml-1">(Remove)</button></span>
                                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Delivery & Payment */}
                    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 space-y-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-4">Delivery Method</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`p-4 rounded-lg border-2 cursor-pointer text-center ${deliveryMethod === 'shipping' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                                    <input type="radio" name="deliveryMethod" value="shipping" checked={deliveryMethod === 'shipping'} onChange={() => setDeliveryMethod('shipping')} className="sr-only"/>
                                    <span className="font-semibold">Ship to Address</span>
                                </label>
                                <label className={`p-4 rounded-lg border-2 cursor-pointer text-center ${deliveryMethod === 'pickup' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                                    <input type="radio" name="deliveryMethod" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="sr-only"/>
                                    <span className="font-semibold">Pick Up In-Store</span>
                                </label>
                            </div>
                        </div>

                        {deliveryMethod === 'shipping' ? (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-2xl font-bold">Delivery Address</h3>
                                    <button type="button" onClick={() => setIsAddressModalOpen(true)} className="text-sm font-semibold text-blue-600 hover:underline">Change Address</button>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-md border text-gray-700">
                                    {isAddressValid() ? (
                                        <>
                                            <p className="font-semibold">{firstName} {lastName}</p>
                                            <p>{address}</p>
                                            <p>{city}, {postalCode}</p>
                                        </>
                                    ) : <p className="text-gray-500">Please add or select a delivery address.</p>}
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Select Pickup Location</h3>
                                <select value={selectedStore} onChange={(e) => setSelectedStore(Number(e.target.value))} className={inputClasses}>
                                    {stores.map(store => <option key={store.id} value={store.id}>{store.name} - {store.address}</option>)}
                                </select>
                            </div>
                        )}
                        
                        <div className="border-t pt-6 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="wantsGst" checked={wantsGst} onChange={e => setWantsGst(e.target.checked)} className="h-4 w-4 rounded"/>
                                <span className="font-semibold text-gray-700">I want to claim GST credit for this order.</span>
                            </label>
                            {wantsGst && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in pt-2">
                                <input name="gstin" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="Enter GSTIN" className={inputClasses} />
                                <input name="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Enter Company Name" className={inputClasses} />
                              </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Pay Now Bar */}
                     <div className="bg-gray-100 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                               <p className="text-lg font-bold text-gray-800">Total: ₹{total.toLocaleString('en-IN')}</p>
                               <p className="text-xs text-gray-500">(Inclusive of all taxes)</p>
                            </div>
                            <button type="button" onClick={onCancel} className="text-center text-gray-600 hover:text-black font-semibold text-sm">
                                Cancel
                            </button>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg transition-colors hover:bg-yellow-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center">
                            {isLoading ? (
                                <>
                                    <span className="spinner-border mr-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : 'Proceed to Secure Payment'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <AddressSelectionModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            addresses={currentUser?.addresses || []}
            selectedAddressId={selectedAddressId}
            onSelectAddress={(id) => {
                setSelectedAddressId(id);
                setIsAddressModalOpen(false);
            }}
            onSaveNewAddress={(data) => {
                // NOTE: This adds the address for this order only, it does not persist to the user's account.
                handleSaveNewAddress(data);
                setIsAddressModalOpen(false);
            }}
            addToast={addToast}
        />
        </>
    );
};

export default Checkout;