import * as React from 'react';
import type { Store } from '../types';

interface FindStorePageProps {
    stores: Store[];
}

const FindStorePage: React.FC<FindStorePageProps> = ({ stores }) => {
  const [selectedStore, setSelectedStore] = React.useState<Store | null>(stores.length > 0 ? stores[0] : null);

  const mapEmbedUrl = selectedStore 
    ? `https://maps.google.com/maps?q=${selectedStore.latitude},${selectedStore.longitude}&hl=es;z=14&amp;output=embed`
    : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.558362624536!2d72.51865937510166!3d23.03990491563141!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b3535238283%3A0x3f338520281b365!2sDev%20Mobile%20Service!5e0!3m2!1sen!2sin!4v1719253457193!5m2!1sen!2sin";

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Our Store Locations</h1>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4 text-gray-700 h-96 overflow-y-auto custom-scrollbar pr-2">
                    {stores.map(store => (
                        <div key={store.id} onClick={() => setSelectedStore(store)} className={`p-4 rounded-lg border-2 cursor-pointer ${selectedStore?.id === store.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <h2 className="text-lg font-bold text-gray-800">{store.name}</h2>
                            <p className="text-sm">{store.address}</p>
                        </div>
                    ))}
                </div>
                <div className="md:col-span-2 rounded-lg overflow-hidden border border-gray-200 h-96">
                    <iframe 
                        key={selectedStore?.id}
                        src={mapEmbedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Dev Mobile Location"
                    ></iframe>
                </div>
            </div>
        </div>
    </div>
  );
};

export default FindStorePage;