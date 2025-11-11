import * as React from 'react';
import { HeartIcon, ShoppingCartIcon } from './icons';

interface BottomNavBarProps {
    currentPage: string;
}

const NavItem: React.FC<{ href: string; label: string; icon: React.ReactNode; isActive: boolean; }> = ({ href, label, icon, isActive }) => (
    <a href={href} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-500'}`}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
    </a>
);

const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentPage }) => {
    
    const navItems = [
        { href: '#/home', label: 'Home', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>, page: 'home' },
        { href: '#/shop', label: 'Shop', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>, page: 'shop' },
        { href: '#/wishlist', label: 'Wishlist', icon: <HeartIcon className="h-6 w-6 mb-1" />, page: 'wishlist' },
        { href: '#/account', label: 'Account', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>, page: 'account' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg z-30 animate-slide-in-bottom">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <NavItem 
                        key={item.label}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        isActive={currentPage === item.page}
                    />
                ))}
            </div>
        </nav>
    );
};

export default BottomNavBar;