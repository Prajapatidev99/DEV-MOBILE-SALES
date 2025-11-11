

    import type { Product, User, CartItem, Order, Review, Store, ProductVariant, HomepageConfig, Address, Coupon, Payout, PromoBannerConfig } from './types';

    // --- LOCALSTORAGE KEYS ---
    const DB_VERSION = 'v2';
    const KEYS = {
        PRODUCTS: `devmobile_products_${DB_VERSION}`,
        USERS: `devmobile_users_${DB_VERSION}`,
        STORES: `devmobile_stores_${DB_VERSION}`,
        CARTS: `devmobile_carts_${DB_VERSION}`,
        WISHLISTS: `devmobile_wishlists_${DB_VERSION}`,
        ORDERS: `devmobile_orders_${DB_VERSION}`,
        SESSION: `devmobile_session_${DB_VERSION}`,
        PINCODE: `devmobile_pincode_${DB_VERSION}`,
        HOMEPAGE_CONFIG: `devmobile_homepage_config_${DB_VERSION}`,
        COUPONS: `devmobile_coupons_${DB_VERSION}`,
        REVIEW_REMINDERS_SENT: `devmobile_review_reminders_sent_${DB_VERSION}`,
    };

    // --- HELPER FUNCTIONS ---
    const get = <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') {
            return defaultValue;
        }
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    };

    const set = (key: string, value: any) => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Failed to set item '${key}' in localStorage:`, error);
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                throw error;
            }
        }
    };

    // Simulate network delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // --- INDEXEDDB IMAGE STORE ---
    const DB_NAME = `devmobile_image_db_${DB_VERSION}`;
    const IMAGE_STORE_NAME = 'images';
    let dbPromise: Promise<IDBDatabase> | null = null;

    const getDb = (): Promise<IDBDatabase> => {
        if (!dbPromise) {
            dbPromise = new Promise((resolve, reject) => {
                if (typeof indexedDB === 'undefined') {
                    return reject(new Error('IndexedDB is not supported.'));
                }
                const request = indexedDB.open(DB_NAME, 1);
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
                request.onupgradeneeded = (event) => {
                    const db = (event.target as IDBOpenDBRequest).result;
                    if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
                        db.createObjectStore(IMAGE_STORE_NAME);
                    }
                };
            });
        }
        return dbPromise;
    };

    export const saveImageToDb = async (blob: Blob): Promise<string> => {
        const db = await getDb();
        const key = `img-${Date.now()}-${Math.random()}`;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(IMAGE_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(IMAGE_STORE_NAME);
            const request = store.put(blob, key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(key);
        });
    };

    export const getImageFromDb = async (key: string): Promise<Blob | null> => {
        const db = await getDb();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(IMAGE_STORE_NAME, 'readonly');
            const store = transaction.objectStore(IMAGE_STORE_NAME);
            const request = store.get(key);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result || null);
        });
    };


    // --- SAMPLE DATA (for seeding) ---
    const minimalPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const placeholderImg = minimalPlaceholder;
    const generatePlaceholder = (color: string, text: string) => minimalPlaceholder;
    const placeholderBanner = minimalPlaceholder;
    const placeholderPromo = minimalPlaceholder;


    const sampleProducts: Product[] = [
    { 
        id: 1, name: 'Apple iPhone 15', category: 'Smartphones',
        imageUrls: [generatePlaceholder('#f5c6d0', 'iPhone 15 Pink'), generatePlaceholder('#a0c8ff', 'iPhone 15 Blue'), generatePlaceholder('#2c2c2c', 'iPhone 15 Black')], 
        rating: 4.8, description: 'The latest iPhone with a stunning new camera and the powerful A16 Bionic chip.', brand: 'Apple', 
        specifications: { display: '6.1" Super Retina XDR', camera: '48MP Main', processor: 'A16 Bionic', battery: '3349mAh' },
        reviews: [{ id: 1, author: 'Priya S.', rating: 5, comment: 'Amazing camera and performance!', date: '2023-10-15' }],
        dateAdded: '2023-10-01',
        approvalStatus: 'approved',
        variants: [
            { id: '1-pink-128', sellerPrice: 58900, price: 59900, originalPrice: 65900, costPrice: 48000, attributes: { Color: 'Pink', Storage: '128GB', RAM: '6GB' }, colorCode: '#F5C6D0', imageUrl: generatePlaceholder('#f5c6d0', 'iPhone 15 Pink'), inventory: [{ storeId: 1, quantity: 10 }], discountLabel: 'Special Offer' },
            { id: '1-pink-256', sellerPrice: 68900, price: 69900, originalPrice: 75900, costPrice: 56500, attributes: { Color: 'Pink', Storage: '256GB', RAM: '6GB' }, colorCode: '#F5C6D0', imageUrl: generatePlaceholder('#f5c6d0', 'iPhone 15 Pink'), inventory: [{ storeId: 1, quantity: 10 }], discountLabel: 'Special Offer' },
            { id: '1-blue-128', sellerPrice: 58900, price: 59900, originalPrice: 65900, costPrice: 48000, attributes: { Color: 'Blue', Storage: '128GB', RAM: '6GB' }, colorCode: '#A0C8FF', imageUrl: generatePlaceholder('#a0c8ff', 'iPhone 15 Blue'), inventory: [{ storeId: 1, quantity: 10 }], discountLabel: 'Special Offer' },
            { id: '1-blue-256', sellerPrice: 68900, price: 69900, originalPrice: 75900, costPrice: 56500, attributes: { Color: 'Blue', Storage: '256GB', RAM: '6GB' }, colorCode: '#A0C8FF', imageUrl: generatePlaceholder('#a0c8ff', 'iPhone 15 Blue'), inventory: [] },
            { id: '1-black-512', sellerPrice: 88900, price: 89900, originalPrice: 95900, costPrice: 72000, attributes: { Color: 'Black', Storage: '512GB', RAM: '6GB' }, colorCode: '#2c2c2c', imageUrl: generatePlaceholder('#2c2c2c', 'iPhone 15 Black'), inventory: [{ storeId: 1, quantity: 10 }] },
        ]
    },
    { 
        id: 2, name: 'Samsung Galaxy S24 Ultra', category: 'Smartphones',
        imageUrls: [generatePlaceholder('#333', 'Galaxy S24 Ultra')], rating: 4.9, description: 'Experience the new era of mobile AI with Galaxy S24 Ultra.', brand: 'Samsung',
        specifications: { display: '6.8" Dynamic AMOLED 2X', camera: '200MP Wide', processor: 'Snapdragon 8 Gen 3', battery: '5000mAh' },
        reviews: [{ id: 2, author: 'Rohan K.', rating: 5, comment: 'The zoom camera is mind-blowing!', date: '2024-01-20' }],
        dateAdded: '2024-01-15',
        approvalStatus: 'approved',
        variants: [
            { id: '2-grey-256', sellerPrice: 128499, price: 129999, originalPrice: 134999, costPrice: 115000, attributes: { Color: 'Titanium Gray', Storage: '256GB', RAM: '12GB' }, colorCode: '#848482', inventory: [{ storeId: 1, quantity: 10 }] },
            { id: '2-grey-512', sellerPrice: 138499, price: 139999, originalPrice: 144999, costPrice: 124000, attributes: { Color: 'Titanium Gray', Storage: '512GB', RAM: '12GB' }, colorCode: '#848482', inventory: [{ storeId: 1, quantity: 10 }] },
            { id: '2-black-256', sellerPrice: 128499, price: 129999, originalPrice: 134999, costPrice: 115000, attributes: { Color: 'Titanium Black', Storage: '256GB', RAM: '12GB' }, colorCode: '#3C3B3B', inventory: [{ storeId: 1, quantity: 10 }] }
        ]
    },
    { 
        id: 3, name: 'Google Pixel 8 Pro', category: 'Smartphones',
        imageUrls: [generatePlaceholder('#d3d3d3', 'Pixel 8 Pro')], rating: 4.7, description: 'The power of Google AI, in your hand.', brand: 'Google',
        specifications: { display: '6.7" Super Actua LTPO OLED', camera: '50MP Octa-PD', processor: 'Google Tensor G3', battery: '5050mAh' },
        reviews: [],
        dateAdded: '2023-11-05',
        approvalStatus: 'approved',
        variants: [
            { id: '3-obsidian-128', sellerPrice: 88999, price: 89999, costPrice: 80000, attributes: { Color: 'Obsidian', Storage: '128GB', RAM: '12GB' }, colorCode: '#1C1C1E', inventory: [{ storeId: 1, quantity: 10 }] }
        ]
    },
    { 
        id: 4, name: 'Apple Watch Series 9', category: 'Smartwatches',
        imageUrls: [generatePlaceholder('#c0c0c0', 'Watch Series 9')], rating: 4.9, description: 'Smarter, brighter, and mightier. Featuring Double Tap, a magical new way to interact with Apple Watch.', brand: 'Apple',
        specifications: { display: 'Always-On Retina LTPO OLED', camera: 'N/A', processor: 'S9 SiP', battery: 'Up to 18 hours' },
        reviews: [],
        dateAdded: '2023-09-15',
        approvalStatus: 'approved',
        variants: [
            { id: '4-midnight-45', sellerPrice: 44000, price: 44900, costPrice: 40000, attributes: { Color: 'Midnight', Storage: '45mm' }, colorCode: '#1f2937', inventory: [{ storeId: 1, quantity: 10 }] }
        ]
    },
    { 
        id: 5, name: 'OnePlus 12', category: 'Smartphones',
        imageUrls: [generatePlaceholder('#90EE90', 'OnePlus 12')], rating: 4.7, description: 'Elite performance and an effortlessly smooth experience.', brand: 'OnePlus',
        specifications: { display: '6.82" 2K ProXDR Display', camera: '50MP Sony LYT-808', processor: 'Snapdragon 8 Gen 3', battery: '5400mAh' },
        reviews: [],
        dateAdded: '2024-02-01',
        approvalStatus: 'approved',
        variants: [
            { id: '5-green-256', sellerPrice: 64499, price: 64999, costPrice: 58000, attributes: { Color: 'Flowy Emerald', Storage: '256GB', RAM: '12GB' }, colorCode: '#90EE90', inventory: [{ storeId: 1, quantity: 10 }] }
        ]
    },
    {
        id: 6, name: 'Apple AirPods Pro (2nd Gen)', category: 'Accessories',
        imageUrls: [generatePlaceholder('#ffffff', 'AirPods Pro')], rating: 4.8, description: 'Richer audio quality, next-level Active Noise Cancellation and Adaptive Transparency.', brand: 'Apple',
        specifications: { display: 'N/A', camera: 'N/A', processor: 'H2 Chip', battery: 'Up to 6 hours listening time' },
        reviews: [],
        dateAdded: '2023-09-20',
        approvalStatus: 'approved',
        variants: [
            { id: '6-white-usbc', sellerPrice: 24000, price: 24900, costPrice: 22000, attributes: { Color: 'White', Storage: 'USB-C' }, colorCode: '#ffffff', inventory: [{ storeId: 1, quantity: 10 }] }
        ]
    },
    {
        id: 7, name: 'Samsung Galaxy Watch 6', category: 'Smartwatches',
        imageUrls: [generatePlaceholder('#2d2d2d', 'Watch 6')], rating: 4.6, description: 'The smart watch that knows you best. Start your everyday wellness journey.', brand: 'Samsung',
        specifications: { display: '1.5" Super AMOLED', camera: 'N/A', processor: 'Exynos W930', battery: 'Up to 40 hours' },
        reviews: [],
        dateAdded: '2023-08-10',
        approvalStatus: 'approved',
        variants: [
            { id: '7-graphite-44', sellerPrice: 33500, price: 33999, costPrice: 30000, attributes: { Color: 'Graphite', Storage: '44mm' }, colorCode: '#2d2d2d', inventory: [{ storeId: 1, quantity: 10 }] }
        ]
    },
    {
        id: 8, name: 'Xiaomi 14', category: 'Smartphones',
        imageUrls: [generatePlaceholder('#E0E0E0', 'Xiaomi 14')], rating: 4.5, description: 'Next-generation Leica optics, capturing authentic moments with incredible detail.', brand: 'Xiaomi',
        specifications: { display: '6.36" CrystalRes AMOLED', camera: '50MP Light Fusion 900', processor: 'Snapdragon 8 Gen 3', battery: '4610mAh' },
        reviews: [],
        dateAdded: '2024-03-01',
        sellerId: 2,
        approvalStatus: 'pending',
        variants: [
            { id: '8-white-256', sellerPrice: 69500, price: 69999, costPrice: 62000, attributes: { Color: 'White', Storage: '256GB', RAM: '12GB' }, colorCode: '#E0E0E0', inventory: [{ storeId: 2, quantity: 5 }] }
        ]
    }
    ];
    const sampleUsers: User[] = [
        { id: 1, name: 'Admin User', email: 'admin@example.com', password: 'password', role: 'admin' },
        { id: 2, name: 'Customer One', email: 'customer@example.com', mobile: '9876543210', password: 'password', dob: '1995-05-15', role: 'customer', marketingConsent: true, addresses: [
            { id: 101, fullName: 'Customer One', mobileNumber: '9876543210', pincode: '380015', addressLine1: 'A-101, Rose Apartments', addressLine2: 'Satellite Road', city: 'Ahmedabad', state: 'Gujarat', country: 'India', isDefault: true }
        ]},
        { id: 3, name: 'Dev Mobile Seller', email: 'seller@example.com', mobile: '9988776655', password: 'password', role: 'seller', storeId: 1 },
        { id: 4, name: 'Test Seller', email: 'testseller@example.com', mobile: '9999999999', password: 'password', role: 'seller', storeId: 2 },
    ];
    const sampleStores: Store[] = [
        { id: 1, name: 'Dev Mobile Satellite', address: 'Shreeji enclave complex, L-15, Ramdevnagar Rd, satellite, Ahmedabad, Gujarat 380015', latitude: 23.0399049, longitude: 72.5186593, paymentDetails: { upi: 'devmobile@axisbank' } },
        { id: 2, name: 'Test Store Maninagar', address: 'Maninagar, Ahmedabad, Gujarat', latitude: 23.0035, longitude: 72.6001 }
    ];
    const sampleHomepageConfig: HomepageConfig = {
        hero: { title: 'The Future Is Here. Get Yours Now.', imageUrl: placeholderBanner },
        promos: [
            { id: 1, title: 'Smartwatch Deals', subtitle: 'Up to 30% off', imageUrl: placeholderPromo, link: '#/shop/Smartwatches' },
            { id: 2, title: 'Audio Accessories', subtitle: 'Starting at ₹999', imageUrl: placeholderPromo, link: '#/shop/Accessories' },
            { id: 3, title: 'New Arrivals', subtitle: 'Shop the latest tech', imageUrl: placeholderPromo, link: '#/shop' },
        ]
    };
    const sampleCoupons: Coupon[] = [
        { code: 'WELCOME10', discountPercentage: 10, maxDiscount: 500, isActive: true },
        { code: 'SALE50', discountPercentage: 50, maxDiscount: 2000, expiryDate: '2024-12-31', isActive: true },
        { code: 'EXPIRED', discountPercentage: 20, isActive: false },
    ];

    export const seedDatabase = async () => {
        if (!get(KEYS.PRODUCTS, null)) set(KEYS.PRODUCTS, sampleProducts);
        if (!get(KEYS.USERS, null)) set(KEYS.USERS, sampleUsers);
        if (!get(KEYS.STORES, null)) set(KEYS.STORES, sampleStores);
        if (!get(KEYS.HOMEPAGE_CONFIG, null)) set(KEYS.HOMEPAGE_CONFIG, sampleHomepageConfig);
        if (!get(KEYS.COUPONS, null)) set(KEYS.COUPONS, sampleCoupons);
        if (!get(KEYS.ORDERS, null)) set(KEYS.ORDERS, []);
    };

    // --- Product APIs ---
    export const getProducts = async (): Promise<Product[]> => {
        await delay(200);
        const products = get<Product[]>(KEYS.PRODUCTS, []);

        // Sanitize image URLs to prevent 404s from broken external links
        const sanitizedProducts = products.map(product => {
            if (!product || !product.imageUrls) return product;

            const sanitizeUrl = (url: string | undefined): string | undefined => {
                if (url && (url.startsWith('http:') || url.startsWith('https:'))) {
                    // Found an external URL, which might be broken. Replace it with a placeholder.
                    return placeholderImg;
                }
                return url;
            };

            const newProduct = { ...product };
            newProduct.imageUrls = newProduct.imageUrls.map(url => sanitizeUrl(url) || placeholderImg);

            if (newProduct.variants) {
                newProduct.variants = newProduct.variants.map(variant => {
                    const newVariant = { ...variant };
                    newVariant.imageUrl = sanitizeUrl(newVariant.imageUrl);
                    return newVariant;
                });
            }
            return newProduct;
        });

        return sanitizedProducts;
    };
    export const getProductById = async (id: number): Promise<Product | undefined> => { await delay(100); const products = get<Product[]>(KEYS.PRODUCTS, []); return products.find(p => p.id === id); };
    export const addProduct = async (productData: Omit<Product, 'id' | 'reviews'>): Promise<Product> => {
        await delay(300);
        const products = get<Product[]>(KEYS.PRODUCTS, []);
        const newProduct: Product = { ...productData, id: Date.now(), reviews: [] };
        set(KEYS.PRODUCTS, [newProduct, ...products]);
        return newProduct;
    };
    export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
        await delay(300);
        let products = get<Product[]>(KEYS.PRODUCTS, []);
        products = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
        set(KEYS.PRODUCTS, products);
        return updatedProduct;
    };
    export const deleteProduct = async (productId: number): Promise<void> => {
        await delay(300);
        let products = get<Product[]>(KEYS.PRODUCTS, []);
        products = products.filter(p => p.id !== productId);
        set(KEYS.PRODUCTS, products);
    };

    // --- Store APIs ---
    export const getStores = async (): Promise<Store[]> => { await delay(100); return get(KEYS.STORES, []); };
    export const updateStore = async (updatedStore: Store): Promise<Store> => {
        await delay(200);
        let stores = get<Store[]>(KEYS.STORES, []);
        stores = stores.map(s => s.id === updatedStore.id ? updatedStore : s);
        set(KEYS.STORES, stores);
        return updatedStore;
    };
    export const addPayout = async (storeId: number, payoutData: Omit<Payout, 'payoutId'>): Promise<Store> => {
        await delay(200);
        let stores = get<Store[]>(KEYS.STORES, []);
        const storeIndex = stores.findIndex(s => s.id === storeId);
        if (storeIndex === -1) throw new Error("Store not found");
        const newPayout: Payout = { ...payoutData, payoutId: Date.now() };
        const updatedStore = { ...stores[storeIndex] };
        updatedStore.payouts = [...(updatedStore.payouts || []), newPayout];
        stores[storeIndex] = updatedStore;
        set(KEYS.STORES, stores);
        return updatedStore;
    }

    // --- Auth APIs ---
    export const getCurrentUser = async (): Promise<User | null> => { await delay(50); return get(KEYS.SESSION, null); };
    export const login = async (identifier: string, pass: string): Promise<User> => {
        await delay(500);
        const users = get<User[]>(KEYS.USERS, []);
        const user = users.find(u => (u.email === identifier || u.mobile === identifier) && u.password === pass);
        if (!user) throw new Error('Invalid credentials');
        return user;
    };
    export const finalizeLogin = (user: User) => {
        set(KEYS.SESSION, user);
    };
    export const logout = async () => { await delay(100); localStorage.removeItem(KEYS.SESSION); };
    export const signup = async (name: string, email: string, pass: string, mobile: string, marketingConsent: boolean): Promise<User> => {
        await delay(500);
        const users = get<User[]>(KEYS.USERS, []);
        if (users.some(u => u.email === email)) throw new Error('Email already exists');
        if (users.some(u => u.mobile === mobile)) throw new Error('Mobile number already exists');
        const newUser: User = { id: Date.now(), name, email, password: pass, mobile, marketingConsent, role: 'customer' };
        set(KEYS.USERS, [...users, newUser]);
        set(KEYS.SESSION, newUser);
        return newUser;
    };
    export const updateUser = async (updatedUserData: User): Promise<User> => {
        await delay(200);
        let users = get<User[]>(KEYS.USERS, []);
        users = users.map(u => u.id === updatedUserData.id ? updatedUserData : u);
        set(KEYS.USERS, users);
        const sessionUser = get<User | null>(KEYS.SESSION, null);
        if (sessionUser && sessionUser.id === updatedUserData.id) {
            set(KEYS.SESSION, updatedUserData);
        }
        return updatedUserData;
    };
    export const findUserByIdentifier = async (identifier: string): Promise<User> => {
        await delay(300);
        const users = get<User[]>(KEYS.USERS, []);
        const user = users.find(u => u.email === identifier || u.mobile === identifier);
        if (!user) throw new Error("Account not found.");
        return user;
    }
    export const updatePassword = async (identifier: string, newPass: string): Promise<void> => {
        await delay(300);
        let users = get<User[]>(KEYS.USERS, []);
        const userIndex = users.findIndex(u => u.email === identifier || u.mobile === identifier);
        if (userIndex === -1) throw new Error("Account not found.");
        users[userIndex].password = newPass;
        set(KEYS.USERS, users);
    };

    export const findOrCreateSocialUser = async (userData: Omit<User, 'id' | 'password'>): Promise<User> => {
        await delay(300);
        const users = get<User[]>(KEYS.USERS, []);
        let user = users.find(u => u.email === userData.email);

        if (user) {
            return user;
        }

        const newUser: User = {
            ...userData,
            id: Date.now(),
            password: '', // Social users don't have a password in this system
            role: 'customer',
        };
        set(KEYS.USERS, [...users, newUser]);
        return newUser;
    };


    // --- Cart APIs ---
    const getCarts = (): Record<number, CartItem[]> => get(KEYS.CARTS, {});
    export const getCart = async (userId: number): Promise<CartItem[]> => { await delay(100); const carts = getCarts(); return carts[userId] || []; };
    export const addToCart = async (userId: number, product: Product, variant: ProductVariant): Promise<CartItem[]> => {
        await delay(200);
        const carts = getCarts();
        const userCart = carts[userId] || [];
        const existingItemIndex = userCart.findIndex(item => item.variant.id === variant.id);
        if (existingItemIndex > -1) {
            userCart[existingItemIndex].quantity += 1;
        } else {
            userCart.push({ product, variant, quantity: 1, dateAdded: new Date().toISOString() });
        }
        carts[userId] = userCart;
        set(KEYS.CARTS, carts);
        return userCart;
    };
    export const removeFromCart = async (userId: number, variantId: string): Promise<CartItem[]> => {
        await delay(100);
        const carts = getCarts();
        let userCart = carts[userId] || [];
        userCart = userCart.filter(item => item.variant.id !== variantId);
        carts[userId] = userCart;
        set(KEYS.CARTS, carts);
        return userCart;
    };
    export const updateCartQuantity = async (userId: number, variantId: string, quantity: number): Promise<CartItem[]> => {
        await delay(100);
        const carts = getCarts();
        let userCart = carts[userId] || [];
        const itemIndex = userCart.findIndex(item => item.variant.id === variantId);
        if (itemIndex > -1) {
            userCart[itemIndex].quantity = quantity;
        }
        carts[userId] = userCart;
        set(KEYS.CARTS, carts);
        return userCart;
    };
    export const clearCart = async (userId: number): Promise<CartItem[]> => {
        await delay(100);
        const carts = getCarts();
        carts[userId] = [];
        set(KEYS.CARTS, carts);
        return [];
    };

    // --- Wishlist APIs ---
    const getWishlists = (): Record<number, number[]> => get(KEYS.WISHLISTS, {});
    export const getWishlist = async (userId: number): Promise<number[]> => { await delay(100); const wishlists = getWishlists(); return wishlists[userId] || []; };
    export const toggleWishlist = async (userId: number, productId: number): Promise<number[]> => {
        await delay(150);
        const wishlists = getWishlists();
        let userWishlist = wishlists[userId] || [];
        if (userWishlist.includes(productId)) {
            userWishlist = userWishlist.filter(id => id !== productId);
        } else {
            userWishlist.push(productId);
        }
        wishlists[userId] = userWishlist;
        set(KEYS.WISHLISTS, wishlists);
        return userWishlist;
    };

    // --- Order APIs ---

    // Helper to ensure orders data is always an array, preventing crashes from corrupted localStorage data.
    const getAndValidateOrdersArray = (): Order[] => {
        const orders = get<unknown>(KEYS.ORDERS, []);
        if (Array.isArray(orders)) {
            return orders as Order[];
        }
        console.warn('Corrupted order data found in localStorage. Resetting to empty array.');
        set(KEYS.ORDERS, []);
        return [];
    };


    export const getOrders = async (userId: number): Promise<Order[]> => { await delay(200); const allOrders = getAndValidateOrdersArray(); return allOrders.filter(o => o.userId === userId); };
    export const getAllOrders = async (): Promise<Order[]> => { await delay(200); return getAndValidateOrdersArray(); };
    export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
        await delay(500);
        const allOrders = getAndValidateOrdersArray();
        const newOrder: Order = { ...orderData, id: `DM${Date.now()}` };
        set(KEYS.ORDERS, [newOrder, ...allOrders]);
        return newOrder;
    };
    export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
        await delay(300);
        let allOrders = getAndValidateOrdersArray();
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) throw new Error("Order not found");
        const updatedOrder = { ...allOrders[orderIndex], ...updates };
        allOrders[orderIndex] = updatedOrder;
        set(KEYS.ORDERS, allOrders);
        return updatedOrder;
    };
    export const requestReturn = async (orderId: string, variantId: string, reason: string): Promise<Order> => {
        await delay(200);
        let allOrders = getAndValidateOrdersArray();
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) throw new Error("Order not found");
        const orderToUpdate = { ...allOrders[orderIndex] };
        const itemIndex = orderToUpdate.items.findIndex(i => i.variant.id === variantId);
        if (itemIndex === -1) throw new Error("Item not found in order");

        orderToUpdate.items[itemIndex].returnRequest = { status: 'pending', reason, date: new Date().toISOString() };
        orderToUpdate.status = 'Return Requested';

        allOrders[orderIndex] = orderToUpdate;
        set(KEYS.ORDERS, allOrders);
        return orderToUpdate;
    };

    export const updateReturnStatus = async (orderId: string, variantId: string, status: 'approved' | 'rejected'): Promise<Order> => {
        await delay(200);
        let allOrders = getAndValidateOrdersArray();
        const orderIndex = allOrders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) throw new Error("Order not found");

        const orderToUpdate = { ...allOrders[orderIndex] };
        const itemIndex = orderToUpdate.items.findIndex(i => i.variant.id === variantId);
        if (itemIndex === -1) throw new Error("Item not found in order");

        const itemToUpdate = { ...orderToUpdate.items[itemIndex] };
        if (!itemToUpdate.returnRequest) throw new Error("No return request found for this item");

        itemToUpdate.returnRequest = { ...itemToUpdate.returnRequest, status };
        orderToUpdate.items[itemIndex] = itemToUpdate;

        // Update the main order status as well
        orderToUpdate.status = status === 'approved' ? 'Refund Approved' : 'Return Rejected';

        allOrders[orderIndex] = orderToUpdate;
        set(KEYS.ORDERS, allOrders);
        return orderToUpdate;
    };


    // --- Other APIs ---
    export const addReview = async (productId: number, review: Review): Promise<Product> => {
        await delay(300);
        let products = get<Product[]>(KEYS.PRODUCTS, []);
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex === -1) throw new Error("Product not found");
        const updatedProduct = { ...products[productIndex] };
        updatedProduct.reviews = [review, ...updatedProduct.reviews];
        products[productIndex] = updatedProduct;
        set(KEYS.PRODUCTS, products);
        return updatedProduct;
    };

    export const getPinCode = (): string | null => get(KEYS.PINCODE, null);
    export const setPinCode = (pinCode: string) => set(KEYS.PINCODE, pinCode);

    export const getHomepageConfig = async (): Promise<HomepageConfig> => { await delay(100); return get(KEYS.HOMEPAGE_CONFIG, sampleHomepageConfig); };
    export const updateHomepageConfig = async (config: HomepageConfig): Promise<HomepageConfig> => { await delay(200); set(KEYS.HOMEPAGE_CONFIG, config); return config; };

    export const getCoupons = async (): Promise<Coupon[]> => { await delay(100); return get(KEYS.COUPONS, []); };
    export const addCoupon = async (coupon: Coupon): Promise<Coupon> => {
        await delay(200);
        const coupons = get<Coupon[]>(KEYS.COUPONS, []);
        if (coupons.some(c => c.code === coupon.code)) throw new Error("Coupon code already exists.");
        set(KEYS.COUPONS, [...coupons, coupon]);
        return coupon;
    };
    export const updateCoupon = async (coupon: Coupon): Promise<Coupon> => {
        await delay(200);
        let coupons = get<Coupon[]>(KEYS.COUPONS, []);
        coupons = coupons.map(c => c.code === coupon.code ? coupon : c);
        set(KEYS.COUPONS, coupons);
        return coupon;
    };
    export const deleteCoupon = async (code: string): Promise<void> => {
        await delay(200);
        let coupons = get<Coupon[]>(KEYS.COUPONS, []);
        coupons = coupons.filter(c => c.code !== code);
        set(KEYS.COUPONS, coupons);
    };
    
    export const getSentReviewReminders = (): string[] => get(KEYS.REVIEW_REMINDERS_SENT, []);

    export const addSentReviewReminder = (orderId: string) => {
        const sent = getSentReviewReminders();
        if (!sent.includes(orderId)) {
            set(KEYS.REVIEW_REMINDERS_SENT, [...sent, orderId]);
        }
    };


    // Admin only
    export const getAllUsers = async (): Promise<User[]> => { await delay(200); return get(KEYS.USERS, []); };

    export const sendTelegramAlert = async (order: Order, user: User | null) => {
        // This function sends order data to a secure, local backend server
        // which then sends the Telegram notification. This is the secure way to
        // handle secret API keys.
        const backendUrl = 'http://localhost:3001/api/send-telegram-alert';

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ order, user }),
            });

            if (response.ok) {
                console.log("✅ Successfully sent order data to the backend for Telegram alert.");
            } else {
                const errorData = await response.json();
                console.error("❌ Failed to send order data to the backend:", errorData.message);
                console.warn("Is your backend server running? Navigate to the 'backend' folder and run 'npm install' then 'npm start'.");
            }
        } catch (error) {
            console.error("❌ Network error: Could not connect to the backend server.", error);
            console.warn("Please ensure your backend server is running on http://localhost:3001. In a new terminal, navigate to the 'backend' folder, run 'npm install' and then 'npm start'.");
        }
    };