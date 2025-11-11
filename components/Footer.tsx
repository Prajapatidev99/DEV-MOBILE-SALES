import * as React from 'react';
import type { User } from '../types';
import { FacebookIcon, InstagramIcon, WhatsAppIcon, YouTubeIcon } from './icons';

interface FooterProps {
    currentUser: User | null;
}

const SocialIcon: React.FC<{ href: string; label: string; icon: React.ReactNode; hoverBg: string; }> = ({ href, label, icon, hoverBg }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={`group relative w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center text-gray-300 transition-all duration-300 ${hoverBg} hover:text-white`}
    >
        {icon}
        <span className={`absolute -top-10 scale-0 group-hover:scale-100 transition-transform duration-300 ${hoverBg.replace('hover:', '')} text-white text-xs px-2 py-1 rounded-md`}>
            {label}
        </span>
    </a>
);


const Footer: React.FC<FooterProps> = ({ currentUser }) => {
    return (
        <footer className="bg-gray-800 text-gray-300 mt-12 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {/* Column 1: Dev Mobile */}
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider mb-4">Dev Mobile</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#/why-dev-mobile" className="hover:text-white transition-colors">Why Dev Mobile</a></li>
                            <li><a href="#/terms" className="hover:text-white transition-colors">Terms and Conditions</a></li>
                            <li><a href="#/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#/returns" className="hover:text-white transition-colors">Returns and Refunds</a></li>
                            <li><a href="#/blog" className="hover:text-white transition-colors">Blog</a></li>
                        </ul>
                    </div>
                    {/* Column 2: Shop */}
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider mb-4">Shop</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#/shop/Smartphones" className="hover:text-white transition-colors">Smartphones</a></li>
                            <li><a href="#/shop/Smartwatches" className="hover:text-white transition-colors">Smartwatches</a></li>
                            <li><a href="#/shop/Accessories" className="hover:text-white transition-colors">Accessories</a></li>
                            <li><a href="#/find-store" className="hover:text-white transition-colors">Find A Store</a></li>
                        </ul>
                    </div>
                    {/* Column 3: Help */}
                    <div>
                        <h3 className="font-bold text-white uppercase tracking-wider mb-4">Help</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#/home" className="hover:text-white transition-colors">Home</a></li>
                            <li><a href="#/account" className="hover:text-white transition-colors">My Account</a></li>
                            <li><a href="#/track-order" className="hover:text-white transition-colors">Track Order</a></li>
                            <li><a href="#/faq" className="hover:text-white transition-colors">FAQ</a></li>
                            <li><a href="#/contact" className="hover:text-white transition-colors">Customer Care</a></li>
                            <li><a href="#/coupons" className="hover:text-white transition-colors">Coupons</a></li>
                            {currentUser?.role === 'admin' && (
                                <li><a href="#/admin" className="hover:text-white transition-colors">Admin Panel</a></li>
                            )}
                        </ul>
                    </div>
                    {/* Column 4: Follow Us */}
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="font-bold text-white uppercase tracking-wider mb-4 text-center">Follow Us On</h3>
                         <div className="flex justify-center gap-2 mt-4">
                            <SocialIcon href="https://www.instagram.com/devmobileservice_ahm/" label="Instagram" icon={<InstagramIcon className="w-6 h-6" />} hoverBg="hover:bg-[#e4405f]" />
                            <SocialIcon href="https://www.facebook.com/devmobileservice_ahm/" label="Facebook" icon={<FacebookIcon className="w-6 h-6" />} hoverBg="hover:bg-[#1877f2]" />
                            <SocialIcon href="https://wa.me/919974221322" label="WhatsApp" icon={<WhatsAppIcon className="w-6 h-6" />} hoverBg="hover:bg-[#25D366]" />
                            <SocialIcon href="https://youtube.com" label="YouTube" icon={<YouTubeIcon className="w-6 h-6" />} hoverBg="hover:bg-[#FF0000]" />
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
                    <p><strong>Our Store:</strong> Shreeji enclave complex, L-15, Ramdevnagar Rd, satellite, Ahmedabad, Gujarat 380015</p>
                    <p className="mt-4">&copy; {new Date().getFullYear()} Dev Mobile. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default React.memo(Footer);