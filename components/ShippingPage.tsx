
import * as React from 'react';

const ShippingPage: React.FC = () => {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
            <h1 className="text-4xl font-bold mb-6 text-gray-900">Shipping Information</h1>

            <div className="space-y-6 text-gray-700">
                <section>
                    <h2 className="text-2xl font-semibold mb-2 text-blue-600">Processing Time</h2>
                    <p>
                        All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
                        If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery. If there will be a significant delay in the shipment of your order, we will contact you via email.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-2 text-blue-600">Shipping Rates & Delivery Estimates</h2>
                    <p>
                        Shipping charges for your order will be calculated and displayed at checkout.
                    </p>
                    <ul className="list-disc list-inside mt-4 space-y-2">
                        <li>
                            <strong>Standard Shipping (5-7 business days):</strong> ₹50
                        </li>
                        <li>
                            <strong>Express Shipping (2-3 business days):</strong> ₹150
                        </li>
                        <li>
                            <strong>Free shipping on all orders over ₹5,000.</strong>
                        </li>
                    </ul>
                    <p className="mt-2 text-sm text-gray-500">
                        Delivery delays can occasionally occur.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-2 text-blue-600">International Shipping</h2>
                    <p>
                        We currently ship to over 50 countries. Your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. Our shop is not responsible for these charges if they are applied and are your responsibility as the customer.
                    </p>
                </section>
                
                 <section>
                    <h2 className="text-2xl font-semibold mb-2 text-blue-600">Shipment Confirmation & Order Tracking</h2>
                    <p>
                       You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default ShippingPage;