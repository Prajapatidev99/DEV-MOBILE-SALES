import * as React from 'react';

const UPI_ID = 'dev358438@okhdfcbank'; // Updated UPI ID as per request
const PAYEE_NAME = 'Dev Prajapati';
const PAYMENT_TIMER_MINUTES = 15;

interface CustomPaymentPageProps {
    onPaymentSubmit: (utr: string, paymentProof?: string) => Promise<void>;
}

const CustomPaymentPage: React.FC<CustomPaymentPageProps> = ({ onPaymentSubmit }) => {
    const [orderTotal, setOrderTotal] = React.useState<string | null>(null);
    const [orderId, setOrderId] = React.useState<string | null>(null);
    const [utr, setUtr] = React.useState('');
    const [screenshot, setScreenshot] = React.useState<{ file: File; base64: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isExpired, setIsExpired] = React.useState(false);
    const [timeLeft, setTimeLeft] = React.useState(PAYMENT_TIMER_MINUTES * 60);
    const [copyButtonText, setCopyButtonText] = React.useState('Copy');

    // Centralized function to clear session data, memoized for stability.
    const clearPendingOrderSession = React.useCallback(() => {
        sessionStorage.removeItem('pendingOrderId');
        sessionStorage.removeItem('pendingOrderTotal');
    }, []);

    // This single effect handles component setup and the timer.
    // The unmount cleanup for the session was removed because it was incompatible
    // with React's Strict Mode, causing a premature "session expired" error in development.
    // Session cleanup is now robustly handled by the checkout process itself (on starting a new payment),
    // on explicit cancellation, or on timer expiry.
    React.useEffect(() => {
        const pendingOrderTotal = sessionStorage.getItem('pendingOrderTotal');
        const pendingOrderId = sessionStorage.getItem('pendingOrderId');

        if (!pendingOrderTotal || !pendingOrderId) {
            setIsExpired(true);
            return; // No session, so no timer or cleanup needed.
        }

        setOrderTotal(pendingOrderTotal);
        setOrderId(pendingOrderId);

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime - 1 <= 0) {
                    clearInterval(timerId);
                    setIsExpired(true);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Cleanup function for when the component unmounts.
        return () => {
            clearInterval(timerId);
        };
    }, []);

    // This effect explicitly handles cleanup when the timer expires.
    // When `isExpired` becomes true, the component re-renders to show the "Session Expired" message,
    // and this effect then cleans up the session storage to allow the user to start a new checkout process.
    React.useEffect(() => {
        if (isExpired) {
            clearPendingOrderSession();
        }
    }, [isExpired, clearPendingOrderSession]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setScreenshot({ file, base64: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (utr.length < 12 || !/^\d+$/.test(utr)) {
            alert('Please enter a valid 12-digit UTR/Transaction ID.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onPaymentSubmit(utr, screenshot?.base64);
        } catch (error) {
            // App.tsx handles navigation on error. This is a safeguard.
            console.error('Error during payment submission:', error);
            setIsSubmitting(false);
        }
    };
    
    const handleCancel = () => {
        clearPendingOrderSession(); // Explicitly clear session on cancel
        window.location.hash = '#/cart';
    };

    const handleCopyUpi = () => {
        navigator.clipboard.writeText(UPI_ID).then(() => {
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy'), 2000);
        });
    };

    const note = `Order #${orderId}`;
    const upiLink = orderTotal && orderId ? `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${orderTotal}&cu=INR&tn=${encodeURIComponent(note)}` : '';
    const qrCodeUrl = upiLink ? `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(upiLink)}` : '';

    const displayMinutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const displaySeconds = (timeLeft % 60).toString().padStart(2, '0');
    
    if (isExpired) {
        return (
             <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm text-center p-8">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Session Expired</h2>
                    <p className="text-gray-600 mb-6">Your payment session has timed out. Please return to your cart to restart the checkout process.</p>
                    <a href="#/cart" className="w-full inline-block bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors">
                        Return to Cart
                    </a>
                </div>
            </div>
        );
    }
    
    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-full overflow-y-auto custom-scrollbar">
                {/* Header */}
                <header className="p-4 sm:p-6 flex justify-between items-center border-b bg-gray-50/50 rounded-t-xl">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tighter">Dev Mobile</h1>
                        <p className="text-sm text-gray-500">Order ID: {orderId || '...'}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Amount to Pay</p>
                        <p className="text-2xl font-bold text-gray-900">₹{orderTotal ? Number(orderTotal).toLocaleString('en-IN') : '...'}</p>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side: Scan & Pay */}
                    <div className="border-r-0 md:border-r md:pr-8 border-gray-200">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-800">Scan & Pay via UPI</h2>
                             <div className="text-sm font-mono font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md px-2 py-0.5">
                                Expires in: {displayMinutes}:{displaySeconds}
                            </div>
                        </div>

                        <div className="text-center my-4">
                           {qrCodeUrl ? (
                                <img src={qrCodeUrl} alt="UPI QR Code" width="200" height="200" className="mx-auto border-4 border-white rounded-lg shadow-md" />
                           ) : (
                                <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse mx-auto"></div>
                           )}
                           <p className="text-sm font-semibold mt-4">Scan using any UPI app</p>
                            <div className="flex justify-center items-center gap-4 mt-2">
                                <img src="https://www.vectorlogo.zone/logos/googlepay/googlepay-icon.svg" alt="GPay" className="h-6"/>
                                <img src="https://www.vectorlogo.zone/logos/phonepe/phonepe-icon.svg" alt="PhonePe" className="h-6"/>
                                <img src="https://www.vectorlogo.zone/logos/paytm/paytm-icon.svg" alt="Paytm" className="h-6"/>
                            </div>
                        </div>
                        
                        <div className="text-center my-6">
                            <a 
                                href={upiLink}
                                className="inline-flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Pay ₹{orderTotal ? Number(orderTotal).toLocaleString('en-IN') : '...'} via UPI App
                            </a>
                        </div>
                        
                        <div className="relative flex items-center my-6">
                            <div className="flex-grow border-t border-gray-200"></div>
                            <span className="flex-shrink mx-4 text-gray-400 text-xs">OR</span>
                            <div className="flex-grow border-t border-gray-200"></div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-500">Or send money to the UPI ID</p>
                             <div className="mt-2 inline-flex items-center bg-gray-100 border rounded-md p-1">
                                <code className="font-mono text-gray-800 px-2">{UPI_ID}</code>
                                <button onClick={handleCopyUpi} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded hover:bg-gray-300 transition-colors">
                                    {copyButtonText}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Confirm Payment */}
                    <div>
                         <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-800">Confirm Your Payment</h2>
                            
                            <div>
                                <label htmlFor="utr" className="block text-sm font-medium text-gray-700 mb-1">
                                    Enter 12-Digit UTR/Transaction ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="utr"
                                    type="text"
                                    value={utr}
                                    onChange={(e) => setUtr(e.target.value.replace(/[^0-9]/g, ''))}
                                    required
                                    maxLength={12}
                                    minLength={12}
                                    placeholder="Find this in your UPI app"
                                    className="w-full p-2 bg-white rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700 mb-1">
                                    Upload Payment Screenshot (Optional)
                                </label>
                                 <div className="mt-1 flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        {screenshot ? (
                                            <img src={screenshot.base64} alt="Screenshot preview" className="mx-auto h-24 rounded-md"/>
                                        ) : (
                                            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        )}
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="screenshot-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                <span>{screenshot ? 'Change file' : 'Upload file'}</span>
                                                <input id="screenshot-upload" name="screenshot-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*"/>
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">{screenshot?.file.name || 'PNG, JPG up to 2MB'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-2 space-y-3">
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Verifying...' : 'Confirm Payment'}
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleCancel}
                                    className="w-full text-center text-sm font-semibold text-gray-500 hover:text-gray-800 py-2 rounded-md transition-colors"
                                >
                                    Cancel Payment
                                </button>
                            </div>
                         </form>
                    </div>
                </main>

                {/* Footer */}
                <footer className="px-6 py-4 bg-gray-50/50 rounded-b-xl text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <span>100% Secure Payments</span>
                </footer>
            </div>
        </div>
    );
};

export default CustomPaymentPage;