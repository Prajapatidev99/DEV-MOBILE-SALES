// FIX: Corrected the import order. The React module must be imported before any files that might augment its types, such as './types.ts'. The previous order was causing a race condition during module initialization, preventing React's JSX types from being correctly recognized and causing the application to fail during render.
import * as React from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import * as api from './api';

import type { Product, CartItem, User, Order, Review, Store, ChatMessage, Notification, ProductCategory, ProductVariant, DisplayableProduct, HomepageConfig, Coupon, Payout } from './types';
import Header from './components/Header';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import FilterControls from './components/FilterControls';
import ProductDetail from './components/ProductDetail';
import HomePage from './components/HomePage';
import Pagination from './components/Pagination';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import Auth from './components/Auth';
import AccountPage from './components/AccountPage';
import WishlistPage from './components/WishlistPage';
import ContactPage from './components/ContactPage';
import FaqPage from './components/FaqPage';
import ShippingPage from './components/ShippingPage';
import SecurityGuide from './components/SecurityGuide';
import { ShoppingCartIcon } from './components/icons';
import Breadcrumbs, { Breadcrumb } from './components/Breadcrumbs';
import ToastContainer from './components/ToastContainer';
import PinCodeModal from './components/PinCodeModal';
import SortDropdown from './components/SortDropdown';
import AnimateOnScroll from './components/AnimateOnScroll';
import ChatButton from './components/ChatButton';
import Chatbot from './components/Chatbot';
import OrderTrackingModal from './components/OrderTrackingModal';
import CompareTray from './components/CompareTray';
import CompareModal from './components/CompareModal';
import RepairPage from './components/RepairPage';
import Footer from './components/Footer';
import TermsPage from './components/TermsPage';
import PrivacyPage from './components/PrivacyPage';
import ReturnsPage from './components/ReturnsPage';
import BlogPage from './components/BlogPage';
import FindStorePage from './components/FindStorePage';
import CouponsPage from './components/CouponsPage';
import AdminPage from './components/AdminPage';
import WhyDevMobilePage from './components/WhyDevMobilePage';
import TrackOrderPage from './components/TrackOrderPage';
import InvoicePage from './components/InvoicePage';
import CustomPaymentPage from './components/CustomPaymentPage';
import SellerPage from './components/SellerPage';


const PRODUCTS_PER_PAGE = 12;
const ABANDONMENT_CHECK_INTERVAL = 60 * 1000; // Check every 1 minute for demo
const ABANDONMENT_THRESHOLD = 5 * 60 * 1000; // 5 minutes for demo purposes

type Page = 'home' | 'account' | 'wishlist' | 'contact' | 'faq' | 'shipping' | 'cart' | 'shop' | 'security-guide' | 'product' | 'repair' | 'terms' | 'privacy' | 'returns' | 'blog' | 'find-store' | 'coupons' | 'admin' | 'seller' | 'why-dev-mobile' | 'track-order' | 'invoice' | 'payment-gateway' | 'payment-success' | 'payment-failure';
type AppState = 'browsing' | 'checkout' | 'confirmed';
type ToastType = { id: number; message: string; type: 'success' | 'error' };
type FlyingImageState = { src: string; top: number; left: number; width: number; height: number; } | null;


// --- Search Utility ---
// Optimized Levenshtein distance function for fuzzy search
const levenshteinDistance = (s1: string, s2: string): number => {
    if (s1.length > s2.length) {
        [s1, s2] = [s2, s1];
    }

    const distances: number[] = Array.from({ length: s1.length + 1 }, (_, i) => i);

    for (let i2 = 0; i2 < s2.length; i2++) {
        const newDistances = [i2 + 1];
        for (let i1 = 0; i1 < s1.length; i1++) {
            if (s1[i1] === s2[i2]) {
                newDistances.push(distances[i1]);
            } else {
                newDistances.push(1 + Math.min(distances[i1], distances[i1 + 1], newDistances[newDistances.length - 1]));
            }
        }
        distances.splice(0, distances.length, ...newDistances);
    }
    return distances[s1.length];
};


// FIX: Changed ProductCardSkeleton to use an implicit return `() => (...)` and moved it outside the App component. This resolves a TypeScript error where the function's return type was incorrectly inferred as 'void' due to a JSX parsing issue, which in turn fixes the 'no default export' error for the App component.
// FIX: The `ProductCardSkeleton` component was defined using curly braces `{}` without an explicit `return` statement, causing its return type to be inferred as `void`. This is incompatible with `React.FC`. Switched to parentheses `()` for an implicit return of the JSX, resolving the type error.
const ProductCardSkeleton: React.FC = () => (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full animate-pulse-glow">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-auto"></div>
      </div>
    </div>
);

const triggerHapticFeedback = () => {
  if (navigator.vibrate) {
    navigator.vibrate(50); // 50ms vibration
  }
};

const AccessDenied: React.FC = () => (
    <div className="text-center bg-white p-12 rounded-lg shadow-md border border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view this page.</p>
    </div>
);

const localPincodes = ["380015", "380051", "380007", "380009"];

const chooseDeliveryType = (pincode: string): 'LOCAL' | 'COURIER' => {
  if (localPincodes.includes(pincode)) {
    return "LOCAL";
  } else {
    return "COURIER";
  }
};

const App: React.FC = () => {
  // UI State
  const [appState, setAppState] = React.useState<AppState>('browsing');
  const [page, setPage] = React.useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = React.useState<number | null>(null);
  const [animateCartIcon, setAnimateCartIcon] = React.useState(false);
  const [animateLikedIcon, setAnimateLikedIcon] = React.useState(false);
  const [toasts, setToasts] = React.useState<ToastType[]>([]);
  const [isPageVisible, setPageVisible] = React.useState(false);
  const [flyingImage, setFlyingImage] = React.useState<FlyingImageState>(null);
  
  // Data State
  const [products, setProducts] = React.useState<Product[]>([]);
  const [stores, setStores] = React.useState<Store[]>([]);
  const [coupons, setCoupons] = React.useState<Coupon[]>([]);
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [likedItems, setLikedItems] = React.useState<number[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [orderInfo, setOrderInfo] = React.useState<Order | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = React.useState<number[]>([]);
  const [notificationList, setNotificationList] = React.useState<number[]>([]);
  const [priceWatchList, setPriceWatchList] = React.useState<number[]>([]);
  const [compareList, setCompareList] = React.useState<number[]>([]);
  const [homepageConfig, setHomepageConfig] = React.useState<HomepageConfig | null>(null);
  
  // Admin Data State
  const [allUsers, setAllUsers] = React.useState<User[]>([]);
  const [allOrders, setAllOrders] = React.useState<Order[]>([]);

  // Loading State
  const [isProductsLoading, setIsProductsLoading] = React.useState(true);
  const [isDataLoading, setIsDataLoading] = React.useState(true);

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = React.useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = React.useState('');
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const [sortOption, setSortOption] = React.useState('rating-desc');
  const [selectedBrand, setSelectedBrand] = React.useState('All');
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | null>(null);
  const [priceLimit, setPriceLimit] = React.useState(0);
  const [showInStockOnly, setShowInStockOnly] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [userPinCode, setUserPinCode] = React.useState<string | null>(null);

  // Auth & Location State
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [isAuthModalOpen, setAuthModalOpen] = React.useState(false);
  const [isPinCodeModalOpen, setPinCodeModalOpen] = React.useState(false);
  const [userLocation, setUserLocation] = React.useState<{ latitude: number, longitude: number} | null>(null);
  
  // AI State
  const [recommendedProducts, setRecommendedProducts] = React.useState<Product[]>([]);
  const [isRecommendationsLoading, setIsRecommendationsLoading] = React.useState(false);
  const [isChatOpen, setChatOpen] = React.useState(false);
  const [chatMessages, setChatMessages] = React.useState<ChatMessage[]>([
    { role: 'model', content: "Hello! I'm your Dev Mobile assistant. How can I help you find the perfect device today?" }
  ]);
  const [isChatbotLoading, setChatbotLoading] = React.useState(false);
  
  // Order Tracking State
  const [trackingOrder, setTrackingOrder] = React.useState<Order | null>(null);

  // Notification State
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const simulationRan = React.useRef(false);
  const [notifiedAbandonedItems, setNotifiedAbandonedItems] = React.useState<string[]>([]);
  const [showNotificationPrompt, setShowNotificationPrompt] = React.useState(false);

  // Compare State
  const [isCompareModalOpen, setCompareModalOpen] = React.useState(false);


  // Derived State & Constants
  const approvedProducts = React.useMemo(() => products.filter(p => p.approvalStatus === 'approved'), [products]);

  const brands = React.useMemo(() => ['All', ...new Set(approvedProducts.map(p => p.brand))], [approvedProducts]);
  // FIX: Added a defensive filter to prevent crashes if a product is missing a 'variants' array. This ensures the app is resilient to malformed data during initialization.
  const maxPrice = React.useMemo(() => {
    const validProducts = approvedProducts.filter(p => p && Array.isArray(p.variants));
    if (validProducts.length === 0) return 0;
    return Math.max(...validProducts.flatMap(p => p.variants.map(v => v.price)), 0);
  }, [approvedProducts]);
  const selectedProduct = React.useMemo(() => products.find(p => p.id === selectedProductId) || null, [selectedProductId, products]);

  // Flattened product list for homepage display
  const displayableProducts = React.useMemo<DisplayableProduct[]>(() => {
    return approvedProducts.flatMap(product =>
        (product.variants || []).map(variant => {
            const variantAttributes = Object.values(variant.attributes).filter(Boolean).join(', ');
            return {
                uniqueId: `${product.id}-${variant.id}`,
                parentId: product.id,
                name: variantAttributes ? `${product.name} (${variantAttributes})` : product.name,
                imageUrl: variant.imageUrl || product.imageUrls[0] || '',
                price: variant.price,
                originalPrice: variant.originalPrice,
                rating: product.rating,
                inStock: (variant.inventory || []).some(inv => inv.quantity > 0),
                dateAdded: product.dateAdded,
                brand: product.brand,
                product: product,
                variant: variant,
            };
        })
    );
  }, [approvedProducts]);


  // Toast Notifications
  const addToast = React.useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prevToasts => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, 5000); // Increased timeout for coupon codes
  }, []);

  // --- DATA LOADING & PERSISTENCE ---
  const loadInitialData = React.useCallback(async () => {
    setIsDataLoading(true);
    try {
      await api.seedDatabase(); // Seed only if it's the first time
      const [loadedProducts, loadedStores, sessionUser, loadedConfig, loadedCoupons] = await Promise.all([
        api.getProducts(),
        api.getStores(),
        api.getCurrentUser(),
        api.getHomepageConfig(),
        api.getCoupons(),
      ]);
      
      // FIX: Filter out any malformed products that might be missing the 'variants' array to prevent crashes.
      const validProducts = loadedProducts.filter(p => p && Array.isArray(p.variants));
      
      setProducts(validProducts);
      setStores(loadedStores);
      setHomepageConfig(loadedConfig);
      setCoupons(loadedCoupons);
      if (validProducts.length > 0) {
        setPriceLimit(Math.max(...validProducts.flatMap(p => p.variants.map(v => v.price)), 0));
      }
      
      const savedPinCode = api.getPinCode();
      if (savedPinCode) setUserPinCode(savedPinCode);
      
      if (sessionUser) {
        setCurrentUser(sessionUser);
        const [userCart, userWishlist, userOrders] = await Promise.all([
          api.getCart(sessionUser.id),
          api.getWishlist(sessionUser.id),
          api.getOrders(sessionUser.id)
        ]);
        setCartItems(userCart);
        setLikedItems(userWishlist);
        setOrders(userOrders);

        if (sessionUser.role === 'admin' || sessionUser.role === 'seller') {
            const [loadedUsers, loadedOrders] = await Promise.all([
                api.getAllUsers(),
                api.getAllOrders()
            ]);
            setAllUsers(loadedUsers);
            setAllOrders(loadedOrders);
        }
      }
    } catch (error) {
      console.error("Failed to load initial data:", error);
      addToast("Failed to load store data. Please refresh.", "error");
    } finally {
      setIsDataLoading(false);
      setIsProductsLoading(false);
    }
  }, [addToast]);
  
  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  // Geolocation
  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        },
        (error) => {
            console.warn("Could not get user location:", error.message);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  // --- NOTIFICATION SYSTEM ---
  const handleAddNotification = React.useCallback((notificationData: Omit<Notification, 'id' | 'isRead' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now(),
      isRead: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const handleMarkNotificationsAsRead = React.useCallback((ids: number[] | 'all') => {
    setNotifications(prev => 
      prev.map(n => (ids === 'all' || ids.includes(n.id)) ? { ...n, isRead: true } : n)
    );
  }, []);
  
  // Abandoned Cart Checker
  React.useEffect(() => {
    const checkAbandonedCart = () => {
      if (!currentUser || !currentUser.mobile || cartItems.length === 0) {
        return;
      }
      const now = new Date().getTime();
      const userFirstName = currentUser.name.split(' ')[0];

      cartItems.forEach(item => {
        const itemAddedTime = new Date(item.dateAdded).getTime();
        const notificationId = `${item.product.id}-${item.variant.id}`;
        
        if (now - itemAddedTime > ABANDONMENT_THRESHOLD && !notifiedAbandonedItems.includes(notificationId)) {
          console.log(`Abandoned cart detected for product: ${item.product.name}`);
          addToast(`Hi ${userFirstName}, still thinking about the ${item.product.name}? We've sent a special offer to your WhatsApp!`, "success");
          setNotifiedAbandonedItems(prev => [...prev, notificationId]);
        }
      });
    };

    const intervalId = setInterval(checkAbandonedCart, ABANDONMENT_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, [currentUser, cartItems, notifiedAbandonedItems, addToast]);

  // Push Notification Prompt
  React.useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
        const timer = setTimeout(() => setShowNotificationPrompt(true), 10000); // Show after 10s
        return () => clearTimeout(timer);
    }
  }, []);
  
  // Review Reminder System
  React.useEffect(() => {
    // This effect runs periodically to check for delivered orders that need a review reminder.
    if (!currentUser || orders.length === 0) return;

    // A short delay to simulate the reminder being sent "some time after" delivery.
    const reminderCheckTimeout = setTimeout(() => {
      const sentReminders = api.getSentReviewReminders();
      const deliveredOrdersNeedingReminder = orders.filter(
        order => order.status === 'Delivered' && !sentReminders.includes(order.id)
      );

      if (deliveredOrdersNeedingReminder.length > 0) {
        addToast(`You have new review requests for your recent purchases!`, 'success');
        deliveredOrdersNeedingReminder.forEach(order => {
          order.items.forEach(item => {
            handleAddNotification({
              type: 'review',
              title: `How was your ${item.product.name}?`,
              message: "We'd love to hear your thoughts. Please leave a review!",
              link: `#/product/${item.product.id}`,
            });
          });
          // Mark this order as having had a reminder sent
          api.addSentReviewReminder(order.id);
        });
      }
    }, 15000); // Check 15 seconds after orders load/change for demo purposes.

    return () => clearTimeout(reminderCheckTimeout);

  }, [orders, currentUser, handleAddNotification, addToast]);


  const handleRequestNotificationPermission = () => {
      Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
              addToast('Notifications enabled!', 'success');
              new Notification('Welcome to Dev Mobile!', { body: 'You\'ll now receive updates on sales and offers.' });
          } else {
              addToast('Notifications were not enabled.', 'error');
          }
          setShowNotificationPrompt(false);
      });
  };

  // AI Recommendations
  const fetchRecommendations = React.useCallback(async () => {
      // ... same as before
  }, [recentlyViewedIds, likedItems, products]);

  React.useEffect(() => {
    if (products.length > 0 && (recentlyViewedIds.length > 0 || likedItems.length > 0)) {
        fetchRecommendations();
    }
  }, [products, recentlyViewedIds, likedItems, fetchRecommendations]);

  const handleChatSubmit = React.useCallback(async (message: string) => {
      // ... same as before
  }, [chatMessages, products]);


  // Handlers
  const handleAddToCart = React.useCallback(async (product: Product, variant: ProductVariant, event: React.MouseEvent) => {
    if (!currentUser) {
      addToast("Please log in to add items to your cart.", "error");
      setAuthModalOpen(true);
      return;
    }

    triggerHapticFeedback();
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();

    setFlyingImage({
      src: variant.imageUrl || product.imageUrls[0],
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setTimeout(() => setFlyingImage(null), 750);

    const updatedCart = await api.addToCart(currentUser.id, product, variant);
    setCartItems(updatedCart);
    addToast(`${product.name} added to cart!`);
    setAnimateCartIcon(true);
    setTimeout(() => setAnimateCartIcon(false), 500);
  }, [addToast, currentUser]);

  const handleRemoveFromCart = async (variantId: string) => {
    if (!currentUser) return;
    const updatedCart = await api.removeFromCart(currentUser.id, variantId);
    setCartItems(updatedCart);
  };

  const handleUpdateQuantity = async (variantId: string, newQuantity: number) => {
    if (!currentUser) return;
    if (newQuantity < 1) {
      await handleRemoveFromCart(variantId);
      return;
    }
    const updatedCart = await api.updateCartQuantity(currentUser.id, variantId, newQuantity);
    setCartItems(updatedCart);
  };
  
  const handleToggleLike = React.useCallback(async (productId: number) => {
    if (!currentUser) {
      addToast("Please log in to manage your wishlist.", "error");
      setAuthModalOpen(true);
      return;
    }
    triggerHapticFeedback();
    const updatedWishlist = await api.toggleWishlist(currentUser.id, productId);
    const isLiked = updatedWishlist.includes(productId);
    
    addToast(isLiked ? 'Added to wishlist!' : 'Removed from wishlist.', 'success');
    if(isLiked) {
        setAnimateLikedIcon(true);
        setTimeout(() => setAnimateLikedIcon(false), 500);
    }
    setLikedItems(updatedWishlist);
  }, [addToast, currentUser]);

  const handleToggleCompare = React.useCallback((productId: number) => {
    setCompareList(prev => {
      if (prev.includes(productId)) {
        addToast('Removed from compare.', 'success');
        return prev.filter(id => id !== productId);
      } else if (prev.length < 2) {
        addToast('Added to compare!');
        return [...prev, productId];
      } else {
        addToast('You can only compare 2 products at a time.', 'error');
        return prev;
      }
    });
  }, [addToast]);

  const handleClearCompare = () => setCompareList([]);

  // Debounced search for performance
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };
  
  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setDebouncedSearchQuery(query); // Submit immediately
    setCurrentPage(1); // Reset to first page on new search
    setPage('shop');
    setSelectedCategory(null);
    if (query && !recentSearches.includes(query)) {
        const newSearches = [query, ...recentSearches].slice(0, 5);
        setRecentSearches(newSearches);
    }
  };

  const handleSortChange = (option: string) => setSortOption(option);
  const handleBrandSelect = (brand: string) => {
    setSelectedBrand(brand);
    setCurrentPage(1);
    setSelectedCategory(null); // Clear category filter to show all products for the brand
    window.location.hash = '#/shop';
  };
  const handlePriceChange = (price: number) => setPriceLimit(price);
  const handleInStockChange = (show: boolean) => { setShowInStockOnly(show); setCurrentPage(1); };
  const handlePageChange = (pageNumber: number) => { setCurrentPage(pageNumber); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  
  const handleAddReview = async (productId: number, rating: number, comment: string) => {
      if (!currentUser) {
          addToast("You must be logged in to leave a review.", "error");
          return;
      }
      const updatedProduct = await api.addReview(productId, {
          id: Date.now(),
          author: currentUser.name,
          rating,
          comment,
          date: new Date().toISOString().split('T')[0]
      });
      setProducts(prevProducts => prevProducts.map(p => p.id === productId ? updatedProduct : p));
      addToast("Thank you for your review!", "success");
  };

  const handleAuthSuccess = async (user: User) => {
    setCurrentUser(user);
    setAuthModalOpen(false);
    addToast(`Welcome back, ${user.name}!`);

    // SIMULATION: Welcome offer on first login this session.
    const welcomeMessageSent = sessionStorage.getItem('welcomeMessageSent');
    if (!welcomeMessageSent) {
        addToast(`Welcome! A special free delivery offer has been sent to your WhatsApp.`, 'success');
        sessionStorage.setItem('welcomeMessageSent', 'true');
    }

    if (user.dob) {
        const today = new Date();
        const birthDate = new Date(user.dob);
        // Compare month and day, ignoring the year
        if (today.getMonth() === birthDate.getMonth() && today.getDate() === birthDate.getDate()) {
            addToast(`Happy Birthday, ${user.name.split(' ')[0]}! 🎉 We've sent a special 20% discount (code: BDAY20) to your email. Enjoy your day!`, 'success');
        }
    }

    // load user-specific data
    const [userCart, userWishlist, userOrders] = await Promise.all([
      api.getCart(user.id),
      api.getWishlist(user.id),
      api.getOrders(user.id)
    ]);
    setCartItems(userCart);
    setLikedItems(userWishlist);
    setOrders(userOrders);

    if (user.role === 'admin' || user.role === 'seller') {
        const [loadedUsers, loadedOrders] = await Promise.all([
            api.getAllUsers(),
            api.getAllOrders()
        ]);
        setAllUsers(loadedUsers);
        setAllOrders(loadedOrders);
    }
  };


  const handleSignup = async (name: string, email: string, pass: string, mobile: string, marketingConsent: boolean) => {
     try {
      const newUser = await api.signup(name, email, pass, mobile, marketingConsent);
      setCurrentUser(newUser);
      setAuthModalOpen(false);
      addToast(`Account created successfully! Welcome, ${name}!`);
      // Reset user data on new signup
      setCartItems([]);
      setLikedItems([]);
      setOrders([]);
    } catch (error) {
      addToast((error as Error).message, 'error');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCartItems([]);
    setLikedItems([]);
    setOrders([]);
    setAllUsers([]);
    setAllOrders([]);
    setNotifiedAbandonedItems([]);
    setPage('home');
    addToast('You have been logged out.');
  };

  const handleUpdateUser = async (updatedUserData: User) => {
    try {
        const updatedUser = await api.updateUser(updatedUserData);
        setCurrentUser(updatedUser);
        setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        addToast("Profile updated successfully!", "success");
    } catch (error) {
        addToast("Could not update profile.", "error");
        console.error("Failed to update user:", error);
    }
  };
  
  const handleSetPinCode = (pinCode: string): boolean => {
    if (pinCode.length !== 6 || !/^\d+$/.test(pinCode)) {
      addToast('Please enter a valid 6-digit PIN code.', 'error');
      return false;
    }
    const isAvailable = !pinCode.startsWith('9');
    if (isAvailable) {
      api.setPinCode(pinCode);
      setUserPinCode(pinCode);
      addToast(`Delivery location set to ${pinCode}.`);
      return true;
    } else {
      addToast(`Sorry, delivery is not available for ${pinCode}.`, 'error');
      return false;
    }
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
  const shippingCost = cartSubtotal > 5000 || cartSubtotal === 0 ? 0 : 50;
  const cartTotal = cartSubtotal + shippingCost;

  const handlePlaceOrder = async (options: {
      deliveryMethod: 'shipping' | 'pickup' | 'quick-delivery';
      details: Order['deliveryAddress'] | { storeId: number };
      total: number;
      gstin?: string;
      companyName?: string;
      couponCode?: string;
      discountAmount?: number;
      fulfilledByStoreId?: number;
  }): Promise<Order | null> => {
    const { deliveryMethod, details, total, gstin, companyName, couponCode, discountAmount, fulfilledByStoreId } = options;

    if (!currentUser) {
        addToast("Please log in to place an order.", "error");
        setAuthModalOpen(true);
        return null;
    }
    if (cartItems.length === 0) {
        addToast("Your cart is empty.", "error");
        return null;
    }

    const deliveryDetails = deliveryMethod === 'shipping' ? details as Order['deliveryAddress'] : { firstName: '', lastName: '', address: '', city: '', postalCode: ''};
    const pickupDetails = deliveryMethod === 'pickup' ? stores.find(s => s.id === (details as {storeId: number}).storeId) : undefined;
    
    let deliveryType: 'LOCAL' | 'COURIER' | undefined = undefined;
    if (deliveryMethod === 'shipping') {
        deliveryType = chooseDeliveryType(deliveryDetails.postalCode);
    }

    // Create order with 'Pending Payment' status
    const newOrderData: Omit<Order, 'id'> = {
        userId: currentUser.id,
        date: new Date().toISOString(),
        status: 'Pending Payment',
        items: cartItems,
        total,
        deliveryMethod,
        deliveryType,
        deliveryAddress: deliveryDetails,
        pickupStore: pickupDetails,
        fulfilledByStoreId,
        gstin,
        companyName,
        couponCode,
        discountAmount,
    };
    const newOrder = await api.createOrder(newOrderData);
    setOrders(prev => [newOrder, ...prev]);
    if (currentUser.role === 'admin' || currentUser.role === 'seller') {
      setAllOrders(prev => [newOrder, ...prev]);
    }
    return newOrder;
  };

  const handlePaymentProofSubmit = async (utr: string, paymentProof?: string) => {
    const orderId = sessionStorage.getItem('pendingOrderId');
    if (!orderId || !currentUser) {
        addToast('Session expired. Please try again from your cart.', 'error');
        setAppState('browsing');
        setPage('cart');
        return;
    }

    try {
        const updatedOrder = await api.updateOrder(orderId, { 
            status: 'Pending Verification', 
            paymentId: utr,
            paymentProof 
        });

        // Simulate sending a Telegram notification to the admin
        await api.sendTelegramAlert(updatedOrder, currentUser);
        
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        if (currentUser.role === 'admin' || currentUser.role === 'seller') {
            setAllOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        }
        
        setOrderInfo(updatedOrder);
        setCartItems(await api.clearCart(currentUser.id));
        setNotifiedAbandonedItems([]);
        setAppState('confirmed');
        // FIX: Replaced direct page state mutation with a hash change to ensure the URL reflects the application state. This resolves an issue where the app could get stuck on the payment screen.
        window.location.hash = '#/payment-success';
        addToast('Payment details submitted for verification!', 'success');
    } catch (error) {
        addToast('Failed to submit payment details.', 'error');
        setAppState('browsing');
        setPage('cart');
    } finally {
        sessionStorage.removeItem('pendingOrderId');
        sessionStorage.removeItem('pendingOrderTotal');
    }
  };

  const handleUpdateOrder = async (orderId: string, newStatus: Order['status'], payload: Partial<Order> = {}) => {
    try {
        const orderToUpdate = allOrders.find(o => o.id === orderId);
        if (!orderToUpdate) throw new Error("Order not found");

        let statusToSet = newStatus;
        let toastMessage = `Order #${orderId} status updated to ${statusToSet}.`;
        
        // Special logic for Admin verifying payment
        if (currentUser?.role === 'admin' && orderToUpdate.status === 'Pending Verification' && newStatus === 'Processing') {
            if (orderToUpdate.fulfilledByStoreId) {
                statusToSet = 'Pending Seller Acceptance';
                toastMessage = `Order #${orderId} payment verified. Sent to seller for acceptance!`;
            } else {
                toastMessage = `Order #${orderId} payment verified, now processing.`;
            }
        }

        const updatedOrder = await api.updateOrder(orderId, { status: statusToSet, ...payload });

        setAllOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        addToast(toastMessage, 'success');

    } catch (error) {
        addToast('Failed to update order status.', 'error');
        console.error("Failed to update order:", error);
    }
  };

  const handleAddNewProduct = async (productData: Omit<Product, 'id' | 'reviews'>) => {
    try {
      let dataWithSeller = {...productData};
      if (currentUser?.role === 'seller' && currentUser.storeId) {
          dataWithSeller.sellerId = currentUser.storeId;
      }
      const newProduct = await api.addProduct(dataWithSeller);
      setProducts(prev => [newProduct, ...prev]);
      addToast(`Product "${newProduct.name}" has been submitted for approval.`, 'success');
    } catch (error) {
      console.error("Failed to add product:", error);
      addToast("Could not add the product.", "error");
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    try {
      const savedProduct = await api.updateProduct(updatedProduct);
      setProducts(prev => prev.map(p => p.id === savedProduct.id ? savedProduct : p));
      addToast(`Product "${savedProduct.name}" updated successfully!`, 'success');
    } catch (error) {
      console.error("Failed to update product:", error);
      addToast("Could not update the product.", "error");
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    try {
      await api.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      addToast(`Product deleted successfully!`, 'success');
    } catch (error) {
      console.error("Failed to delete product:", error);
      addToast("Could not delete the product.", "error");
    }
  };

  const handleUpdateHomepageConfig = async (config: HomepageConfig) => {
    try {
        const updatedConfig = await api.updateHomepageConfig(config);
        setHomepageConfig(updatedConfig);
        addToast('Homepage updated successfully!', 'success');
    } catch (error) {
        console.error("Failed to update homepage config:", error);
        addToast('Failed to update homepage.', 'error');
    }
  };

  const handleAddCoupon = async (couponData: Coupon) => {
    try {
        const newCoupon = await api.addCoupon(couponData);
        setCoupons(prev => [newCoupon, ...prev].sort((a,b) => a.code.localeCompare(b.code)));
        addToast(`Coupon "${newCoupon.code}" created!`, 'success');
    } catch (error) {
        addToast((error as Error).message, 'error');
    }
  };
  
  const handleUpdateCoupon = async (couponData: Coupon) => {
    try {
        const updatedCoupon = await api.updateCoupon(couponData);
        setCoupons(prev => prev.map(c => c.code === updatedCoupon.code ? updatedCoupon : c));
        addToast(`Coupon "${updatedCoupon.code}" updated!`, 'success');
    } catch (error) {
        addToast((error as Error).message, 'error');
    }
  };

  const handleDeleteCoupon = async (couponCode: string) => {
    try {
        await api.deleteCoupon(couponCode);
        setCoupons(prev => prev.filter(c => c.code !== couponCode));
        addToast(`Coupon "${couponCode}" deleted!`, 'success');
    } catch (error) {
        addToast((error as Error).message, 'error');
    }
  };
  
  const handleUpdateStore = async (storeData: Store) => {
    try {
      const updatedStore = await api.updateStore(storeData);
      setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
      addToast("Settings saved successfully!", "success");
    } catch (error) {
      addToast("Could not save settings.", "error");
    }
  };
  
  const handleAddPayout = async (storeId: number, payoutData: Omit<Payout, 'payoutId'>) => {
    try {
        const updatedStore = await api.addPayout(storeId, payoutData);
        setStores(prev => prev.map(s => s.id === updatedStore.id ? updatedStore : s));
        addToast(`Payout of ₹${payoutData.amount} marked as paid.`, 'success');
    } catch (error) {
        addToast("Failed to record payout.", "error");
    }
  };

  const handleRequestReturn = async (orderId: string, variantId: string, reason: string) => {
    try {
        const updatedOrder = await api.requestReturn(orderId, variantId, reason);
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setAllOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        addToast("Return requested successfully.", "success");
    } catch (error) {
        addToast("Could not request return.", "error");
    }
  };

  const handleUpdateReturnStatus = async (orderId: string, variantId: string, status: 'approved' | 'rejected') => {
    try {
        const updatedOrder = await api.updateReturnStatus(orderId, variantId, status);
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        setAllOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
        addToast(`Return status for item in order #${orderId} has been updated.`, "success");
    } catch (error) {
        addToast("Could not update return status.", "error");
    }
  };


  // URL Hash Routing
  React.useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (target.closest('button') && anchor) {
        e.preventDefault();
        return;
      }
      
      if (anchor && anchor.href.includes('#/')) {
        e.preventDefault();
        window.location.hash = anchor.href.substring(anchor.href.indexOf('#'));
      }
    };
    
    document.addEventListener('click', handleLinkClick);

    const handleHashChange = () => {
      window.scrollTo(0, 0);
      const hash = window.location.hash.replace('#/', '');
      const [path, param] = hash.split('/');

      if (path === 'product' && param) {
        setSelectedProductId(parseInt(param, 10));
        setPage('product');
      } else if (path === 'shop') {
          if (param) {
              setSelectedCategory(param as ProductCategory);
          } else {
              setSelectedCategory(null);
          }
          setPage('shop');
          setSelectedProductId(null);
          setAppState('browsing');
      } else if (['home', 'cart', 'account', 'wishlist', 'contact', 'faq', 'shipping', 'security-guide', 'repair', 'terms', 'privacy', 'returns', 'blog', 'find-store', 'coupons', 'admin', 'seller', 'why-dev-mobile', 'track-order', 'invoice', 'payment-gateway', 'payment-success'].includes(path)) {
        setPage(path as Page);
        setSelectedProductId(null);
        if (path !== 'shop') {
            setSelectedCategory(null);
        }
      } else {
        setPage('home');
        setSelectedProductId(null);
        setSelectedCategory(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => {
      document.removeEventListener('click', handleLinkClick);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);
  
  // Page Transition Effect
  React.useEffect(() => {
    setPageVisible(false);
    const timer = setTimeout(() => setPageVisible(true), 150);
    return () => clearTimeout(timer);
  }, [page, selectedProductId, appState, selectedCategory]);

  // Dynamic SEO Tags
  React.useEffect(() => {
    let title = 'DEV MOBILE - Latest Smartphones & Accessories';
    let description = 'Your one-stop shop for the latest smartphones, smartwatches, and accessories. Get the best deals on top brands like Apple, Samsung, Google, and more.';

    if (page === 'product' && selectedProduct) {
      title = `${selectedProduct.name} | DEV MOBILE`;
      description = selectedProduct.description;
    } else if (page === 'shop' && selectedCategory) {
      title = `${selectedCategory} | Shop at DEV MOBILE`;
      description = `Explore our collection of the latest ${selectedCategory.toLowerCase()} from top brands. Find the best deals and offers at DEV MOBILE.`;
    } else if (page === 'shop') {
      title = 'Shop All Products | DEV MOBILE';
      description = 'Browse our wide range of smartphones, smartwatches, and accessories. Compare prices, check reviews, and find your perfect device.';
    }
    
    document.title = title;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description.substring(0, 160)); // Limit description length
  }, [page, selectedProduct, selectedCategory]);


  // Update recently viewed
  React.useEffect(() => {
    if (selectedProductId) {
      setRecentlyViewedIds(prev => {
        const newIds = [selectedProductId, ...prev.filter(id => id !== selectedProductId)];
        return newIds.slice(0, 10); // Keep last 10
      });
    }
  }, [selectedProductId]);
  
  const handleNotifyMe = React.useCallback((productId: number) => {
    if (!currentUser) {
        addToast("Please log in to receive notifications.", "error");
        setAuthModalOpen(true);
        return;
    }
    setNotificationList(prev => {
        if (prev.includes(productId)) {
            return prev;
        }
        return [...prev, productId];
    });
    addToast("You'll be notified when it's back in stock!", "success");
  }, [currentUser, addToast]);
  
  const handleWatchPrice = React.useCallback((productId: number) => {
    // ... same as before
  }, [currentUser, addToast]);
  
  // Calculations & Filtering for Shop Page (Variants)
  const filteredDisplayableProducts = React.useMemo(() => {
    let productsToProcess = displayableProducts;

    // 1. Filter by brand, price, stock, category
    productsToProcess = productsToProcess
      .filter(dp => !selectedCategory || dp.product.category === selectedCategory)
      .filter(dp => selectedBrand === 'All' || dp.brand === selectedBrand)
      .filter(dp => priceLimit === 0 || dp.price <= priceLimit)
      .filter(dp => !showInStockOnly || dp.inStock);

    // 2. If there is a search query, calculate scores and filter/sort by relevance
    if (debouncedSearchQuery.trim()) {
        const queryLower = debouncedSearchQuery.toLowerCase();

        const calculateSearchScore = (product: DisplayableProduct): number => {
            const name = product.product.name.toLowerCase();
            const description = product.product.description.toLowerCase();
            const specs = Object.values(product.product.specifications).join(' ').toLowerCase();
            const brand = product.product.brand.toLowerCase();
            const category = product.product.category.toLowerCase();
            
            let score = 0;

            // 1. Full phrase matches
            if (name.includes(queryLower)) {
                // Higher score if it's a prefix match, indicating user is typing it out
                if (name.startsWith(queryLower)) {
                    score += 50;
                } else {
                    score += 25;
                }
            }

            const queryTokens = queryLower.split(' ').filter(t => t.length > 1);
            const matchedTokens = new Set();

            // 2. Token-based matching
            for (const token of queryTokens) {
                let tokenMatched = false;

                // Higher score for matches in more important fields
                const fieldsToSearch = [
                    { field: name, weight: 15 },
                    { field: brand, weight: 10 },
                    { field: category, weight: 10 },
                    { field: specs, weight: 5 },
                    { field: description, weight: 2 }
                ];

                for (const { field, weight } of fieldsToSearch) {
                    if (field.includes(token)) {
                        score += weight;
                        tokenMatched = true;
                    }
                }
                
                // 3. Fuzzy matching on name as a fallback
                if (!tokenMatched) {
                    const nameTokens = name.split(' ');
                    for (const nameToken of nameTokens) {
                        const distance = levenshteinDistance(token, nameToken);
                        // Allow 1 mistake for short words, 2 for longer.
                        const threshold = token.length > 5 ? 2 : 1;
                        if (distance > 0 && distance <= threshold) {
                            score += 5; // Lower score for fuzzy match
                            tokenMatched = true;
                            break; 
                        }
                    }
                }
                
                if(tokenMatched) {
                    matchedTokens.add(token);
                }
            }
            
            // 4. Boost for matching multiple tokens
            if (matchedTokens.size > 1) {
                score += matchedTokens.size * 10;
            }

            return score;
        };

        return productsToProcess
            .map(dp => ({ ...dp, score: calculateSearchScore(dp) }))
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score);
    }
    
    // 3. If no search query, sort by user's choice
    return productsToProcess.sort((a, b) => {
        switch (sortOption) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'newest': return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
          case 'rating-desc':
          default:
            return b.rating - a.rating;
        }
      });
  }, [displayableProducts, debouncedSearchQuery, selectedBrand, priceLimit, showInStockOnly, sortOption, selectedCategory]);

  const totalPages = Math.ceil(filteredDisplayableProducts.length / PRODUCTS_PER_PAGE);
  const paginatedDisplayableProducts = filteredDisplayableProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
  
  const recentlyViewedProducts = React.useMemo(() => {
    return recentlyViewedIds.map(id => products.find(p => p.id === id)).filter((p): p is Product => p !== undefined);
  }, [recentlyViewedIds, products]);

  const compareProducts = React.useMemo(() => {
    return compareList.map(id => products.find(p => p.id === id)).filter((p): p is Product => p !== undefined && p.approvalStatus === 'approved');
  }, [compareList, products]);


  // Breadcrumbs logic
  const breadcrumbs = React.useMemo<Breadcrumb[]>(() => {
    const homeCrumb: Breadcrumb = { name: 'Home', href: '#/home', isCurrent: false };
    const shopCrumb: Breadcrumb = { name: 'Shop', href: '#/shop', isCurrent: false };
    
    switch(page) {
      case 'shop':
        if (selectedCategory) {
            return [homeCrumb, shopCrumb, { name: selectedCategory, href: `#/shop/${selectedCategory}`, isCurrent: true }];
        }
        return [homeCrumb, { ...shopCrumb, isCurrent: true }];
      case 'product':
        const categoryCrumb = selectedProduct ? { name: selectedProduct.category, href: `#/shop/${selectedProduct.category}`, isCurrent: false } : shopCrumb;
        return selectedProduct ? [homeCrumb, categoryCrumb, { name: selectedProduct.name, href: `#/product/${selectedProduct.id}`, isCurrent: true }] : [homeCrumb, { ...shopCrumb, isCurrent: true }];
      case 'cart':
        return [homeCrumb, { name: 'Your Cart', href: '#/cart', isCurrent: true }];
      case 'wishlist':
        return [homeCrumb, { name: 'Wishlist', href: '#/wishlist', isCurrent: true }];
      case 'account':
        return [homeCrumb, { name: 'My Account', href: '#/account', isCurrent: true }];
      case 'repair':
        return [homeCrumb, { name: 'Repair Services', href: '#/repair', isCurrent: true }];
      case 'terms':
        return [homeCrumb, { name: 'Terms and Conditions', href: '#/terms', isCurrent: true }];
      case 'privacy':
        return [homeCrumb, { name: 'Privacy Policy', href: '#/privacy', isCurrent: true }];
      case 'returns':
        return [homeCrumb, { name: 'Returns and Refunds', href: '#/returns', isCurrent: true }];
      case 'blog':
        return [homeCrumb, { name: 'Blog', href: '#/blog', isCurrent: true }];
      case 'find-store':
        return [homeCrumb, { name: 'Find A Store', href: '#/find-store', isCurrent: true }];
      case 'coupons':
        return [homeCrumb, { name: 'Coupons', href: '#/coupons', isCurrent: true }];
      case 'admin':
        return [homeCrumb, { name: 'Admin Panel', href: '#/admin', isCurrent: true }];
      case 'seller':
        return [homeCrumb, { name: 'Seller Panel', href: '#/seller', isCurrent: true }];
      case 'why-dev-mobile':
        return [homeCrumb, { name: 'Why Dev Mobile', href: '#/why-dev-mobile', isCurrent: true }];
      case 'track-order':
        return [homeCrumb, { name: 'Track Your Order', href: '#/track-order', isCurrent: true }];
      default:
        return [{...homeCrumb, isCurrent: true}];
    }
  }, [page, selectedProduct, selectedCategory]);

  // Preloader
  React.useEffect(() => {
    const preloader = document.getElementById('preloader');
    if (!isDataLoading && preloader) {
      preloader.classList.add('fade-out');
    }
  }, [isDataLoading]);


  const renderContent = () => {
    if (appState === 'confirmed') {
      if (page === 'payment-success' && orderInfo) {
        return <OrderConfirmation order={orderInfo} currentUser={currentUser} onReturnToShop={() => { setAppState('browsing'); setPage('shop'); }} />;
      }
    }
      
    if (appState === 'checkout') {
      return <Checkout 
                cartItems={cartItems} 
                subtotal={cartSubtotal}
                shippingCost={shippingCost}
                onPlaceOrder={handlePlaceOrder}
                onCancel={() => setAppState('browsing')}
                addToast={addToast}
                userPinCode={userPinCode}
                onPinCodeChange={handleSetPinCode}
                stores={stores}
                currentUser={currentUser}
                coupons={coupons}
                userLocation={userLocation}
             />;
    }

    if (isProductsLoading && page !== 'home') {
      return (
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
         </div>
      );
    }

    const renderPage = () => {
      switch (page) {
        case 'home':
          return homepageConfig ? <HomePage homepageConfig={homepageConfig} allProducts={displayableProducts} brands={brands} onBrandSelect={handleBrandSelect} onToggleLike={handleToggleLike} likedItems={likedItems} recentlyViewedProducts={recentlyViewedProducts} recommendedProducts={recommendedProducts} isRecommendationsLoading={isRecommendationsLoading} onNotifyMe={handleNotifyMe} notificationList={notificationList} compareList={compareList} onToggleCompare={handleToggleCompare} onAddToCart={handleAddToCart} /> : <div>Loading homepage...</div>;
        case 'shop':
          return (
            <>
              <FilterControls brands={brands} selectedBrand={selectedBrand} onBrandSelect={handleBrandSelect} maxPrice={maxPrice} priceLimit={priceLimit} onPriceChange={handlePriceChange} showInStockOnly={showInStockOnly} onInStockOnlyChange={handleInStockChange} />
              <div className="flex justify-end mb-4"><SortDropdown sortOption={sortOption} onSortChange={handleSortChange} /></div>
              <ProductList products={paginatedDisplayableProducts} onToggleLike={handleToggleLike} likedItems={likedItems} searchQuery={searchQuery} onNotifyMe={handleNotifyMe} notificationList={notificationList} compareList={compareList} onToggleCompare={handleToggleCompare} onAddToCart={handleAddToCart} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          );
        case 'product':
          return selectedProduct ? <ProductDetail product={selectedProduct} onAddToCart={handleAddToCart} relatedProducts={products.slice(0, 4)} onToggleLike={handleToggleLike} likedItems={likedItems} currentUser={currentUser} onAddReview={handleAddReview} addToast={addToast} userPinCode={userPinCode} onPinCodeChange={handleSetPinCode} onNotifyMe={handleNotifyMe} notificationList={notificationList} onWatchPrice={handleWatchPrice} priceWatchList={priceWatchList} compareList={compareList} onToggleCompare={handleToggleCompare} /> : <div>Product not found</div>;
        case 'cart':
            return cartItems.length > 0 ? (
                <Cart cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} onUpdateQuantity={handleUpdateQuantity} onCheckout={() => setAppState('checkout')} subtotal={cartSubtotal} shipping={shippingCost} total={cartTotal} userPinCode={userPinCode} />
            ) : (
                 <div className="text-center bg-white p-12 rounded-lg shadow-md border border-gray-200">
                    <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-600">Looks like you haven't added anything to your cart yet. Let's find something for you!</p>
                </div>
            );
        case 'account':
            return currentUser ? <AccountPage user={currentUser} orders={orders} isLoading={false} onTrackOrder={setTrackingOrder} onUpdateUser={handleUpdateUser} onLogout={handleLogout} addToast={addToast} onRequestReturn={handleRequestReturn} /> : <Auth onAuthSuccess={handleAuthSuccess} onSignup={handleSignup} onClose={() => {}} />;
        case 'wishlist':
            return <WishlistPage products={products} likedItems={likedItems} onToggleLike={handleToggleLike} onNotifyMe={handleNotifyMe} notificationList={notificationList} compareList={compareList} onToggleCompare={handleToggleCompare} />;
        case 'contact':
            return <ContactPage />;
        case 'faq':
            return <FaqPage />;
        case 'shipping':
            return <ShippingPage />;
        case 'security-guide':
            return <SecurityGuide />;
        case 'repair':
            return <RepairPage />;
        case 'terms':
            return <TermsPage />;
        case 'privacy':
            return <PrivacyPage />;
        case 'returns':
            return <ReturnsPage />;
        case 'blog':
            return <BlogPage />;
        case 'find-store':
            return <FindStorePage stores={stores}/>;
        case 'coupons':
            return <CouponsPage />;
        case 'admin':
            if (currentUser && currentUser.role === 'admin') {
                const adminUser = currentUser as User & { role: 'admin' };
                return <AdminPage
                    currentUser={adminUser}
                    products={products}
                    allOrders={allOrders}
                    allUsers={allUsers}
                    allStores={stores}
                    onUpdateOrder={handleUpdateOrder}
                    onAddProduct={handleAddNewProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    homepageConfig={homepageConfig}
                    onUpdateHomepageConfig={handleUpdateHomepageConfig}
                    coupons={coupons}
                    onAddCoupon={handleAddCoupon}
                    onUpdateCoupon={handleUpdateCoupon}
                    onDeleteCoupon={handleDeleteCoupon}
                    addToast={addToast}
                    onUpdateReturnStatus={handleUpdateReturnStatus}
                />;
            }
            return <AccessDenied />;
        case 'seller':
            if (!currentUser) {
                return <AccessDenied />;
            }
            if (currentUser.role !== 'seller') {
                return <AccessDenied />;
            }
            if (!currentUser.storeId) {
                return (
                    <div className="text-center bg-white p-12 rounded-lg shadow-md border border-gray-200">
                        <h2 className="text-2xl font-bold mb-2">Account Not Configured</h2>
                        <p className="text-gray-500">Your seller account is not yet assigned to a store. Please contact the administrator.</p>
                    </div>
                );
            }
            const sellerUser = currentUser as User & { role: 'seller'; storeId: number };
            const sellerStoreId = sellerUser.storeId;
            return <SellerPage
                currentUser={sellerUser}
                products={products.filter(p => p.sellerId === sellerStoreId)}
                allOrders={allOrders.filter(o => o.fulfilledByStoreId === sellerStoreId)}
                allStores={stores.filter(s => s.id === sellerStoreId)}
                onUpdateOrder={handleUpdateOrder}
                onAddProduct={handleAddNewProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                addToast={addToast}
                onUpdateStore={handleUpdateStore}
                onAddPayout={handleAddPayout}
            />;
        case 'why-dev-mobile':
            return <WhyDevMobilePage />;
        case 'track-order':
            return <TrackOrderPage allOrders={allOrders} allUsers={allUsers} />;
        default:
          return <div>Page not found</div>;
      }
    };
    
    // FIX: Added a return statement to call `renderPage()`. The function had a path where it would define `renderPage` but not return its result, causing the component to return `undefined` and crash.
    return renderPage();
  };

  // Handle full-page routes that don't need the main layout
  if (page === 'invoice') {
    return <InvoicePage />;
  }
  if (page === 'payment-gateway') {
    return <CustomPaymentPage onPaymentSubmit={handlePaymentProofSubmit} />;
  }

  return (
    <>
      <Header 
        cartCount={cartItems.length}
        likedCount={likedItems.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        onAuthClick={() => setAuthModalOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        recentSearches={recentSearches}
        allProducts={products}
        animateCartIcon={animateCartIcon}
        animateLikedIcon={animateLikedIcon}
        userPinCode={userPinCode}
        onLocationClick={() => setPinCodeModalOpen(true)}
        notifications={notifications}
        onMarkNotificationsAsRead={handleMarkNotificationsAsRead}
        selectedCategory={selectedCategory}
      />
      
      <main className={`container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8 page-transition ${isPageVisible ? 'page-visible' : 'page-hidden'}`}>
         <Breadcrumbs crumbs={breadcrumbs} />
         <div className={page !== 'home' ? 'mt-6' : ''}>
           {renderContent()}
         </div>
      </main>
      
      <Footer currentUser={currentUser} />

      <ToastContainer toasts={toasts} />
      {isAuthModalOpen && <Auth onAuthSuccess={handleAuthSuccess} onSignup={handleSignup} onClose={() => setAuthModalOpen(false)} />}
      {isPinCodeModalOpen && <PinCodeModal onClose={() => setPinCodeModalOpen(false)} onSetPinCode={handleSetPinCode} />}
      {flyingImage && (
          <img 
              src={flyingImage.src} 
              className="fly-to-cart fixed z-50 rounded-lg"
              style={{
                  top: flyingImage.top,
                  left: flyingImage.left,
                  width: flyingImage.width,
                  height: flyingImage.height,
              }}
              alt=""
          />
      )}
      <ChatButton onClick={() => setChatOpen(prev => !prev)} />
      <Chatbot isOpen={isChatOpen} onClose={() => setChatOpen(false)} messages={chatMessages} onSubmit={handleChatSubmit} isLoading={isChatbotLoading} />
      {trackingOrder && <OrderTrackingModal order={trackingOrder} onClose={() => setTrackingOrder(null)} />}
      {compareList.length > 0 && <CompareTray products={compareProducts} onCompare={() => setCompareModalOpen(true)} onClear={handleClearCompare} onRemove={handleToggleCompare} />}
      {isCompareModalOpen && <CompareModal products={compareProducts} onClose={() => setCompareModalOpen(false)} onAddToCart={handleAddToCart} onToggleLike={handleToggleLike} likedItems={likedItems} />}
      {showNotificationPrompt && (
          <div className="fixed bottom-6 left-6 bg-white p-4 rounded-lg shadow-lg animate-slide-in-up z-40">
              <p className="font-semibold mb-2">Stay Updated!</p>
              <p className="text-sm text-gray-600 mb-3">Enable notifications to get the latest deals.</p>
              <div className="flex gap-2">
                  <button onClick={handleRequestNotificationPermission} className="bg-blue-600 text-white px-3 py-1 text-sm rounded-md">Enable</button>
                  <button onClick={() => setShowNotificationPrompt(false)} className="bg-gray-200 px-3 py-1 text-sm rounded-md">Later</button>
              </div>
          </div>
      )}
    </>
  );
}

export default App;