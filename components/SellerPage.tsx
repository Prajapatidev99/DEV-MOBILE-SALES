import * as React from 'react';
import type { Product, Order, User, Store, Payout } from '../types';
import ProductEditorModal from './ProductEditorModal';

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

// --- VIEW COMPONENTS ---
const SellerDashboardView: React.FC<{
    orders: Order[];
    currentUser: User & { role: 'seller' };
    allStores: Store[];
}> = ({ orders, currentUser, allStores }) => {
    const store = allStores.find(s => s.id === currentUser.storeId);
    
    const sellerRevenue = orders
        .filter(o => o.status === 'Delivered')
        .reduce((sum, order) => {
            const orderTotalSellerPrice = order.items.reduce((itemSum, item) => {
                return itemSum + (item.variant.sellerPrice * item.quantity);
            }, 0);
            const totalMrp = order.items.reduce((s, i) => s + (i.variant.price * i.quantity), 1);
            const totalDiscountRatio = (order.discountAmount || 0) / totalMrp;
            return sum + (orderTotalSellerPrice * (1 - totalDiscountRatio));
        }, 0);

    const pendingAcceptance = orders.filter(o => o.status === 'Pending Seller Acceptance').length;

    const topProducts = React.useMemo(() => {
        const productCounts: { [key: string]: { name: string, count: number } } = {};
        orders.forEach(order => {
            (order.items || []).forEach(item => {
                if (item && item.product) {
                    const name = item.product.name;
                    if (!productCounts[name]) productCounts[name] = { name, count: 0 };
                    productCounts[name].count += item.quantity;
                }
            });
        });
        return Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 3);
    }, [orders]);
    
    const paidOut = store?.payouts?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const currentBalance = sellerRevenue - paidOut;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <Card title="Total Revenue" value={`₹${sellerRevenue.toLocaleString('en-IN')}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>} />
                <Card title="Current Balance" value={`₹${currentBalance.toLocaleString('en-IN')}`} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <Card title="Orders to Accept" value={String(pendingAcceptance)} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
            </div>
             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="font-bold text-lg mb-4">Your Top Selling Products</h3>
                 {topProducts.length > 0 ? (
                    <ul className="space-y-2">
                        {topProducts.map(p => (
                            <li key={p.name} className="flex justify-between items-center text-sm">
                                <span className="text-gray-700">{p.name}</span>
                                <span className="font-semibold bg-gray-100 px-2 py-0.5 rounded-full">{p.count} sold</span>
                            </li>
                        ))}
                    </ul>
                ) : <p className="text-gray-500">No sales data yet.</p>}
            </div>
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

const OrdersView: React.FC<{
    orders: Order[];
    onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
}> = ({ orders, onUpdateStatus }) => {
    const newOrders = orders.filter(o => o.status === 'Pending Seller Acceptance');
    const acceptedOrders = orders.filter(o => o.status === 'Accepted');
    const otherOrders = orders.filter(o => !['Pending Seller Acceptance', 'Accepted'].includes(o.status));

    const OrderTable: React.FC<{ orderList: Order[] }> = ({ orderList }) => (
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-2">Order ID</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Total</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orderList.map(order => (
                         <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-blue-600">{order.id}</td>
                            <td className="px-4 py-2">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2 font-semibold">₹{order.total.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-2">{order.status}</td>
                            <td className="px-4 py-2">
                                {order.status === 'Pending Seller Acceptance' && (
                                    <div className="flex gap-2">
                                        <button onClick={() => onUpdateStatus(order.id, 'Accepted')} className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-green-600">Accept</button>
                                        <button onClick={() => onUpdateStatus(order.id, 'Cancelled')} className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-red-600">Reject</button>
                                    </div>
                                )}
                                {order.status === 'Accepted' && (
                                    <button onClick={() => onUpdateStatus(order.id, 'Out for Delivery')} className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-blue-600">Ship Order</button>
                                )}
                                {order.status === 'Out for Delivery' && (
                                    <button onClick={() => onUpdateStatus(order.id, 'Delivered')} className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded hover:bg-purple-600">Mark Delivered</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    return (
        <div className="space-y-6 mt-6">
            {newOrders.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-yellow-300">
                    <h2 className="text-xl font-bold mb-4 text-yellow-800">New Orders for Acceptance</h2>
                    <OrderTable orderList={newOrders} />
                </div>
            )}
             {acceptedOrders.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-md border border-blue-300">
                    <h2 className="text-xl font-bold mb-4 text-blue-800">Accepted Orders to Ship</h2>
                    <OrderTable orderList={acceptedOrders} />
                </div>
            )}
             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-xl font-bold mb-4">Order History</h2>
                <OrderTable orderList={otherOrders} />
            </div>
        </div>
    );
};

const ReturnsView: React.FC<{
    allOrders: Order[];
    onUpdateStatus: (orderId: string, newStatus: Order['status']) => void;
}> = ({ allOrders, onUpdateStatus }) => {
    const returnRequests = allOrders.filter(o => o.status === 'Return Requested');

    if (returnRequests.length === 0) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-md border mt-6"><p>No pending return requests.</p></div>;
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6">
             <h2 className="text-xl font-bold mb-4">Manage Return Requests</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Order ID</th>
                            <th className="px-4 py-2">Return Reason</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {returnRequests.map(order => {
                            const reason = order.items.find(i => i.returnRequest)?.returnRequest?.reason || 'N/A';
                            return (
                                <tr key={order.id} className="border-b">
                                    <td className="px-4 py-2 font-mono">{order.id}</td>
                                    <td className="px-4 py-2">{reason}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex gap-2">
                                            <button onClick={() => onUpdateStatus(order.id, 'Refund Approved')} className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">Approve</button>
                                            <button onClick={() => onUpdateStatus(order.id, 'Return Rejected')} className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">Reject</button>
                                        </div>
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

const SettingsView: React.FC<{
    currentUser: User & { role: 'seller' };
    allStores: Store[];
    onUpdateStore: (storeData: Store) => void;
}> = ({ currentUser, allStores, onUpdateStore }) => {
    
    const store = allStores.find(s => s.id === currentUser.storeId);
    
    if (!store) {
        return <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6"><p>Store settings not available.</p></div>;
    }
    
    const [storeData, setStoreData] = React.useState(store);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'upi') {
            setStoreData(prev => ({ ...prev, paymentDetails: { ...prev.paymentDetails, upi: value }}));
        } else {
            setStoreData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleSave = () => {
        onUpdateStore(storeData);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mt-6 space-y-8">
            <h2 className="text-xl font-bold">Seller Settings</h2>
            
            <div>
                <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
                <div>
                    <label className="text-sm font-medium">UPI ID</label>
                    <input name="upi" value={storeData.paymentDetails?.upi || ''} onChange={handleChange} className="w-full p-2 border rounded-md" />
                </div>
            </div>

            <div className="text-right">
                <button onClick={handleSave} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-md">Save Settings</button>
            </div>
        </div>
    );
};


// --- MAIN SELLER PAGE ---
interface SellerPageProps {
    currentUser: User & { role: 'seller' };
    products: Product[];
    allOrders: Order[];
    allStores: Store[];
    onUpdateOrder: (orderId: string, newStatus: Order['status']) => void;
    onAddProduct: (productData: Omit<Product, 'id' | 'reviews'>) => void;
    onUpdateProduct: (product: Product) => void;
    onDeleteProduct: (productId: number) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
    onUpdateStore: (storeData: Store) => void;
    onAddPayout: (storeId: number, payoutData: Omit<Payout, 'payoutId'>) => void;
}

type SellerTab = 'dashboard' | 'products' | 'orders' | 'returns' | 'settings' | 'earnings';

const SellerPage: React.FC<SellerPageProps> = (props) => {
    const [activeTab, setActiveTab] = React.useState<SellerTab>('dashboard');
    const [isProductModalOpen, setProductModalOpen] = React.useState(false);
    const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);

    const { currentUser, products, allOrders, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateOrder, allStores, onUpdateStore } = props;

    const tabs: { id: SellerTab; label: string; count?: number }[] = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'products', label: 'My Products' },
        { id: 'orders', label: 'My Orders', count: allOrders.filter(o => o.status === 'Pending Seller Acceptance').length },
        { id: 'returns', label: 'My Returns', count: allOrders.filter(o => o.status === 'Return Requested').length },
        { id: 'settings', label: 'Settings' },
    ];

    const handleSaveProduct = (productData: Product | Omit<Product, 'id' | 'reviews'>) => {
        if ('id' in productData) { onUpdateProduct(productData); } else { onAddProduct(productData); }
        setProductModalOpen(false);
    };
    
     const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <SellerDashboardView orders={allOrders} currentUser={currentUser} allStores={allStores} />;
            case 'products': return <ProductsView products={products} onAdd={() => { setProductToEdit(null); setProductModalOpen(true); }} onEdit={(p) => { setProductToEdit(p); setProductModalOpen(true); }} onDelete={onDeleteProduct} />;
            case 'orders': return <OrdersView orders={allOrders} onUpdateStatus={onUpdateOrder} />;
            case 'settings': return <SettingsView currentUser={currentUser} allStores={allStores} onUpdateStore={onUpdateStore} />;
            case 'returns': return <ReturnsView allOrders={allOrders} onUpdateStatus={onUpdateOrder} />;
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-4xl font-bold mb-6">Seller Panel</h1>
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

            <ProductEditorModal isOpen={isProductModalOpen} onClose={() => setProductModalOpen(false)} onSave={handleSaveProduct} productToEdit={productToEdit} currentUser={currentUser} allStores={allStores} />
        </div>
    );
};

export default SellerPage;