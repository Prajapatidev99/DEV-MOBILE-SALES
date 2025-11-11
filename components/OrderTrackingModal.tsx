import * as React from 'react';
import type { Order } from '../types';

const placeholderMap = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNhNWQ2YTUiIC8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIyNCIgZHk9Ii4zZW0iIGZpbGw9IiNmZmYiIHRleHQtYW5jaGyPSJtaWRkbGUiPk1hcCBQbGFjZWhvbGRlcjwvdGV4dD48L3N2Zz4=';

interface OrderTrackingModalProps {
    order: Order;
    onClose: () => void;
}

const statusSteps = ['Processing', 'Shipped', 'Delivered'];

const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({ order, onClose }) => {
    const currentStepIndex = statusSteps.indexOf(order.status);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl relative overflow-hidden" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl z-20 transition-colors">&times;</button>
                
                <div className="relative h-64 bg-gray-200">
                    <img src={placeholderMap} alt="Delivery Map" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20"></div>
                </div>

                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-2">Tracking Order: <span className="text-blue-600 font-mono">{order.id}</span></h2>
                    <p className="text-gray-600 mb-6">Estimated Delivery: <span className="font-semibold">{new Date(new Date(order.date).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span></p>

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
                </div>
            </div>
        </div>
    );
};

export default OrderTrackingModal;