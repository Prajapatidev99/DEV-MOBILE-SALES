import * as React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

const services = [
    { title: "Screen Replacement", description: "Cracked or unresponsive screen? We'll make it look new again.", icon: "📱" },
    { title: "Battery Replacement", description: "Is your phone dying too quickly? Get a fresh battery for all-day power.", icon: "🔋" },
    { title: "Water Damage Repair", description: "Accidents happen. We have advanced techniques to rescue water-damaged devices.", icon: "💧" },
    { title: "Charging Port Repair", description: "Having trouble charging? We can repair or replace the charging port.", icon: "🔌" },
];

const brandsSupported = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi", "Oppo", "Vivo", "Realme"];

const RepairPage: React.FC = () => {
    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Expert Device Repair Services</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    From cracked screens to battery issues, our certified technicians are here to bring your devices back to life. Fast, reliable, and affordable repairs you can trust.
                </p>
            </div>

            <AnimateOnScroll className="mt-12 bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">What We Fix</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {services.map((service, index) => (
                        <div key={index} className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                            <div className="text-5xl mb-4">{service.icon}</div>
                            <h3 className="text-xl font-semibold mb-2 text-gray-900">{service.title}</h3>
                            <p className="text-gray-600 text-sm">{service.description}</p>
                        </div>
                    ))}
                </div>
            </AnimateOnScroll>

            <AnimateOnScroll className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Simple Repair Process</h2>
                    <ol className="space-y-4">
                        <li className="flex items-start">
                            <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">1</div>
                            <div>
                                <h4 className="font-semibold text-lg">Book a Repair</h4>
                                <p className="text-gray-600">Fill out our contact form or call us to schedule a free diagnostic.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">2</div>
                            <div>
                                <h4 className="font-semibold text-lg">Drop Off or Mail-In</h4>
                                <p className="text-gray-600">Visit one of our stores or securely mail your device to us.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                            <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">3</div>
                            <div>
                                <h4 className="font-semibold text-lg">Expert Repair</h4>
                                <p className="text-gray-600">Our technicians will quickly and efficiently repair your device.</p>
                            </div>
                        </li>
                        <li className="flex items-start">
                             <div className="flex-shrink-0 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">4</div>
                            <div>
                                <h4 className="font-semibold text-lg">Collect & Enjoy</h4>
                                <p className="text-gray-600">We'll notify you when it's ready for pickup or when it's been shipped back to you.</p>
                            </div>
                        </li>
                    </ol>
                </div>
                <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                     <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">Brands We Support</h3>
                     <div className="flex flex-wrap justify-center gap-4">
                        {brandsSupported.map(brand => (
                            <span key={brand} className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-full text-sm border border-gray-200">
                                {brand}
                            </span>
                        ))}
                     </div>
                     <div className="mt-8 text-center">
                         <a href="#/contact" className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-md hover:bg-yellow-500 transition-colors duration-300 inline-block">
                            Get a Free Quote
                         </a>
                     </div>
                </div>
            </AnimateOnScroll>
        </div>
    );
};

export default RepairPage;