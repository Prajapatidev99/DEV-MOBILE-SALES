import * as React from 'react';
import type { Order, User } from '../types';

interface OrderConfirmationProps {
  order: Order;
  currentUser: User | null;
  onReturnToShop: () => void;
}

const Confetti: React.FC = () => {
    React.useEffect(() => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    const confettiCount = 150;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = `${Math.random() * 100}vw`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = `${Math.random() * 3 + 4}s`;
      confetti.style.animationDelay = `${Math.random() * 5}s`;
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confettiContainer.appendChild(confetti);
    }

    const timeoutId = setTimeout(() => {
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
    };
  }, []);
  
  return null;
}


const OrderConfirmation: React.FC<OrderConfirmationProps> = ({ order, currentUser, onReturnToShop }) => {
  
  const isPendingVerification = order.status === 'Pending Verification';

  const handleDownloadInvoice = () => {
    sessionStorage.setItem('invoice_order', JSON.stringify(order));
    window.open('#/invoice', '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-lg shadow-md animate-fade-in border border-gray-200">
      {!isPendingVerification && <Confetti />}

      {isPendingVerification ? (
        <div className="w-16 h-16 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
      ) : (
        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
      )}

      <h2 className={`text-4xl font-extrabold mb-4 ${isPendingVerification ? 'text-yellow-600' : 'text-green-600'}`}>
        {isPendingVerification ? 'Thank You!' : 'Thank You for Your Order!'}
      </h2>
      <p className="text-lg text-gray-600 mb-6">
        {isPendingVerification
            ? `Our team will verify your payment shortly. Once verified, your invoice will be available on your account page and sent via WhatsApp.`
            : `Your order has been placed successfully. We've sent a confirmation email and a WhatsApp message to you${currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}.`
        }
      </p>
      <div className="bg-gray-50 p-6 rounded-lg text-left space-y-4 border border-gray-200">
        <div>
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="font-mono text-lg font-semibold text-gray-800">{order.id}</p>
        </div>
        {order.paymentId && (
           <div>
              <p className="text-sm text-gray-500">Transaction ID (UTR)</p>
              <p className="font-mono text-lg font-semibold text-gray-800">{order.paymentId}</p>
          </div>
        )}
         {order.deliveryMethod === 'shipping' && (
            <>
                <div>
                    <p className="text-sm text-gray-500">Delivering To</p>
                    <p className="font-semibold text-gray-800">{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p>
                    <p className="text-gray-600">{order.deliveryAddress.address},</p>
                    <p className="text-gray-600">{order.deliveryAddress.city}, {order.deliveryAddress.postalCode}</p>
                </div>
                {order.deliveryType && (
                    <div>
                        <p className="text-sm text-gray-500">Delivery Type</p>
                        <p className="font-semibold text-gray-800 flex items-center gap-2">
                           {order.deliveryType === 'LOCAL' ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Local Same-Day Delivery</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                        <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v5a1 1 0 001 1h2.05a2.5 2.5 0 014.9 0H21a1 1 0 001-1v-5a1 1 0 00-1-1h-7z" />
                                    </svg>
                                    <span>Standard Courier Delivery (1-3 days)</span>
                                </>
                            )}
                        </p>
                    </div>
                )}
            </>
        )}
         {order.deliveryMethod === 'pickup' && order.pickupStore && (
            <div>
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-semibold text-gray-800">{order.pickupStore.name}</p>
                <p className="text-gray-600">{order.pickupStore.address}</p>
                <p className="text-xs text-gray-500 mt-1">You will be notified when your order is ready for pickup.</p>
            </div>
        )}
        <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</p>
        </div>
      </div>
       <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        {!isPendingVerification && (
            <button
              onClick={handleDownloadInvoice}
              className="bg-blue-600 text-white font-bold py-3 px-8 rounded-md hover:bg-blue-700 transition-transform transform hover:scale-105 duration-300 text-lg"
            >
              Download Invoice
            </button>
        )}
        <button
          onClick={onReturnToShop}
          className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-md hover:bg-yellow-500 transition-transform transform hover:scale-105 duration-300 text-lg"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;