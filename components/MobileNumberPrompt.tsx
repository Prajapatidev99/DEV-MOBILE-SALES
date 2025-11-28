
import React, { useState } from 'react';

interface MobileNumberPromptProps {
    isOpen: boolean;
    onSubmit: (mobile: string) => void;
    onClose: () => void;
}

const MobileNumberPrompt: React.FC<MobileNumberPromptProps> = ({ isOpen, onSubmit, onClose }) => {
    const [mobile, setMobile] = useState('');
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{10}$/.test(mobile)) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        onSubmit(mobile);
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in p-4 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm p-6 relative animate-slide-in-up">
                <button 
                    onClick={onClose} 
                    className="absolute top-2 right-2 text-gray-400 hover:text-black transition-colors p-2"
                    aria-label="Close"
                >
                    &times;
                </button>
                <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Complete Your Profile</h2>
                    <p className="text-sm text-gray-600 mt-1">Please provide your mobile number to receive order updates and delivery notifications.</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1 ml-1">Mobile Number</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 font-medium">+91</span>
                            <input
                                type="tel"
                                value={mobile}
                                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setError(''); }}
                                placeholder="Enter 10-digit number"
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                maxLength={10}
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-xs text-red-500 mt-1 ml-1">{error}</p>}
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-yellow-400 text-black font-bold py-3 rounded-lg hover:bg-yellow-500 transition-transform transform active:scale-95 duration-200"
                    >
                        Save & Continue
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MobileNumberPrompt;
