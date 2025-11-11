import * as React from 'react';
import type { Order } from '../types';

const InvoicePage: React.FC = () => {
    const [order, setOrder] = React.useState<Order | null>(null);

    React.useEffect(() => {
        const orderData = sessionStorage.getItem('invoice_order');
        if (orderData) {
            setOrder(JSON.parse(orderData));
            setTimeout(() => window.print(), 500); // Allow time for render before printing
        }
    }, []);

    if (!order) {
        return <div className="p-8">Loading invoice... If it doesn't appear, please return to your account and try again.</div>;
    }
    
    const getVariantDescription = (variant: Order['items'][0]['variant']) => {
        return Object.values(variant.attributes).filter(Boolean).join(' / ');
    };

    const subtotal = order.items.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
    const shipping = (order.total + (order.discountAmount || 0)) - subtotal;

    return (
        <div className="bg-white text-gray-800 font-sans p-4 sm:p-8">
            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none; }
                }
            `}</style>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-start mb-8 border-b pb-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Dev Mobile</h1>
                        <p className="text-gray-500"></p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-semibold uppercase text-gray-500">Invoice</h2>
                        <p><strong>Order ID:</strong> {order.id}</p>
                        <p><strong>Date:</strong> {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                        <p className="font-bold">{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
                        <p>{order.deliveryAddress.address}</p>
                        <p>{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}</p>
                    </div>
                    {(order.gstin || order.companyName) && (
                         <div>
                            <h3 className="font-semibold text-gray-500 uppercase mb-2">Business Details</h3>
                            {order.companyName && <p><strong>Company:</strong> {order.companyName}</p>}
                            {order.gstin && <p><strong>GSTIN:</strong> {order.gstin}</p>}
                        </div>
                    )}
                </div>

                <table className="w-full text-left mb-8">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 font-semibold">Item</th>
                            <th className="p-3 font-semibold text-center">Quantity</th>
                            <th className="p-3 font-semibold text-right">Unit Price</th>
                            <th className="p-3 font-semibold text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.variant.id} className="border-b">
                                <td className="p-3">
                                    <p className="font-semibold">{item.product.name}</p>
                                    <p className="text-sm text-gray-600">{getVariantDescription(item.variant)}</p>
                                </td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">₹{item.variant.price.toLocaleString('en-IN')}</td>
                                <td className="p-3 text-right">₹{(item.variant.price * item.quantity).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                <div className="flex justify-end">
                    <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                        <div className="flex justify-between"><span>Shipping:</span><span>₹{shipping.toLocaleString('en-IN')}</span></div>
                         {order.discountAmount && (
                            <div className="flex justify-between">
                                <span>Discount ({order.couponCode}):</span>
                                <span>- ₹{order.discountAmount.toLocaleString('en-IN')}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-xl border-t pt-2 mt-2">
                            <span>Total :</span>
                            <span>₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-12 text-sm text-gray-500 border-t pt-4">
                    <p>Thank you for your business!</p>
                    <p>If you have any questions, please contact 9974221322.</p>
                </div>

                <div className="text-center mt-4 no-print">
                     <button onClick={() => window.print()} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-700">Print Invoice</button>
                </div>
            </div>
        </div>
    );
};

export default InvoicePage;