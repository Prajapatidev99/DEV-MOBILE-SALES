import * as React from 'react';
import type { Order, User } from '../types';

interface TrackOrderPageProps {
    allOrders: Order[];
    allUsers: User[];
}

const statusSteps = ['Processing', 'Shipped', 'Delivered'];

const OrderStatusVisual: React.FC<{ order: Order }> = ({ order }) => {
    const currentStepIndex = statusSteps.indexOf(order.status);
    const getStatusText = () => {
        switch(order.status) {
            case 'Pending Verification':
                return 'Your payment is being verified. This may take up to 24 hours.';
            case 'Processing':
                return 'Your order is being processed and will be shipped soon.';
            case 'Shipped':
                return `Your order has been shipped! Estimated delivery: ${new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
            case 'Delivered':
                return 'Your order has been delivered. Thank you for shopping with us!';
            case 'Cancelled':
                return 'This order has been cancelled.';
            case 'Pending Payment':
                return 'Your order is awaiting payment. Please complete the payment to proceed.';
            default:
                return 'Order status is unknown.';
        }
    };

    return (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200 animate-fade-in">
            <h3 className="text-xl font-bold mb-2">Order Status: <span className="text-blue-600">{order.status}</span></h3>
            <p className="text-gray-600 mb-6">{getStatusText()}</p>
            
            {(currentStepIndex > -1) && (
                <div className="w-full">
                    <div className="relative flex justify-between items-center mb-2">
                        {statusSteps.map((step, index) => (
                            <div key={step} className={`text-xs text-center ${index <= currentStepIndex ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                                {step}
                            </div>
                        ))}
                    </div>
                    <div className="relative h-2 bg-gray-200 rounded-full">
                        <div className="absolute top-0 left-0 h-2 bg-blue-600 rounded-full" style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`, transition: 'width 0.5s ease-out' }}></div>
                         <div className="absolute flex justify-between w-full h-full">
                            {statusSteps.map((_, index) => (
                                 <div key={index} className={`w-4 h-4 rounded-full -mt-1 ${index <= currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ allOrders, allUsers }) => {
    const [orderId, setOrderId] = React.useState('');
    const [mobile, setMobile] = React.useState('');
    const [foundOrder, setFoundOrder] = React.useState<Order | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFoundOrder(null);
        
        setTimeout(() => {
            const order = allOrders.find(o => o.id.toLowerCase() === orderId.toLowerCase().trim());
            if (order) {
                const user = allUsers.find(u => u.id === order.userId);
                if (user && user.mobile === mobile.trim()) {
                    setFoundOrder(order);
                } else {
                    setError("Order ID and mobile number do not match our records.");
                }
            } else {
                setError("Order not found. Please check the Order ID.");
            }
            setIsLoading(false);
        }, 500);
    };
    
    const inputClasses = "w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="max-w-xl mx-auto animate-fade-in">
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h1 className="text-3xl font-bold text-center mb-2">Track Your Order</h1>
                <p className="text-center text-gray-500 mb-6">Enter your order details to see its current status.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                        <input id="orderId" type="text" value={orderId} onChange={e => setOrderId(e.target.value)} required className={inputClasses} placeholder="e.g., DM123456"/>
                    </div>
                    <div>
                        <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                        <input id="mobile" type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/[^0-9]/g, ''))} required maxLength={10} className={inputClasses} placeholder="10-digit mobile number"/>
                    </div>
                     <button type="submit" disabled={isLoading} className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors disabled:bg-gray-400">
                        {isLoading ? 'Searching...' : 'Track Order'}
                    </button>
                </form>
            </div>
            {error && <p className="mt-4 text-center text-red-600">{error}</p>}
            {foundOrder && <OrderStatusVisual order={foundOrder} />}
        </div>
    );
};

export default TrackOrderPage;
