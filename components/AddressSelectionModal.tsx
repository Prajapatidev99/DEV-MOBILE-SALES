import * as React from 'react';
import type { Address } from '../types';

const indianStates = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];

const AddressForm: React.FC<{
    onSave: (address: Omit<Address, 'id' | 'isDefault' | 'country'>) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = React.useState({
        fullName: '',
        mobileNumber: '',
        pincode: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        deliveryInstructions: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const inputClasses = "w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";

    return (
        <div className="animate-fade-in">
            <button onClick={onCancel} className="flex items-center text-sm font-semibold text-gray-600 hover:text-black mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back to saved addresses
            </button>
            <h3 className="text-xl font-bold mb-4">Add a new delivery address</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Full name</label><input name="fullName" value={formData.fullName} onChange={handleChange} required className={inputClasses} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label><input name="mobileNumber" type="tel" value={formData.mobileNumber} onChange={handleChange} required maxLength={10} className={inputClasses} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label><input name="pincode" value={formData.pincode} onChange={handleChange} required maxLength={6} className={inputClasses} /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Flat, House no., Building, Company, Apartment</label><input name="addressLine1" value={formData.addressLine1} onChange={handleChange} required className={inputClasses} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Area, Street, Sector, Village</label><input name="addressLine2" value={formData.addressLine2} onChange={handleChange} required className={inputClasses} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label><input name="landmark" value={formData.landmark || ''} onChange={handleChange} placeholder="E.g. near apollo hospital" className={inputClasses} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Town/City</label><input name="city" value={formData.city} onChange={handleChange} required className={inputClasses} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select name="state" value={formData.state} onChange={handleChange} required className={inputClasses}>
                            <option value="">Choose a state</option>
                            {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="pt-2"><button type="submit" className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-md hover:bg-yellow-500 transition-colors">Use this address</button></div>
            </form>
        </div>
    );
};


interface AddressSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    addresses: Address[];
    selectedAddressId: number | 'new';
    onSelectAddress: (id: number) => void;
    onSaveNewAddress: (addressData: Omit<Address, 'id' | 'isDefault' | 'country'>) => void;
    addToast: (message: string, type: 'success' | 'error') => void;
}

const AddressSelectionModal: React.FC<AddressSelectionModalProps> = ({ isOpen, onClose, addresses, selectedAddressId, onSelectAddress, onSaveNewAddress, addToast }) => {
    const [isAddingNew, setIsAddingNew] = React.useState(false);

    React.useEffect(() => {
        if (!isOpen) {
            // Reset to selection view when modal is closed
            setIsAddingNew(false);
        }
    }, [isOpen]);
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-black text-3xl transition-colors z-10">&times;</button>
                
                {!isAddingNew ? (
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Choose a delivery address</h2>
                        <div className="space-y-4">
                            {addresses.map(address => (
                                <div 
                                    key={address.id} 
                                    onClick={() => onSelectAddress(address.id)}
                                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
                                >
                                    <p className="font-semibold">{address.fullName}</p>
                                    <p className="text-gray-600 text-sm">{address.addressLine1}, {address.addressLine2}</p>
                                    <p className="text-gray-600 text-sm">{address.city}, {address.state} {address.pincode}</p>
                                </div>
                            ))}

                            <button 
                                onClick={() => setIsAddingNew(true)}
                                className="w-full p-4 rounded-lg border-2 border-dashed border-gray-400 text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors flex items-center justify-center font-semibold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add a new address
                            </button>
                        </div>
                    </div>
                ) : (
                    <AddressForm onSave={onSaveNewAddress} onCancel={() => setIsAddingNew(false)} />
                )}
            </div>
        </div>
    );
};

export default AddressSelectionModal;