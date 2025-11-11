import * as React from 'react';
import type { Product, HomepageConfig, Coupon, Order, User, Store, Payout, FocalPoint, HeroBannerConfig, PromoBannerConfig, ProductVariant, CartItem } from '../types';
import ProductEditorModal from './ProductEditorModal';
import * as api from '../api';
import ImageResolver from './ImageResolver';

const placeholderPromo = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVlnaHQ9IjEwMCUiIGZpbGw9IiNkM2U1ZjUiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCIgZHk9Ii4zZW0iIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPlQcm9tbzwvdGV4dD48L3N2Zz4=';

// --- Reusable Components ---
const Card: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 flex items-center">
        <div className="bg-blue-100 text-blue-600 rounded-full h-12 w-12 flex items-center justify-center mr-4">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const MarketingView: React.FC<{
    allUsers: User[];
    addToast: (message: string, type: 'success' | 'error') => void;
}> = ({ allUsers, addToast }) => {
    const [message, setMessage] = React.useState('Hi {name}, check out our latest deals this week! Get free delivery on all orders above ₹5000.');
    const [isSending, setIsSending] = React.useState(false);

    const handleSend = () => {
        if (!message) {
            addToast('Please enter a message.', 'error');
            return;
        }
        const customerUsers = allUsers.filter(u => u.role === 'customer');
        if (customerUsers.length === 0) {
            addToast('No customers to send messages to.', 'error');
            return;
        }

        setIsSending(true);
        addToast(`Simulating campaign... preparing to send to ${customerUsers.length} customers.`, 'success');

        setTimeout(() => {
            customerUsers.forEach(user => {
                const personalizedMessage = message.replace(/{name}/g, user.name.split(' ')[0]);
                console.log(`[Marketing Simulation] Sending to ${user.mobile || user.email}: ${personalizedMessage}`);
            });
            setIsSending(false);
            addToast(`Successfully simulated sending messages to ${customerUsers.length} customers!`, 'success');
        }, 2000);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <h2 className="text-xl font-bold mb-4">WhatsApp Marketing Campaign</h2>
            <p className="text-sm text-gray-600 mb-4">
                Compose a message to send to all customers. Use the placeholder <code>{'{name}'}</code> to insert the customer's first name for a personal touch.
            </p>
            <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                className="w-full p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your marketing message here..."
            />
            <div className="text-right mt-4">
                <button
                    onClick={handleSend}
                    disabled={isSending}
                    className="bg-green-600 text-white font-bold py-2 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                    {isSending ? 'Sending...' : 'Send to All Customers'}
                </button>
            </div>
        </div>
    );
};

// --- Homepage Editor ---
interface HomepageEditorProps {
    config: HomepageConfig;
    onSave: (newConfig: HomepageConfig) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const HomepageEditor: React.FC<HomepageEditorProps> = ({ config, onSave, addToast }) => {
    const [editorState, setEditorState] = React.useState<HomepageConfig>(config);
    const [imagePreviewUrl, setImagePreviewUrl] = React.useState<string | null>(null);
    const [focalPointTarget, setFocalPointTarget] = React.useState<{ type: 'hero' | 'promo'; index?: number } | null>(null);

    React.useEffect(() => {
        setEditorState(config);
    }, [config]);

    const handleHeroChange = (field: keyof HeroBannerConfig, value: string | FocalPoint) => {
        setEditorState(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
    };

    const handlePromoChange = (index: number, field: keyof PromoBannerConfig, value: string | FocalPoint) => {
        setEditorState(prev => {
            const newPromos = prev.promos.map((promo, i) => {
                if (i === index) {
                    return { ...promo, [field]: value };
                }
                return promo;
            });
            return { ...prev, promos: newPromos };
        });
    };

    const handleAddPromo = () => {
        setEditorState(prev => ({
            ...prev,
            promos: [
                ...prev.promos,
                {
                    id: Date.now(),
                    title: 'New Promo Banner',
                    subtitle: 'Edit this subtitle',
                    imageUrl: placeholderPromo,
                    link: '#/shop',
                }
            ]
        }));
    };

    const handleRemovePromo = (idToRemove: number) => {
        if (window.confirm('Are you sure you want to remove this promo banner?')) {
             setEditorState(prev => ({
                ...prev,
                promos: prev.promos.filter(promo => promo.id !== idToRemove)
            }));
        }
    };
    
    const handleFileChange = async (
      e: React.ChangeEvent<HTMLInputElement>,
      type: 'hero' | 'promo',
      index?: number
    ) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            addToast('Image size should not exceed 5MB.', 'error');
            return;
        }
        try {
            const imageKey = await api.saveImageToDb(file);
            const imageUrl = `idb://${imageKey}`;
            
            if (type === 'hero') {
                handleHeroChange('imageUrl', imageUrl);
            } else if (type === 'promo' && index !== undefined) {
                handlePromoChange(index, 'imageUrl', imageUrl);
            }
            addToast('Image uploaded to local database.', 'success');
        } catch (error) {
            console.error("Failed to save image to DB", error);
            addToast('Failed to save image.', 'error');
        }
      }
    };

    const handleSetFocalPoint = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!focalPointTarget) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        const focalPoint = { x, y };

        if (focalPointTarget.type === 'hero') {
            handleHeroChange('focalPoint', focalPoint);
        } else if (focalPointTarget.type === 'promo' && focalPointTarget.index !== undefined) {
            handlePromoChange(focalPointTarget.index, 'focalPoint', focalPoint);
        }
        
        setImagePreviewUrl(null);
        setFocalPointTarget(null);
    };

    const inputClasses = "w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <h2 className="text-xl font-bold mb-4">Homepage Editor</h2>
            <div className="space-y-8">
                {/* Hero Banner Editor */}
                <div className="p-4 border rounded-lg bg-gray-50/50">
                    <h3 className="text-lg font-semibold mb-3">Hero Banner</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                        <div>
                            <label className={labelClasses}>Title</label>
                            <input value={editorState.hero.title} onChange={e => handleHeroChange('title', e.target.value)} className={inputClasses} />
                        </div>
                         <div>
                            <label className={labelClasses}>Image</label>
                            <div className="flex items-center gap-4">
                                <ImageResolver src={editorState.hero.imageUrl} alt="Hero preview" className="w-24 h-16 object-cover rounded-md border" />
                                <input type="file" onChange={e => handleFileChange(e, 'hero')} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                            </div>
                        </div>
                    </div>
                    <button onClick={() => { setImagePreviewUrl(editorState.hero.imageUrl); setFocalPointTarget({ type: 'hero' }); }} className="text-sm text-blue-600 hover:underline mt-2">Set Image Focal Point</button>
                </div>

                {/* Promo Banners Editor */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Promotional Banners</h3>
                    {editorState.promos.map((promo, index) => (
                        <div key={promo.id} className="p-4 border rounded-lg bg-gray-50/50 relative">
                             <button
                                type="button"
                                onClick={() => handleRemovePromo(promo.id)}
                                className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-red-200 z-10"
                                aria-label="Remove promo banner"
                            >
                                &times;
                            </button>
                            <h4 className="font-semibold mb-3">Promo Banner {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div><label className={labelClasses}>Title</label><input value={promo.title} onChange={e => handlePromoChange(index, 'title', e.target.value)} className={inputClasses} /></div>
                                <div><label className={labelClasses}>Subtitle</label><input value={promo.subtitle} onChange={e => handlePromoChange(index, 'subtitle', e.target.value)} className={inputClasses} /></div>
                                <div className="md:col-span-2">
                                    <label className={labelClasses}>Image</label>
                                    <div className="flex items-center gap-4">
                                        <ImageResolver src={promo.imageUrl} alt={`Promo ${index+1} preview`} className="w-24 h-16 object-cover rounded-md border" />
                                        <input type="file" onChange={e => handleFileChange(e, 'promo', index)} accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                                    </div>
                                </div>
                                <div><label className={labelClasses}>Link (e.g., #/shop/Smartphones)</label><input value={promo.link} onChange={e => handlePromoChange(index, 'link', e.target.value)} className={inputClasses} /></div>
                            </div>
                            <button onClick={() => { setImagePreviewUrl(promo.imageUrl); setFocalPointTarget({ type: 'promo', index }); }} className="text-sm text-blue-600 hover:underline mt-2">Set Image Focal Point</button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={handleAddPromo}
                        className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-center text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
                    >
                        + Add Promotional Banner
                    </button>
                </div>
            </div>
            <div className="text-right mt-6 pt-4 border-t">
                <button onClick={() => onSave(editorState)} className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-500">Save Homepage</button>
            </div>
            
            {imagePreviewUrl && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70]" onClick={() => setImagePreviewUrl(null)}>
                    <div className="bg-white p-4 rounded-lg text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold mb-2">Click to Set Focal Point</h3>
                        <p className="text-sm text-gray-600 mb-2">Choose the most important part of the image to keep it centered.</p>
                        <div className="relative cursor-crosshair">
                            <ImageResolver src={imagePreviewUrl} alt="Focal point preview" className="max-w-lg max-h-96 object-contain" onClick={handleSetFocalPoint} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Coupon Editor Modal ---
interface CouponEditorModalProps {
    coupon: Coupon | null;
    onClose: () => void;
    onSave: (coupon: Coupon) => void;
}
const CouponEditorModal: React.FC<CouponEditorModalProps> = ({ coupon, onClose, onSave }) => {
    const [couponData, setCouponData] = React.useState<Coupon>(coupon || { code: '', discountPercentage: 0, isActive: true });
    
    React.useEffect(() => {
        setCouponData(coupon || { code: '', discountPercentage: 0, isActive: true });
    }, [coupon]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setCouponData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = () => {
        if (!couponData.code || couponData.discountPercentage <= 0) {
            alert('Please enter a code and a valid discount percentage.');
            return;
        }
        onSave({ ...couponData, code: couponData.code.toUpperCase() });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60]" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">{coupon ? 'Edit Coupon' : 'Add Coupon'}</h2>
                <div className="space-y-4">
                    <div><label>Code</label><input name="code" value={couponData.code} onChange={handleChange} disabled={!!coupon} className="w-full p-2 border rounded-md" /></div>
                    <div><label>Discount %</label><input name="discountPercentage" type="number" value={couponData.discountPercentage} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                    <div><label>Max Discount (₹)</label><input name="maxDiscount" type="number" value={couponData.maxDiscount || ''} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                    <div><label>Expiry Date</label><input name="expiryDate" type="date" value={couponData.expiryDate || ''} onChange={handleChange} className="w-full p-2 border rounded-md" /></div>
                    <div><label className="flex items-center gap-2"><input name="isActive" type="checkbox" checked={couponData.isActive} onChange={handleChange} /> Active</label></div>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="text-gray-600 font-semibold">Cancel</button>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md">Save</button>
                </div>
            </div>
        </div>
    );
};


// --- Rejection Modal ---
interface RejectionModalProps {
    product: Product | null;
    onClose: () => void;
    onConfirm: (productId: number, reason: string) => void;
}
const RejectionModal: React.FC<RejectionModalProps> = ({ product, onClose, onConfirm }) => {
    const [reason, setReason] = React.useState('');
    if (!product) return null;

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert('Please provide a reason for rejection.');
            return;
        }
        onConfirm(product.id, reason);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Reject Product: <span className="font-normal">{product.name}</span></h2>
                <textarea 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    rows={4} 
                    placeholder="Provide a clear reason for rejection..." 
                    className="w-full p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                ></textarea>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onClose} className="text-gray-600 font-semibold py-2 px-4">Cancel</button>
                    <button onClick={handleSubmit} className="bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 transition-colors">Confirm Rejection</button>
                </div>
            </div>
        </div>
    );
};


// --- VIEW COMPONENTS ---
const DashboardView: React.FC<{ allOrders: Order[], allUsers: User[], products: Product[], coupons: Coupon[] }> = ({ allOrders, allUsers, products, coupons }) => {
    const totalRevenue = (allOrders ?? []).reduce((sum, order) => sum + (order?.total || 0), 0);
    const totalOrders = allOrders.length;
    const totalCustomers = allUsers.filter(u => u.role !== 'admin').length;

    const totalCost = (allOrders ?? []).reduce((sum, order) => {
        if (!order || !Array.isArray(order.items)) return sum;
        const orderCost = order.items.reduce((orderSum, item) => {
            if (!item || typeof item.variant !== 'object' || item.variant === null || typeof item.quantity !== 'number') return orderSum;
            const cost = typeof item.variant.costPrice === 'number' ? item.variant.costPrice : (typeof item.variant.price === 'number' ? item.variant.price * 0.85 : 0);
            return orderSum + (cost * item.quantity);
        }, 0);
        return sum + orderCost;
    }, 0);
    const totalProfit = totalRevenue - totalCost;
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
            <Card title="Total Profit" value={`₹${totalProfit.toLocaleString('en-IN')}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
            <Card title="Total Orders" value={totalOrders.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4z" /></svg>} />
            <Card title="Total Customers" value={totalCustomers.toLocaleString()} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197" /></svg>} />
        </div>
    );
};

const ProductsView: React.FC<{
    products: Product[];
    onAdd: () => void;
    onEdit: (product: Product) => void;
    onDelete: (productId: number) => void;
}> = ({ products, onAdd, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const getStatusBadge = (status: Product['approvalStatus']) => {
        switch (status) {
            case 'approved': return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">Approved</span>;
            case 'pending': return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-yellow-600 bg-yellow-200">Pending</span>;
            case 'rejected': return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">Rejected</span>;
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <input type="text" placeholder="Search products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-1/3 px-3 py-2 bg-gray-50 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button onClick={onAdd} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">+ Add New Product</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Product Name</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Stock</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">{p.name} {p.rejectionReason && <span className="text-red-500 text-xs block" title={p.rejectionReason}>(Rejection Reason: {p.rejectionReason})</span>}</td>
                                <td className="px-4 py-2">{getStatusBadge(p.approvalStatus)}</td>
                                <td className="px-4 py-2">{p.variants.reduce((total, v) => total + v.inventory.reduce((sub, i) => sub + i.quantity, 0), 0)}</td>
                                <td className="px-4 py-2 space-x-2">
                                    <button onClick={() => onEdit(p)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => onDelete(p.id)} className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ApprovalsView: React.FC<{
    products: Product[];
    onApprove: (productId: number) => void;
    onReject: (product: Product) => void;
}> = ({ products, onApprove, onReject }) => {
    const pendingProducts = products.filter(p => p.approvalStatus === 'pending');
    
    if (pendingProducts.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-md border mt-6"><p>No products are pending approval.</p></div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <h2 className="text-xl font-bold mb-4">Products Pending Approval</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Product Name</th>
                            <th className="px-4 py-2">Brand</th>
                            <th className="px-4 py-2">Seller</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingProducts.map(p => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium">{p.name}</td>
                                <td className="px-4 py-2">{p.brand}</td>
                                <td className="px-4 py-2">{p.sellerId ? `Store ID: ${p.sellerId}` : 'Admin'}</td>
                                <td className="px-4 py-2 space-x-2">
                                    <button onClick={() => onApprove(p.id)} className="text-green-600 font-semibold hover:underline">Approve</button>
                                    <button onClick={() => onReject(p)} className="text-red-600 font-semibold hover:underline">Reject</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const OrdersView: React.FC<{
    orders: Order[];
    allStores: Store[];
    allUsers: User[];
    onUpdateStatus: (orderId: string, newStatus: Order['status'], payload?: Partial<Order>) => void;
    onUnverify: (order: Order) => void;
}> = ({ orders, allStores, allUsers, onUpdateStatus, onUnverify }) => {
    const [expandedOrderId, setExpandedOrderId] = React.useState<string | null>(null);

    const toggleExpansion = (orderId: string) => {
        setExpandedOrderId(prev => (prev === orderId ? null : orderId));
    };

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Pending Payment': return 'text-orange-800 bg-orange-100';
            case 'Pending Verification':
            case 'Pending Seller Acceptance': return 'text-purple-800 bg-purple-100';
            case 'Processing':
            case 'Accepted': return 'text-yellow-800 bg-yellow-100';
            case 'Shipped': return 'text-blue-800 bg-blue-100';
            case 'Out for Delivery': return 'text-cyan-800 bg-cyan-100';
            case 'Delivered': return 'text-green-800 bg-green-100';
            case 'Cancelled':
            case 'Return Rejected': return 'text-red-800 bg-red-100';
            case 'Return Requested':
            case 'Refund Approved': return 'text-indigo-800 bg-indigo-100';
            default: return 'text-gray-800 bg-gray-100';
        }
    };
    
    const OrderDetails: React.FC<{ order: Order; user: User | undefined; store?: Store }> = ({ order, user, store }) => {
        const getVariantDescription = (variant: ProductVariant) => {
            return Object.values(variant.attributes).filter(Boolean).join(' / ');
        };
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm p-4">
                <div className="space-y-4">
                    <div>
                        <h4 className="font-bold text-gray-600 uppercase text-xs mb-1">Customer Details</h4>
                        <p className="font-semibold">{user?.name}</p>
                        <p className="text-gray-600">{user?.email}</p>
                        <p className="text-gray-600">{user?.mobile}</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-600 uppercase text-xs mb-1">Delivery Details</h4>
                        {order.deliveryMethod === 'shipping' ? (
                            <>
                                <p className="font-semibold">{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
                                <p className="text-gray-600">{order.deliveryAddress.address}</p>
                                <p className="text-gray-600">{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}</p>
                            </>
                        ) : (
                            <>
                                <p className="font-semibold">Store Pickup</p>
                                <p className="text-gray-600">{order.pickupStore?.name}</p>
                                <p className="text-gray-600">{order.pickupStore?.address}</p>
                            </>
                        )}
                    </div>
                    {order.verificationNotes && (
                        <div>
                            <h4 className="font-bold text-gray-600 uppercase text-xs mb-1">Correction Notes</h4>
                            <p className="text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{order.verificationNotes}</p>
                        </div>
                    )}
                </div>

                <div className="md:col-span-2 space-y-4">
                    <div>
                        <h4 className="font-bold text-gray-600 uppercase text-xs mb-2">Items Ordered</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {order.items.map(item => (
                                <div key={item.variant.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                    <div>
                                        <p className="font-semibold">{item.product.name}</p>
                                        <p className="text-gray-500 text-xs">{getVariantDescription(item.variant)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p>{item.quantity} x ₹{item.variant.price.toLocaleString('en-IN')}</p>
                                        <p className="font-semibold">₹{(item.quantity * item.variant.price).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold text-gray-600 uppercase text-xs mb-1">Payment & Billing</h4>
                        <p><strong>UTR:</strong> {order.paymentId || 'N/A'}</p>
                        {order.couponCode && <p><strong>Coupon:</strong> {order.couponCode} (-₹{order.discountAmount?.toLocaleString('en-IN')})</p>}
                        {store && <p><strong>Fulfilled By:</strong> {store.name}</p>}
                        {order.companyName && <p><strong>Company:</strong> {order.companyName}</p>}
                        {order.gstin && <p><strong>GSTIN:</strong> {order.gstin}</p>}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <h2 className="text-xl font-bold mb-4">All Orders</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2"></th>
                            <th className="px-4 py-2">Order ID</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2">Customer</th>
                            <th className="px-4 py-2">Total</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => {
                            const user = allUsers.find(u => u.id === order.userId);
                            const store = allStores.find(s => s.id === order.fulfilledByStoreId);
                            const isExpanded = expandedOrderId === order.id;
                            
                            return (
                                <React.Fragment key={order.id}>
                                    <tr className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpansion(order.id)}>
                                        <td className="px-4 py-2 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </td>
                                        <td className="px-4 py-2 font-mono text-blue-600">{order.id}</td>
                                        <td className="px-4 py-2">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2">{user ? user.name : `User ID: ${order.userId}`}</td>
                                        <td className="px-4 py-2 font-semibold">₹{order.total.toLocaleString('en-IN')}</td>
                                        <td className="px-4 py-2">
                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="flex gap-2 flex-wrap">
                                                {order.status === 'Pending Verification' && (
                                                    <>
                                                        <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Processing', { verificationNotes: '' })}} className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">Verify Payment</button>
                                                        <button onClick={(e) => { e.stopPropagation(); onUnverify(order); }} className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">Request Correction</button>
                                                    </>
                                                )}
                                                
                                                {/* Admin Fulfillment Workflow */}
                                                {!order.fulfilledByStoreId && (
                                                    <>
                                                        {order.status === 'Processing' && (
                                                            <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Shipped')}} className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">Ship Order</button>
                                                        )}
                                                        {order.status === 'Shipped' && (
                                                            <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Out for Delivery')}} className="bg-cyan-500 text-white text-xs font-bold px-2 py-1 rounded">Out for Delivery</button>
                                                        )}
                                                        {order.status === 'Out for Delivery' && (
                                                            <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'Delivered')}} className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">Mark Delivered</button>
                                                        )}
                                                    </>
                                                )}
                                           </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="border-b bg-gray-50">
                                            <td colSpan={7}>
                                                <OrderDetails order={order} user={user} store={store} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CouponsView: React.FC<{
    coupons: Coupon[];
    onAdd: () => void;
    onEdit: (coupon: Coupon) => void;
    onDelete: (code: string) => void;
}> = ({ coupons, onAdd, onEdit, onDelete }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Manage Coupons</h2>
                <button onClick={onAdd} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md">+ Add Coupon</button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Code</th>
                            <th className="px-4 py-2">Discount</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Expires</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(c => (
                            <tr key={c.code} className="border-b">
                                <td className="px-4 py-2 font-mono">{c.code}</td>
                                <td className="px-4 py-2">{c.discountPercentage}% {c.maxDiscount ? `(up to ₹${c.maxDiscount})` : ''}</td>
                                <td className="px-4 py-2">{c.isActive ? 'Active' : 'Inactive'}</td>
                                <td className="px-4 py-2">{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}</td>
                                <td className="px-4 py-2 space-x-2">
                                    <button onClick={() => onEdit(c)} className="text-blue-600">Edit</button>
                                    <button onClick={() => onDelete(c.code)} className="text-red-600">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ReturnsView: React.FC<{
    allOrders: Order[];
    allUsers: User[];
    onUpdateReturnStatus: (orderId: string, variantId: string, status: 'approved' | 'rejected') => void;
}> = ({ allOrders, allUsers, onUpdateReturnStatus }) => {
    
    const returnItems = React.useMemo(() => {
        const items: { order: Order, item: CartItem }[] = [];
        allOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.returnRequest) {
                    items.push({ order, item });
                }
            });
        });
        // Sort by pending first, then by date
        return items.sort((a, b) => {
            if (a.item.returnRequest!.status === 'pending' && b.item.returnRequest!.status !== 'pending') return -1;
            if (a.item.returnRequest!.status !== 'pending' && b.item.returnRequest!.status === 'pending') return 1;
            return new Date(b.item.returnRequest!.date).getTime() - new Date(a.item.returnRequest!.date).getTime();
        });
    }, [allOrders]);

    if (returnItems.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-md border mt-6"><p>No return requests found.</p></div>;
    }

    const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
        switch(status) {
            case 'pending': return <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
            case 'approved': return <span className="text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800">Approved</span>;
            case 'rejected': return <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-800">Rejected</span>;
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
             <h2 className="text-xl font-bold mb-4">Manage Return Requests</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Order ID</th>
                            <th className="px-4 py-2">Product</th>
                            <th className="px-4 py-2">Customer</th>
                            <th className="px-4 py-2">Reason</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returnItems.map(({ order, item }) => {
                            const user = allUsers.find(u => u.id === order.userId);
                            const returnRequest = item.returnRequest!;
                            return (
                                <tr key={`${order.id}-${item.variant.id}`} className="border-b">
                                    <td className="px-4 py-2 font-mono">{order.id}</td>
                                    <td className="px-4 py-2">{item.product.name}</td>
                                    <td className="px-4 py-2">{user?.name || 'N/A'}</td>
                                    <td className="px-4 py-2 max-w-xs truncate" title={returnRequest.reason}>{returnRequest.reason}</td>
                                    <td className="px-4 py-2">{getStatusBadge(returnRequest.status)}</td>
                                    <td className="px-4 py-2">
                                        {returnRequest.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <button onClick={() => onUpdateReturnStatus(order.id, item.variant.id, 'approved')} className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">Approve</button>
                                                <button onClick={() => onUpdateReturnStatus(order.id, item.variant.id, 'rejected')} className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Reject</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
             </div>
        </div>
    );
};


// --- MAIN ADMIN PAGE ---
interface AdminPageProps {
    currentUser: User & { role: 'admin' };
    products: Product[];
    allOrders: Order[];
    allUsers: User[];
    allStores: Store[];
    onUpdateOrder: (orderId: string, newStatus: Order['status'], payload?: Partial<Order>) => void;
    onAddProduct: (productData: Omit<Product, 'id' | 'reviews'>) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: number) => void;
    homepageConfig: HomepageConfig | null;
    onUpdateHomepageConfig: (config: HomepageConfig) => void;
    coupons: Coupon[];
    onAddCoupon: (couponData: Coupon) => void;
    onUpdateCoupon: (couponData: Coupon) => void;
    onDeleteCoupon: (couponCode: string) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
    onUpdateReturnStatus: (orderId: string, variantId: string, status: 'approved' | 'rejected') => void;
}

type AdminTab = 'dashboard' | 'products' | 'approvals' | 'orders' | 'homepage' | 'coupons' | 'returns' | 'marketing';


const AdminPage: React.FC<AdminPageProps> = (props) => {
    const [activeTab, setActiveTab] = React.useState<AdminTab>('dashboard');
    const [isProductModalOpen, setProductModalOpen] = React.useState(false);
    const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
    const [rejectionModalProduct, setRejectionModalProduct] = React.useState<Product | null>(null);
    const [couponToEdit, setCouponToEdit] = React.useState<Coupon | null>(null);
    const [isCouponModalOpen, setCouponModalOpen] = React.useState(false);
    const [unverifyModalOrder, setUnverifyModalOrder] = React.useState<Order | null>(null);
    const [unverifyReason, setUnverifyReason] = React.useState('');

    const { products, onAddProduct, onUpdateProduct, onDeleteProduct, addToast, onAddCoupon, onUpdateCoupon, onDeleteCoupon } = props;

    const tabs: { id: AdminTab; label: string; count?: number }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'approvals', label: 'Approvals', count: products.filter(p => p.approvalStatus === 'pending').length },
        { id: 'products', label: 'Products' },
        { id: 'orders', label: 'Orders' },
        { id: 'returns', label: 'Returns', count: props.allOrders.flatMap(o => o.items).filter(i => i.returnRequest?.status === 'pending').length },
        { id: 'homepage', label: 'Homepage' },
        { id: 'coupons', label: 'Coupons' },
        { id: 'marketing', label: 'Marketing' },
    ];

    const handleSaveProduct = (productData: Product | Omit<Product, 'id' | 'reviews'>) => {
        if ('id' in productData) { onUpdateProduct(productData); } else { onAddProduct(productData); }
        setProductModalOpen(false);
    };

    const handleSaveCoupon = (couponData: Coupon) => {
        if (props.coupons.some(c => c.code === couponData.code)) {
            onUpdateCoupon(couponData);
        } else {
            onAddCoupon(couponData);
        }
        setCouponModalOpen(false);
    };

    const handleApproveProduct = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            onUpdateProduct({ ...product, approvalStatus: 'approved', rejectionReason: '' });
            addToast(`Product "${product.name}" approved.`, 'success');
        }
    };

    const handleConfirmRejection = (productId: number, reason: string) => {
        const product = products.find(p => p.id === productId);
        if (product) {
            onUpdateProduct({ ...product, approvalStatus: 'rejected', rejectionReason: reason });
            addToast(`Product "${product.name}" rejected.`, 'error');
        }
        setRejectionModalProduct(null);
    };

    const handleConfirmUnverify = () => {
        if (!unverifyModalOrder || !unverifyReason.trim()) {
            props.addToast('Please provide a reason.', 'error');
            return;
        }
        props.onUpdateOrder(unverifyModalOrder.id, 'Pending Verification', { verificationNotes: unverifyReason });
        setUnverifyModalOrder(null);
        setUnverifyReason('');
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView {...props} />;
            case 'products': return <ProductsView products={products} onAdd={() => { setProductToEdit(null); setProductModalOpen(true); }} onEdit={(p) => { setProductToEdit(p); setProductModalOpen(true); }} onDelete={onDeleteProduct} />;
            case 'approvals': return <ApprovalsView products={products} onApprove={handleApproveProduct} onReject={(p) => setRejectionModalProduct(p)} />;
            case 'orders': return <OrdersView orders={props.allOrders} allStores={props.allStores} allUsers={props.allUsers} onUpdateStatus={props.onUpdateOrder} onUnverify={setUnverifyModalOrder} />;
            case 'returns': return <ReturnsView allOrders={props.allOrders} allUsers={props.allUsers} onUpdateReturnStatus={props.onUpdateReturnStatus} />;
            case 'homepage': return props.homepageConfig ? <HomepageEditor config={props.homepageConfig} onSave={props.onUpdateHomepageConfig} addToast={props.addToast} /> : <div>Loading...</div>;
            case 'coupons': return <CouponsView coupons={props.coupons} onAdd={() => { setCouponToEdit(null); setCouponModalOpen(true); }} onEdit={(c) => { setCouponToEdit(c); setCouponModalOpen(true); }} onDelete={onDeleteCoupon} />;
            case 'marketing': return <MarketingView allUsers={props.allUsers} addToast={props.addToast} />;
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-6">Admin Panel</h1>
             <div>
                <div className="mb-6 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-4 overflow-x-auto custom-scrollbar">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`whitespace-nowrap py-2 px-4 font-semibold text-sm relative ${activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>
                                {tab.label}
                                {('count' in tab && typeof tab.count === 'number' && tab.count > 0) && <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">{tab.count}</span>}
                            </button>
                        ))}
                    </nav>
                </div>
                {renderContent()}
            </div>

            <ProductEditorModal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} onSave={handleSaveProduct} productToEdit={productToEdit} currentUser={props.currentUser} allStores={props.allStores} />
            <RejectionModal product={rejectionModalProduct} onClose={() => setRejectionModalProduct(null)} onConfirm={handleConfirmRejection} />
            {isCouponModalOpen && <CouponEditorModal coupon={couponToEdit} onClose={() => setCouponModalOpen(false)} onSave={handleSaveCoupon} />}
            {unverifyModalOrder && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setUnverifyModalOrder(null)}>
                    <div className="bg-white p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Request Payment Correction for <span className="font-mono">{unverifyModalOrder.id}</span></h2>
                        <textarea 
                            value={unverifyReason} 
                            onChange={e => setUnverifyReason(e.target.value)} 
                            rows={4} 
                            placeholder="Explain the payment issue to the customer (e.g., UTR mismatch, amount incorrect). This note will be visible to them." 
                            className="w-full p-2 border rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        ></textarea>
                        <div className="flex justify-end gap-4 mt-4">
                            <button onClick={() => setUnverifyModalOrder(null)} className="text-gray-600 font-semibold py-2 px-4">Cancel</button>
                            <button onClick={handleConfirmUnverify} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">Submit Correction Request</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;