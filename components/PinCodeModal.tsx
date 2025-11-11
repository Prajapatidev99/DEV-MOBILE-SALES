
import * as React from 'react';

interface PinCodeModalProps {
    onClose: () => void;
    onSetPinCode: (pinCode: string) => boolean;
}

const PinCodeModal: React.FC<PinCodeModalProps> = ({ onClose, onSetPinCode }) => {
    const [pinCode, setPinCode] = React.useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSetPinCode(pinCode)) {
            onClose();
        }
    };

    const inputClasses = "w-full text-center tracking-[.5em] text-2xl px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-sm relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl transition-colors">&times;</button>

                <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Check Delivery Availability</h2>
                <p className="text-center text-gray-500 mb-6">Enter your PIN code to see delivery options and charges.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1 sr-only" htmlFor="pincode">PIN Code</label>
                        <input
                            id="pincode"
                            type="text"
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                            className={inputClasses}
                            placeholder="______"
                            maxLength={6}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="w-full bg-yellow-400 text-black font-bold py-3 rounded-md hover:bg-yellow-500 transition-colors duration-300">
                        Set Location
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PinCodeModal;