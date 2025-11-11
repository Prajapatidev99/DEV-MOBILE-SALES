// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { User, Product, Notification, ProductCategory } from '../types';
import { HeartIcon, ShoppingCartIcon } from './icons';
import SearchBar from './SearchBar';
import NotificationsPanel from './NotificationsPanel';
import AnimatedAuthButton from './AnimatedAuthButton';

interface HeaderProps {
  cartCount: number;
  likedCount: number;
  currentUser: User | null;
  onLogout: () => void;
  onAuthClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  recentSearches: string[];
  allProducts: Product[];
  animateCartIcon: boolean;
  animateLikedIcon: boolean;
  userPinCode: string | null;
  onLocationClick: () => void;
  notifications: Notification[];
  onMarkNotificationsAsRead: (ids: number[] | 'all') => void;
  selectedCategory: ProductCategory | null;
}

const categoryLinks = [
    { name: "Smartphones", href: "#/shop/Smartphones"},
    { name: "Smartwatches", href: "#/shop/Smartwatches"},
    { 
        name: "Accessories", 
        href: "#/shop/Accessories",
    },
    { name: "Repair", href: "#/repair"},
];


const CategoryNav: React.FC<{ selectedCategory: ProductCategory | null }> = ({ selectedCategory }) => {
    return (
        <nav className="hidden md:block bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center space-x-8 overflow-x-auto custom-scrollbar py-3">
                    {categoryLinks.map(category => {
                        const isSelected = selectedCategory === category.name;
                        
                        return (
                            <div key={category.name} className="relative group">
                                <a 
                                    href={category.href}
                                    className={`
                                        relative group/link flex items-center whitespace-nowrap transition-colors py-1 text-sm font-semibold 
                                        ${isSelected ? 'text-blue-600' : 'text-gray-700 hover:text-black'}
                                    `}
                                >
                                    <span>{category.name}</span>
                                    {'subCategories' in category && category.subCategories && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 text-gray-400 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    )}
                                    <span 
                                        className={`
                                            absolute bottom-0 left-0 block h-0.5 bg-blue-600 transition-all duration-300 
                                            ${isSelected ? 'w-full' : 'w-0 group-hover/link:w-full'}
                                        `}
                                    ></span>
                                </a>

                                {'subCategories' in category && category.subCategories && (
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 bg-white rounded-md shadow-lg py-2 z-20 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                                        {(category.subCategories as any[]).map(sub => (
                                            <a key={sub.name} href={sub.href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors">
                                                {sub.name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </nav>
    );
};

const MobileMenu: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    selectedCategory: ProductCategory | null;
    currentUser: User | null;
    onLogout: () => void;
    onAuthClick: () => void;
}> = ({ isOpen, onClose, selectedCategory, currentUser, onLogout, onAuthClick }) => {
    const [openAccordion, setOpenAccordion] = React.useState<string | null>(null);

    const toggleAccordion = (name: string) => {
        setOpenAccordion(prev => (prev === name ? null : name));
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black/80 z-40 md:hidden animate-fade-in" onClick={onClose}>
            <div className={`fixed inset-y-0 left-0 w-3/4 max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={e => e.stopPropagation()}>
                <div className="p-6 h-full flex flex-col">
                    <h2 className="text-2xl font-bold mb-6">Menu</h2>
                    <nav className="flex flex-col space-y-1">
                         {categoryLinks.map(category => {
                            const isSelected = selectedCategory === category.name;
                            const hasSubCategories = 'subCategories' in category && category.subCategories && (category.subCategories as any[]).length > 0;
                            const isAccordionOpen = openAccordion === category.name;

                            return (
                                <div key={category.name}>
                                    <div className="flex items-center justify-between">
                                        <a 
                                            href={category.href}
                                            onClick={!hasSubCategories ? onClose : (e) => e.preventDefault()}
                                            className={`flex-grow py-2 text-lg font-semibold ${isSelected && !hasSubCategories ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}
                                        >
                                            {category.name}
                                        </a>
                                        {hasSubCategories && (
                                            <button onClick={() => toggleAccordion(category.name)} className="p-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                            </button>
                                        )}
                                    </div>
                                    {hasSubCategories && (
                                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isAccordionOpen ? 'max-h-96' : 'max-h-0'}`}>
                                            <div className="pl-4 py-2 space-y-2 border-l-2 ml-2">
                                                {('subCategories' in category && category.subCategories && (category.subCategories as any[]).map(sub => (
                                                    <a key={sub.name} href={sub.href} onClick={onClose} className="block text-md text-gray-600 hover:text-blue-600">{sub.name}</a>
                                                )))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                         })}
                    </nav>
                    <div className="border-t my-6"></div>
                    <div className="mt-auto space-y-4">
                        {currentUser ? (
                            <>
                                <a href="#/account" onClick={onClose} className="block text-lg font-semibold text-gray-700 hover:text-blue-600">My Account</a>
                                {currentUser.role === 'admin' && (
                                    <a href="#/admin" onClick={onClose} className="block text-lg font-semibold text-gray-700 hover:text-blue-600">Admin Panel</a>
                                )}
                                {currentUser.role === 'seller' && (
                                    <a href="#/seller" onClick={onClose} className="block text-lg font-semibold text-gray-700 hover:text-blue-600">Seller Panel</a>
                                )}
                                <div className="pt-2">
                                  <AnimatedAuthButton type="logout" label="Logout" onClick={() => { onLogout(); onClose(); }} isLight={true} />
                                </div>
                            </>
                        ) : (
                            <AnimatedAuthButton type="login" label="Login / Sign Up" onClick={() => { onAuthClick(); onClose(); }} isLight={true} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ 
    cartCount, 
    likedCount, 
    currentUser, 
    onLogout, 
    onAuthClick, 
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    recentSearches,
    allProducts,
    animateCartIcon,
    animateLikedIcon,
    userPinCode,
    onLocationClick,
    notifications,
    onMarkNotificationsAsRead,
    selectedCategory
}) => {
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = React.useState(false);
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const notificationsRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header className="sticky top-0 bg-white shadow-sm z-20">
        <div className="bg-gray-800 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                <div className="flex items-center">
                    <button onClick={() => setMenuOpen(true)} className="md:hidden mr-4 text-white">
                        <div className={`space-y-1.5 ${isMenuOpen ? 'menu-open' : ''}`}>
                            <span className="block w-6 h-0.5 bg-white hamburger-line"></span>
                            <span className="block w-6 h-0.5 bg-white hamburger-line"></span>
                            <span className="block w-6 h-0.5 bg-white hamburger-line"></span>
                        </div>
                    </button>
                    <div className="flex-shrink-0">
                      <a href="#/home" className="group text-2xl sm:text-3xl font-bold text-white tracking-tighter">
                        <span className="transition-colors group-hover:text-yellow-300">Dev</span>
                        <span> Mobile</span>
                      </a>
                       <button onClick={onLocationClick} className="text-xs text-yellow-300 -mt-1 flex items-center gap-1 hover:text-white hover:underline transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span>{userPinCode ? `Deliver to ${userPinCode}` : 'Select your location'}</span>
                        </button>
                    </div>
                </div>

                <div className="hidden md:flex flex-1 justify-center px-6">
                  <div className="w-full max-w-lg">
                      <SearchBar 
                          id="search-input-desktop"
                          searchQuery={searchQuery}
                          onSearchChange={onSearchChange}
                          onSearchSubmit={onSearchSubmit}
                          recentSearches={recentSearches}
                          allProducts={allProducts}
                      />
                  </div>
                </div>

                <div className="flex items-center space-x-2 md:space-x-3">
                   <div className="relative" ref={notificationsRef}>
                    <button onClick={() => setNotificationsOpen(prev => !prev)} className="relative text-white rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 w-9 h-9 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                         {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {unreadCount}
                          </span>
                        )}
                    </button>
                    {isNotificationsOpen && (
                      <NotificationsPanel 
                        notifications={notifications}
                        onClose={() => setNotificationsOpen(false)}
                        onMarkAsRead={onMarkNotificationsAsRead}
                      />
                    )}
                   </div>
                  <a href="#/wishlist" className="relative text-white rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 w-9 h-9 flex items-center justify-center">
                    <HeartIcon className={`w-6 h-6 ${animateLikedIcon ? 'animate-jiggle' : ''}`} />
                    {likedCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {likedCount}
                      </span>
                    )}
                  </a>
                  <a href="#/cart" className="relative text-white rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-110 w-9 h-9 flex items-center justify-center">
                    <ShoppingCartIcon className={`w-6 h-6 ${animateCartIcon ? 'animate-jiggle' : ''}`} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                        {cartCount}
                      </span>
                    )}
                  </a>

                   {currentUser ? (
                      <div className="relative" ref={dropdownRef}>
                          <button onClick={() => setDropdownOpen(!isDropdownOpen)} className="hidden md:flex items-center space-x-2 text-white p-1 rounded-full hover:bg-gray-700 transition-colors">
                               <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-800 flex items-center justify-center font-bold text-sm ring-1 ring-white/50" title={currentUser.name}>
                                {currentUser.name.charAt(0).toUpperCase()}
                               </div>
                               <svg className={`w-4 h-4 transition-transform mr-1 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                          </button>
                          {isDropdownOpen && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 ring-1 ring-black ring-opacity-5 divide-y">
                                  <div className="py-1">
                                    <a href="#/account" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</a>
                                    {currentUser.role === 'admin' && (
                                        <a href="#/admin" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Panel</a>
                                    )}
                                    {currentUser.role === 'seller' && (
                                        <a href="#/seller" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Seller Panel</a>
                                    )}
                                  </div>
                                  <div className="flex justify-center p-2">
                                    <AnimatedAuthButton type="logout" label="Logout" onClick={() => { onLogout(); setDropdownOpen(false); }} isLight={true} />
                                  </div>
                              </div>
                          )}
                      </div>
                  ) : (
                      <div className="hidden md:block">
                        <AnimatedAuthButton type="login" label="Login" onClick={onAuthClick} />
                      </div>
                  )}
                </div>
              </div>
          </div>
        </div>
         <div className="md:hidden p-2 bg-gray-800 border-t border-gray-700">
             <SearchBar 
                  id="search-input-mobile"
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  onSearchSubmit={onSearchSubmit}
                  recentSearches={recentSearches}
                  allProducts={allProducts}
              />
          </div>
        <CategoryNav selectedCategory={selectedCategory} />
      </header>
      <MobileMenu 
        isOpen={isMenuOpen} 
        onClose={() => setMenuOpen(false)} 
        selectedCategory={selectedCategory}
        currentUser={currentUser}
        onLogout={onLogout}
        onAuthClick={onAuthClick}
      />
    </>
  );
};

export default Header;