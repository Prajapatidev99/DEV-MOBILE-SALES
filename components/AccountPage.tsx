import * as React from 'react';
import type { User, Order, Address, CartItem } from '../types';

interface AccountPageProps {
  user: User;
  orders: Order[];
  isLoading: boolean;
  onTrackOrder: (order: Order) => void;
  onUpdateUser: (user: User) => void;
  onLogout: () => void;
  addToast: (message: string, type: 'success' | 'error') => void;
  onRequestReturn: (orderId: string, variantId: string, reason: string) => void;
}

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];


// --- Helper Components ---
const MenuItem: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }> = ({ icon, title, subtitle, onClick }) => (
    <button onClick={onClick} className="w-full text-left flex items-center p-4 hover:bg-gray-100 rounded-lg transition-colors">
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-600 rounded-lg mr-4">
            {icon}
        </div>
        <div className="flex-grow">
            <h3 className="font-semibold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
    </button>
);

const PlaceholderView: React.FC<{ title: string, onBack: () => void }> = ({ title, onBack }) => (
    <div>
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back
        </button>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 text-center">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-500">This feature is coming soon!</p>
        </div>
    </div>
);

// --- Sub-Page Components ---
interface ReturnRequestModalProps {
    item: CartItem;
    orderId: string;
    onClose: () => void;
    onSubmit: (orderId: string, variantId: string, reason: string) => void;
}
const ReturnRequestModal: React.FC<ReturnRequestModalProps> = ({ item, orderId, onClose, onSubmit }) => {
    const [reason, setReason] = React.useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert('Please provide a reason for the return.');
            return;
        }
        onSubmit(orderId, item.variant.id, reason);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Request Return</h2>
                <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                    <img src={item.variant.imageUrl || item.product.imageUrls[0]} alt={item.product.name} className="w-16 h-16 rounded-md" />
                    <div>
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-gray-600">{Object.values(item.variant.attributes).filter(Boolean).join(' / ')}</p>
                    </div>
                </div>
                <textarea 
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={4}
                    placeholder="Please tell us why you want to return this item..."
                    className="w-full p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                />
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="text-gray-600 font-semibold py-2 px-4">Cancel</button>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700">Submit Request</button>
                </div>
            </div>
        </div>
    );
};


const OrderHistoryView: React.FC<{ orders: Order[], isLoading: boolean, onTrackOrder: (order: Order) => void, onBack: () => void, onRequestReturn: (orderId: string, variantId: string, reason: string) => void }> = ({ orders, isLoading, onTrackOrder, onBack, onRequestReturn }) => {
    const [returnModalItem, setReturnModalItem] = React.useState<{ item: CartItem, orderId: string } | null>(null);

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pending Payment': return 'bg-orange-100 text-orange-800';
            case 'Pending Verification':
            case 'Pending Seller Acceptance': return 'bg-purple-100 text-purple-800';
            case 'Processing': return 'bg-yellow-100 text-yellow-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Out for Delivery': return 'bg-cyan-100 text-cyan-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            case 'Return Requested': return 'bg-indigo-100 text-indigo-800';
            case 'Refund Approved': return 'bg-green-100 text-green-800';
            case 'Return Rejected': return 'bg-red-100 text-red-800';
        }
    };
    
    const handleDownloadInvoice = (order: Order) => {
        sessionStorage.setItem('invoice_order', JSON.stringify(order));
        window.open('#/invoice', '_blank');
    };

    const getReturnStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch(status) {
            case 'pending': return 'text-yellow-600';
            case 'approved': return 'text-green-600';
            case 'rejected': return 'text-red-600';
        }
    }

    return (
        <>
            <div>
                <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    My Account
                </button>
                <h2 className="text-3xl font-bold mb-6">Your Orders</h2>
                {isLoading ? (
                  <p>Loading orders...</p>
                ) : orders.length > 0 ? (
                    <div className="space-y-6">
                    {orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(order => (
                        <div key={order.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                             <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                                <div>
                                    <p className="text-sm sm:text-md font-bold">Order ID: <span className="text-blue-600 font-mono">{order.id}</span></p>
                                    <p className="text-xs sm:text-sm text-gray-600">Date: {new Date(order.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>{order.status}</p>
                                    <p className="font-bold text-lg sm:text-xl mt-1">₹{order.total.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            
                            {order.status === 'Pending Verification' && order.verificationNotes && (
                                <div className="mt-2 mb-4 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 text-sm rounded-r-lg">
                                    <p className="font-bold">Payment Issue:</p>
                                    <p>{order.verificationNotes}</p>
                                </div>
                            )}

                            <div className="space-y-4 my-4">
                                {order.items.map(item => (
                                    <div key={item.variant.id} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <img src={item.variant.imageUrl || item.product.imageUrls[0]} alt={item.product.name} className="w-12 h-12 rounded-md hidden sm:block"/>
                                            <div>
                                                <p className="font-semibold">{item.product.name}</p>
                                                <p className="text-xs text-gray-500">{Object.values(item.variant.attributes).filter(Boolean).join(' / ')}</p>
                                            </div>
                                        </div>
                                         {order.status === 'Delivered' && (
                                            <div>
                                                {item.returnRequest ? (
                                                  <span className={`font-semibold capitalize ${getReturnStatusBadge(item.returnRequest.status)}`}>Return {item.returnRequest.status}</span>
                                                ) : (
                                                  <button onClick={() => setReturnModalItem({ item, orderId: order.id })} className="font-semibold text-blue-600 hover:underline">Request Return</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                             <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end items-center gap-4 flex-wrap">
                                   <button onClick={() => handleDownloadInvoice(order)} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">
                                        Download Invoice
                                    </button>
                                    {(order.status === 'Shipped' || order.status === 'Out for Delivery') && (
                                    <button onClick={() => onTrackOrder(order)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm">
                                        Track Order
                                    </button>
                                    )}
                                </div>
                        </div>
                    ))}
                    </div>
                ) : (
                    <p className="text-gray-600">You haven't placed any orders yet.</p>
                )}
            </div>
            {returnModalItem && (
                <ReturnRequestModal 
                    item={returnModalItem.item} 
                    orderId={returnModalItem.orderId}
                    onClose={() => setReturnModalItem(null)}
                    onSubmit={onRequestReturn}
                />
            )}
        </>
    );
};

interface ReturnItem {
    orderId: string;
    item: CartItem;
}

const MyReturnsView: React.FC<{ orders: Order[]; onBack: () => void }> = ({ orders, onBack }) => {
    const returnItems: ReturnItem[] = React.useMemo(() => {
        const items: ReturnItem[] = [];
        orders.forEach(order => {
            order.items.forEach(item => {
                if (item.returnRequest) {
                    items.push({ orderId: order.id, item });
                }
            });
        });
        return items.sort((a, b) => new Date(b.item.returnRequest!.date).getTime() - new Date(a.item.returnRequest!.date).getTime());
    }, [orders]);

    const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch(status) {
            case 'pending': return <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            case 'approved': return <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">Approved</span>;
            case 'rejected': return <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800">Rejected</span>;
        }
    }

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                My Account
            </button>
            <h2 className="text-3xl font-bold mb-6">My Returns</h2>
            {returnItems.length > 0 ? (
                <div className="space-y-4">
                    {returnItems.map(({ orderId, item }) => (
                        <div key={`${orderId}-${item.variant.id}`} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                            <div className="flex justify-between items-start flex-wrap gap-2 mb-4">
                                <div>
                                    <p className="text-sm font-bold">Order ID: <span className="text-blue-600 font-mono">{orderId}</span></p>
                                    <p className="text-xs text-gray-600">Requested on: {new Date(item.returnRequest!.date).toLocaleDateString()}</p>
                                </div>
                                {getStatusBadge(item.returnRequest!.status)}
                            </div>
                            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                                <img src={item.variant.imageUrl || item.product.imageUrls[0]} alt={item.product.name} className="w-16 h-16 rounded-md" />
                                <div>
                                    <p className="font-semibold">{item.product.name}</p>
                                    <p className="text-sm text-gray-600">{Object.values(item.variant.attributes).filter(Boolean).join(' / ')}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-gray-800">Reason for return:</h4>
                                <p className="text-sm text-gray-600 italic">"{item.returnRequest!.reason}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">You have not requested any returns.</p>
            )}
        </div>
    );
};


const PersonalDetailsView: React.FC<{ user: User, onUpdateUser: (user: User) => void, onBack: () => void }> = ({ user, onUpdateUser, onBack }) => {
    const [formData, setFormData] = React.useState({
        name: user.name,
        email: user.email,
        mobile: user.mobile || '',
        dob: user.dob || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser({ ...user, ...formData });
    };

    const inputClasses = "w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";
    
    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                My Account
            </button>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Personal Details</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className={labelClasses}>Full Name</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="mobile" className={labelClasses}>Mobile Number*</label>
                        <input id="mobile" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} maxLength={10} required className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="email" className={labelClasses}>Email</label>
                        <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className={inputClasses} />
                    </div>
                     <div>
                        <label htmlFor="dob" className={labelClasses}>Date of Birth</label>
                        <input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} className={inputClasses} />
                    </div>
                    <div className="text-right pt-4">
                        <button type="submit" className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-500 transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AddressFormView: React.FC<{
    addressToEdit: Address | null;
    onSave: (address: Omit<Address, 'id'> | Address) => void;
    onCancel: () => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}> = ({ addressToEdit, onSave, onCancel, addToast }) => {
    const [formData, setFormData] = React.useState<Omit<Address, 'id'>>({
        fullName: addressToEdit?.fullName || '',
        mobileNumber: addressToEdit?.mobileNumber || '',
        pincode: addressToEdit?.pincode || '',
        addressLine1: addressToEdit?.addressLine1 || '',
        addressLine2: addressToEdit?.addressLine2 || '',
        landmark: addressToEdit?.landmark || '',
        city: addressToEdit?.city || '',
        state: addressToEdit?.state || '',
        country: 'India',
        isDefault: addressToEdit?.isDefault || false,
        deliveryInstructions: addressToEdit?.deliveryInstructions || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(addressToEdit ? { ...formData, id: addressToEdit.id } : formData);
    };
    
    const inputClasses = "w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div>
            <button onClick={onCancel} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Saved Addresses
            </button>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">{addressToEdit ? 'Edit Address' : 'Add a new delivery address'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Country/Region</label><input value="India" readOnly className={`${inputClasses} bg-gray-200`} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Full name</label><input name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClasses} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label><input name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} required maxLength={10} className={inputClasses} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label><input name="pincode" value={formData.pincode} onChange={handleChange} required maxLength={6} className={inputClasses} /></div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Flat, House no., Building, Company, Apartment</label><input name="addressLine1" value={formData.addressLine1} onChange={handleChange} required className={inputClasses} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Area, Street, Sector, Village</label><input name="addressLine2" value={formData.addressLine2} onChange={handleChange} required className={inputClasses} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label><input name="landmark" value={formData.landmark || ''} onChange={handleChange} placeholder="E.g. near apollo hospital" className={inputClasses} /></div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Town/City</label><input name="city" value={formData.city} onChange={handleChange} required className={inputClasses} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <select name="state" value={formData.state} onChange={handleChange} required className={inputClasses}>
                                <option value="">Choose a state</option>
                                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex items-center gap-2"><input id="isDefault" name="isDefault" type="checkbox" checked={formData.isDefault} onChange={handleChange} className="h-4 w-4 rounded" /><label htmlFor="isDefault">Make this my default address</label></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Delivery instructions (optional)</label><textarea name="deliveryInstructions" value={formData.deliveryInstructions || ''} onChange={handleChange} rows={3} placeholder="Add preferences, notes, access codes and more" className={inputClasses}></textarea></div>
                    <div className="pt-2"><button type="submit" className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-500 transition-colors">Use this address</button></div>
                </form>
            </div>
        </div>
    );
};

const SavedAddressesView: React.FC<{
    user: User;
    onUpdateUser: (user: User) => void;
    onAdd: () => void;
    onEdit: (addressId: number) => void;
    onBack: () => void;
}> = ({ user, onUpdateUser, onAdd, onEdit, onBack }) => {
    
    const handleDelete = (addressId: number) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            const updatedAddresses = (user.addresses || []).filter(a => a.id !== addressId);
            onUpdateUser({ ...user, addresses: updatedAddresses });
        }
    };
    
    const handleSetDefault = (addressId: number) => {
        const updatedAddresses = (user.addresses || []).map(a => ({ ...a, isDefault: a.id === addressId }));
        onUpdateUser({ ...user, addresses: updatedAddresses });
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                My Account
            </button>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold">Saved Addresses</h2>
                 <button onClick={onAdd} className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors text-sm">+ Add New Address</button>
            </div>
            <div className="space-y-4">
                {(user.addresses || []).map(address => (
                    <div key={address.id} className="bg-white p-4 rounded-lg border border-gray-200 flex justify-between items-start">
                        <div>
                            {address.isDefault && <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded-full mb-2 inline-block">Default</span>}
                            <p className="font-semibold">{address.fullName}</p>
                            <p className="text-gray-600">{address.addressLine1}, {address.addressLine2}</p>
                            <p className="text-gray-600">{address.city}, {address.state} {address.pincode}</p>
                            <p className="text-gray-600">{address.country}</p>
                            <p className="text-gray-600 mt-1">Mobile: {address.mobileNumber}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-end gap-2 text-sm font-semibold">
                            {!address.isDefault && <button onClick={() => handleSetDefault(address.id)} className="text-blue-600 hover:underline">Set as Default</button>}
                            <button onClick={() => onEdit(address.id)} className="text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDelete(address.id)} className="text-red-600 hover:underline">Delete</button>
                        </div>
                    </div>
                ))}
                {(!user.addresses || user.addresses.length === 0) && (
                    <p className="text-center text-gray-500 p-8 bg-gray-50 rounded-lg">You have no saved addresses.</p>
                )}
            </div>
        </div>
    );
};

const NotificationSettingsView: React.FC<{ user: User; onUpdateUser: (user: User) => void; onBack: () => void }> = ({ user, onUpdateUser, onBack }) => {
    const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateUser({ ...user, marketingConsent: e.target.checked });
    };

    return (
        <div>
            <button onClick={onBack} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                My Account
            </button>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Notification Settings</h2>
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border cursor-pointer">
                        <div>
                            <h4 className="font-semibold">Marketing Communications</h4>
                            <p className="text-sm text-gray-600">Receive offers and updates via WhatsApp, SMS, and Email.</p>
                        </div>
                        <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                            <input type="checkbox" checked={!!user.marketingConsent} onChange={handleConsentChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                            <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></span>
                        </div>
                        <style>{`.toggle-checkbox:checked { right: 0; border-color: #3b82f6; } .toggle-checkbox:checked + .toggle-label { background-color: #3b82f6; }`}</style>
                    </label>
                    <div className="p-4 bg-gray-50 rounded-lg border">
                        <p className="font-semibold">Unsubscribe from all emails</p>
                        <a href="#" onClick={e => e.preventDefault()} className="text-sm text-blue-600 hover:underline">Click here to manage your email preferences (coming soon).</a>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main View Component ---
type MainViewProps = {
    user: User;
    onNavigate: (view: string) => void;
    onLogout: () => void;
}
const MainAccountView: React.FC<MainViewProps> = ({ user, onNavigate, onLogout }) => {
    const menuItems = [
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, title: "Orders", subtitle: "Track your orders", onClick: () => onNavigate('orders') },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3" /></svg>, title: "My Returns", subtitle: "Check return status", onClick: () => onNavigate('returns') },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, title: "Personal Details", subtitle: "Name, Email, Phone Number", onClick: () => onNavigate('details') },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>, title: "Saved Address", subtitle: "Manage delivery addresses", onClick: () => onNavigate('address') },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>, title: "My Coupons", subtitle: "Manage coupons for additional discounts", onClick: () => onNavigate('coupons') },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>, title: "Notification Settings", subtitle: "Manage marketing preferences", onClick: () => onNavigate('settings') },
        { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4c0-1.191.445-2.262 1.156-3.043.192-.204.398-.415.626-.632z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V3m0 18v-3m-7.071-7.071L2.929 14.14m11.142 0l-2.071-2.071M6.343 6.343l2.071 2.071m5.657 5.657l2.07 2.07M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>, title: "Help and Support", subtitle: "Contact us for assistance", onClick: () => window.location.hash = '#/contact' },
    ];
    
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-2xl font-bold mr-4 flex-shrink-0">
                    {user.name.charAt(0)}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                    <p className="text-gray-500">+91 {user.mobile}</p>
                </div>
            </div>

            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <div className="divide-y divide-gray-100">
                    {menuItems.map(item => <MenuItem key={item.title} {...item} />)}
                </div>
            </div>

            <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                <MenuItem 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m-3.512 4.088l-2.07 11.822" /></svg>}
                    title="Change Prefered Language"
                    subtitle="English"
                    onClick={() => onNavigate('language')}
                />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                 <button className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">Deactivate Account</button>
                 <button onClick={onLogout} className="text-sm font-semibold text-gray-600 hover:text-black transition-colors">Log Out</button>
            </div>
        </div>
    );
};

// --- Main Page Component ---
const AccountPage: React.FC<AccountPageProps> = ({ user, orders, isLoading, onTrackOrder, onUpdateUser, onLogout, addToast, onRequestReturn }) => {
  const [view, setView] = React.useState('main');
  const [editingAddressId, setEditingAddressId] = React.useState<number | null>(null);

  const handleSaveAddress = (addressData: Omit<Address, 'id'> | Address) => {
    let updatedAddresses = [...(user.addresses || [])];
    
    if ('id' in addressData) { // Editing
        const index = updatedAddresses.findIndex(a => a.id === addressData.id);
        if (index > -1) {
            updatedAddresses[index] = addressData;
        }
    } else { // Adding
        const newAddress: Address = { ...addressData, id: Date.now() };
        updatedAddresses.push(newAddress);
    }
    
    if (addressData.isDefault) {
        updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: a.id === ('id' in addressData ? addressData.id : updatedAddresses[updatedAddresses.length-1].id) }));
    }

    onUpdateUser({ ...user, addresses: updatedAddresses });
    setView('address');
  };

  const renderView = () => {
    switch (view) {
        case 'orders':
            return <OrderHistoryView orders={orders} isLoading={isLoading} onTrackOrder={onTrackOrder} onBack={() => setView('main')} onRequestReturn={onRequestReturn} />;
        case 'returns':
            return <MyReturnsView orders={orders} onBack={() => setView('main')} />;
        case 'details':
            return <PersonalDetailsView user={user} onUpdateUser={(updatedUser) => { onUpdateUser(updatedUser); setView('main');}} onBack={() => setView('main')} />;
        case 'address':
            return <SavedAddressesView user={user} onUpdateUser={onUpdateUser} onAdd={() => { setEditingAddressId(null); setView('add-address'); }} onEdit={(id) => { setEditingAddressId(id); setView('edit-address'); }} onBack={() => setView('main')} />;
        case 'add-address':
        case 'edit-address':
            return <AddressFormView addressToEdit={(user.addresses || []).find(a => a.id === editingAddressId) || null} onSave={handleSaveAddress} onCancel={() => setView('address')} addToast={addToast} />;
        case 'settings':
            return <NotificationSettingsView user={user} onUpdateUser={onUpdateUser} onBack={() => setView('main')} />;
        case 'coupons':
        case 'language':
            const titleMap: { [key: string]: string } = {
                coupons: 'My Coupons',
                language: 'Change Language'
            };
            return <PlaceholderView title={titleMap[view]} onBack={() => setView('main')} />;
        case 'main':
        default:
            return <MainAccountView user={user} onNavigate={setView} onLogout={onLogout} />;
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
        {renderView()}
    </div>
  );
};

export default AccountPage;