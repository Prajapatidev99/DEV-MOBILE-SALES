import * as React from 'react';
import AnimateOnScroll from './AnimateOnScroll';

const features = [
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: "Authenticity Guaranteed",
        description: "We are an authorized reseller for all major brands. Shop with confidence knowing you're getting 100% genuine products with a full manufacturer's warranty."
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
            </svg>
        ),
        title: "Unbeatable Prices & Deals",
        description: "Get the best value for your money. We constantly monitor prices to bring you unbeatable offers, EMI options, and exclusive discounts on your favorite devices."
    },
    {
        icon: (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-2h8a1 1 0 001-1z" />
            </svg>
        ),
        title: "Fast & Secure Delivery",
        description: "Your new device, delivered to your doorstep quickly and safely. We partner with leading courier services to ensure timely and secure delivery across India."
    },
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H17z" />
            </svg>
        ),
        title: "Expert Customer Support",
        description: "Have questions? Our knowledgeable and friendly support team is here to help you before, during, and after your purchase. Your satisfaction is our priority."
    },
   
    {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        ),
        title: "Wide Range of Products",
        description: "From the latest flagship smartphones to essential accessories and smartwatches, we are your one-stop shop for all your mobile technology needs."
    },
];

const WhyDevMobilePage: React.FC = () => {
    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            <div className="text-center py-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 sm:text-5xl">Why Choose Dev Mobile?</h1>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                    We're more than just a mobile shop. We're your trusted partner in technology, committed to delivering an exceptional shopping experience from start to finish.
                </p>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <AnimateOnScroll key={index} className="w-full">
                        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 h-full text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-center items-center mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-800">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    </AnimateOnScroll>
                ))}
            </div>
        </div>
    );
};

export default WhyDevMobilePage;