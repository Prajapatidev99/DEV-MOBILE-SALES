
// FIX: Updated imports to use lazy getters from './firebase' instead of static instances.
// This works in tandem with the changes in firebase.ts to delay initialization.
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    limit, 
    orderBy, 
    writeBatch
} from 'firebase/firestore';
// FIX: Use named imports for firebase/auth to avoid namespace import issues and improve tree-shaking
import { 
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    signInWithPopup,
    GoogleAuthProvider,
    FacebookAuthProvider,
    sendPasswordResetEmail
} from 'firebase/auth';

import { getFirebaseDb, getFirebaseAuth } from './firebase';
import type { Product, User, CartItem, Order, Review, Store, ProductVariant, HomepageConfig, Address, Coupon, Payout } from './types';

// --- CONSTANTS ---
// USE ENVIRONMENT VARIABLES FOR DEPLOYMENT
// FIX: Cast import.meta to any to resolve TypeScript error 'Property env does not exist on type ImportMeta'.
export const API_BASE_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3001';
const BACKEND_API_SECRET = (import.meta as any).env.VITE_BACKEND_API_SECRET || 'dev-secret';

// DEBUG: Check API URL in production
console.log('🔌 Connected to API:', API_BASE_URL);

// --- COLLECTION NAMES ---
const COLLECTIONS = {
    PRODUCTS: 'products',
    USERS: 'users',
    STORES: 'stores',
    CARTS: 'carts',
    WISHLISTS: 'wishlists',
    ORDERS: 'orders',
    CONFIG: 'config',
    COUPONS: 'coupons',
    METADATA: 'metadata',
};

// --- HELPER: Clean data for Firestore ---
// Firestore throws an error if a field is 'undefined'. This helper removes such fields.
// We return 'any' to bypass strict type checks in addDoc/setDoc which may complain about missing optional fields in the interface.
const cleanData = (data: any): any => {
    return JSON.parse(JSON.stringify(data));
};

// --- HELPER: Get User UID from numeric ID ---
const _getUidFromNumericId = async (userId: number): Promise<string | null> => {
    const usersRef = collection(getFirebaseDb(), COLLECTIONS.USERS);
    const q = query(usersRef, where("id", "==", userId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }
    return null;
};


const PRODUCT_IMAGE_IDS: { [key: string]: string } = {
    'Apple iPhone 15': 'dev-mobile/s24-ultra-gray_uleqnb',
    'Samsung Galaxy S24 Ultra': 'dev-mobile/s24-ultra-gray_uleqnb',
    'Google Pixel 8 Pro': 'dev-mobile/pixel-8-pro-obsidian_s8unyi',
    'Apple Watch Series 9': 'dev-mobile/apple-watch-9-midnight_jkp96k',
    'OnePlus 12': 'dev-mobile/oneplus-12-green_q1l0fz',
    'Apple AirPods Pro (2nd Gen)': 'dev-mobile/airpods-pro-2_stx8gq',
    'Samsung Galaxy Watch 6': 'dev-mobile/galaxy-watch-6-graphite_w8xutf',
    'Xiaomi 14': 'dev-mobile/xiaomi-14-white_z5bxl8',
};

const BANNER_IMAGE_IDS = {
    hero: 'hero_btit7z', // Matching the preloaded image from index.html
    promoSmartwatches: 'dev-mobile/promo-smartwatches_l3yqjb',
    promoAccessories: 'dev-mobile/promo-accessories_kpfywy',
    promoNewArrivals: 'dev-mobile/s24-ultra-gray_uleqnb',
};


// --- SAMPLE DATA (for seeding) ---
const sampleProducts: Omit<Product, 'id'>[] = [
    { name: 'Apple iPhone 15', category: 'Smartphones', imagePublicIds: [PRODUCT_IMAGE_IDS['Apple iPhone 15']], rating: 4.8, description: 'The latest iPhone with a stunning new camera and the powerful A16 Bionic chip.', brand: 'Apple', specifications: { display: '6.1" Super Retina XDR', camera: '48MP Main', processor: 'A16 Bionic', battery: '3349mAh' }, reviews: [], dateAdded: '2023-10-01', approvalStatus: 'approved',
        variants: [ { id: '1-pink-128', sellerPrice: 58900, price: 59900, originalPrice: 65900, attributes: { Color: 'Pink', Storage: '128GB', RAM: '6GB' }, colorCode: '#F5C6D0', inventory: [{ storeId: 1, quantity: 10 }], imagePublicId: PRODUCT_IMAGE_IDS['Apple iPhone 15'] } ]
    },
    { name: 'Samsung Galaxy S24 Ultra', category: 'Smartphones', imagePublicIds: [PRODUCT_IMAGE_IDS['Samsung Galaxy S24 Ultra']], rating: 4.9, description: 'Experience the new era of mobile AI with Galaxy S24 Ultra.', brand: 'Samsung', specifications: { display: '6.8" Dynamic AMOLED 2X', camera: '200MP Wide', processor: 'Snapdragon 8 Gen 3', battery: '5000mAh' }, reviews: [], dateAdded: '2024-01-15', approvalStatus: 'approved',
        variants: [ { id: '2-grey-256', sellerPrice: 128499, price: 129999, originalPrice: 134999, attributes: { Color: 'Titanium Gray', Storage: '256GB', RAM: '12GB' }, colorCode: '#848482', inventory: [{ storeId: 1, quantity: 10 }], imagePublicId: PRODUCT_IMAGE_IDS['Samsung Galaxy S24 Ultra'] } ]
    },
    { name: 'Google Pixel 8 Pro', category: 'Smartphones', imagePublicIds: [PRODUCT_IMAGE_IDS['Google Pixel 8 Pro']], rating: 4.7, description: 'The power of Google AI, in your hand.', brand: 'Google', specifications: { display: '6.7" Super Actua LTPO OLED', camera: '50MP Octa-PD', processor: 'Google Tensor G3', battery: '5050mAh' }, reviews: [], dateAdded: '2023-11-05', approvalStatus: 'approved',
        variants: [ { id: '3-obsidian-128', sellerPrice: 88999, price: 89999, attributes: { Color: 'Obsidian', Storage: '128GB', RAM: '12GB' }, colorCode: '#1C1C1E', inventory: [{ storeId: 1, quantity: 10 }], imagePublicId: PRODUCT_IMAGE_IDS['Google Pixel 8 Pro'] } ]
    },
    { name: 'Apple Watch Series 9', category: 'Smartwatches', imagePublicIds: [PRODUCT_IMAGE_IDS['Apple Watch Series 9']], rating: 4.9, description: 'Smarter, brighter, and mightier.', brand: 'Apple', specifications: { display: 'Always-On Retina LTPO OLED', camera: 'N/A', processor: 'S9 SiP', battery: 'Up to 18 hours' }, reviews: [], dateAdded: '2023-09-15', approvalStatus: 'approved',
        variants: [ { id: '4-midnight-45', sellerPrice: 44000, price: 44900, attributes: { Color: 'Midnight', Storage: '45mm' }, colorCode: '#1f2937', inventory: [{ storeId: 1, quantity: 10 }], imagePublicId: PRODUCT_IMAGE_IDS['Apple Watch Series 9'] } ]
    },
    { name: 'OnePlus 12', category: 'Smartphones', imagePublicIds: [PRODUCT_IMAGE_IDS['OnePlus 12']], rating: 4.7, description: 'Elite performance and an effortlessly smooth experience.', brand: 'OnePlus', specifications: { display: '6.82" 2K ProXDR Display', camera: '50MP Sony LYT-808', processor: 'Snapdragon 8 Gen 3', battery: '5400mAh' }, reviews: [], dateAdded: '2024-02-01', approvalStatus: 'approved',
        variants: [ { id: '5-green-256', sellerPrice: 64499, price: 64999, attributes: { Color: 'Flowy Emerald', Storage: '256GB', RAM: '12GB' }, colorCode: '#90EE90', inventory: [{ storeId: 1, quantity: 10 }], imagePublicId: PRODUCT_IMAGE_IDS['OnePlus 12'] } ]
    },
    { name: 'Apple AirPods Pro (2nd Gen)', category: 'Accessories', imagePublicIds: [PRODUCT_IMAGE_IDS['Apple AirPods Pro (2nd Gen)']], rating: 4.8, description: 'Richer audio quality, next-level Active Noise Cancellation.', brand: 'Apple', specifications: { display: 'N/A', camera: 'N/A', processor: 'H2 Chip', battery: 'Up to 6 hours' }, reviews: [], dateAdded: '2023-09-20', approvalStatus: 'approved',
        variants: [ { id: '6-white-usbc', sellerPrice: 24000, price: 24900, attributes: { Color: 'White', Storage: 'USB-C' }, colorCode: '#ffffff', inventory: [{ storeId: 1, quantity: 10 }], imagePublicId: PRODUCT_IMAGE_IDS['Apple AirPods Pro (2nd Gen)'] } ]
    },
    { name: 'Samsung Galaxy Watch 6', category: 'Smartwatches', imagePublicIds: [PRODUCT_IMAGE_IDS['Samsung Galaxy Watch 6']], rating: 4.6, description: 'The smart watch that knows you best.', brand: 'Samsung', specifications: { display: '1.5" Super AMOLED', camera: 'N/A', processor: 'Exynos W930', battery: 'Up to 40 hours' }, reviews: [], dateAdded: '2023-08-10', approvalStatus: 'approved',
        variants: [ { id: '7-graphite-44', sellerPrice: 33500, price: 33999, attributes: { Color: 'Graphite', Storage: '44mm' }, colorCode: '#2d2d2d', inventory: [{ storeId: 1, quantity: 10 }], imagePublicId: PRODUCT_IMAGE_IDS['Samsung Galaxy Watch 6'] } ]
    },
    { name: 'Xiaomi 14', category: 'Smartphones', imagePublicIds: [PRODUCT_IMAGE_IDS['Xiaomi 14']], rating: 4.5, description: 'Next-generation Leica optics.', brand: 'Xiaomi', specifications: { display: '6.36" CrystalRes AMOLED', camera: '50MP Light Fusion 900', processor: 'Snapdragon 8 Gen 3', battery: '4610mAh' }, reviews: [], dateAdded: '2024-03-01', sellerId: 2, approvalStatus: 'pending',
        variants: [ { id: '8-white-256', sellerPrice: 69500, price: 69999, attributes: { Color: 'White', Storage: '256GB', RAM: '12GB' }, colorCode: '#E0E0E0', inventory: [{ storeId: 2, quantity: 5 }], imagePublicId: PRODUCT_IMAGE_IDS['Xiaomi 14'] } ]
    },
    {
        name: 'Refurbished Apple iPhone 13',
        category: 'Refurbished Phones',
        imagePublicIds: [PRODUCT_IMAGE_IDS['Apple iPhone 15']], 
        rating: 4.7,
        description: 'Excellent condition refurbished iPhone 13. Comes with a one-year warranty and a brand new battery. Fully tested and certified.',
        brand: 'Apple',
        specifications: {
            display: '6.1" Super Retina XDR',
            camera: '12MP Dual-camera system',
            processor: 'A15 Bionic',
            battery: 'New Battery (100% health)'
        },
        reviews: [],
        dateAdded: '2024-04-15',
        approvalStatus: 'approved',
        variants: [{
            id: 'refurb-13-starlight-128',
            sellerPrice: 48000,
            price: 48999,
            originalPrice: 52900,
            attributes: { Color: 'Starlight', Storage: '128GB', RAM: '4GB' },
            colorCode: '#F8F7F2',
            inventory: [{ storeId: 1, quantity: 8 }],
            discountLabel: 'Like New'
        }]
    }
];

const sampleStores: Store[] = [
    { id: 1, name: 'Dev Mobile Satellite', address: 'Shreeji enclave complex, L-15, Ramdevnagar Rd, satellite, Ahmedabad, Gujarat 380015', latitude: 23.0399049, longitude: 72.5186593, paymentDetails: { upi: 'devmobile@axisbank' } },
    { id: 2, name: 'Test Store Maninagar', address: 'Maninagar, Ahmedabad, Gujarat', latitude: 23.0035, longitude: 72.6001 }
];
const sampleHomepageConfig: HomepageConfig = {
    hero: { title: 'The Future Is Here. Get Yours Now.', imagePublicId: BANNER_IMAGE_IDS.hero },
    promos: [
        { id: 1, title: 'Smartwatch Deals', subtitle: 'Up to 30% off', imagePublicId: BANNER_IMAGE_IDS.promoSmartwatches, link: '#/shop/Smartwatches' },
        { id: 2, title: 'Audio Accessories', subtitle: 'Starting at ₹999', imagePublicId: BANNER_IMAGE_IDS.promoAccessories, link: '#/shop/Accessories' },
        { id: 3, title: 'New Arrivals', subtitle: 'Shop the latest tech', imagePublicId: BANNER_IMAGE_IDS.promoNewArrivals, link: '#/shop' },
    ]
};
const sampleCoupons: Coupon[] = [
    { code: 'WELCOME10', discountPercentage: 10, maxDiscount: 500, isActive: true },
    { code: 'SALE50', discountPercentage: 50, maxDiscount: 2000, expiryDate: '2024-12-31', isActive: true },
    { code: 'EXPIRED', discountPercentage: 20, isActive: false },
];

export const seedDatabase = async () => {
    const db = getFirebaseDb();
    const seedFlagRef = doc(db, COLLECTIONS.METADATA, 'dbSeeded');
    const seedFlagSnap = await getDoc(seedFlagRef);

    if (seedFlagSnap.exists()) return;

    console.log("First time setup: Seeding database...");

    const batch = writeBatch(db);

    sampleProducts.forEach((prod, index) => {
        const id = index + 1;
        const newProd = { ...prod, id };
        const docRef = doc(db, COLLECTIONS.PRODUCTS, id.toString());
        batch.set(docRef, newProd);
    });

    sampleStores.forEach(store => {
        const docRef = doc(db, COLLECTIONS.STORES, store.id.toString());
        batch.set(docRef, store);
    });

    sampleCoupons.forEach(coupon => {
        const docRef = doc(db, COLLECTIONS.COUPONS, coupon.code);
        batch.set(docRef, coupon);
    });

    const homepageConfigRef = doc(db, COLLECTIONS.CONFIG, 'homepage');
    batch.set(homepageConfigRef, sampleHomepageConfig);

    batch.set(seedFlagRef, { seeded: true, date: new Date().toISOString() });
    
    await batch.commit();
    console.log("Database seeded successfully.");
};

// --- PRODUCT APIS ---
export const getProducts = async (): Promise<Product[]> => {
    const querySnapshot = await getDocs(collection(getFirebaseDb(), COLLECTIONS.PRODUCTS));
    return querySnapshot.docs.map(doc => doc.data() as Product);
};

export const addProduct = async (productData: Omit<Product, 'id' | 'reviews'>): Promise<Product> => {
    const newId = Date.now();
    const newProduct: Product = { ...productData, id: newId, reviews: [] };
    // Ensure no undefined values are passed to Firestore
    await setDoc(doc(getFirebaseDb(), COLLECTIONS.PRODUCTS, newId.toString()), cleanData(newProduct));
    return newProduct;
};
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    const docRef = doc(getFirebaseDb(), COLLECTIONS.PRODUCTS, updatedProduct.id.toString());
    // Ensure no undefined values are passed to Firestore
    await setDoc(docRef, cleanData(updatedProduct), { merge: true });
    return updatedProduct;
};
export const deleteProduct = async (productId: number): Promise<void> => {
    await deleteDoc(doc(getFirebaseDb(), COLLECTIONS.PRODUCTS, productId.toString()));
};

// --- STORE APIS ---
export const getStores = async (): Promise<Store[]> => {
    const querySnapshot = await getDocs(collection(getFirebaseDb(), COLLECTIONS.STORES));
    return querySnapshot.docs.map(doc => doc.data() as Store);
};
export const updateStore = async (updatedStore: Store): Promise<Store> => {
    const docRef = doc(getFirebaseDb(), COLLECTIONS.STORES, updatedStore.id.toString());
    await setDoc(docRef, cleanData(updatedStore), { merge: true });
    return updatedStore;
};

// --- AUTH APIS ---
export const getCurrentUser = async (): Promise<User | null> => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (user) => {
            unsubscribe();
            if (user) {
                const userDoc = await getDoc(doc(getFirebaseDb(), COLLECTIONS.USERS, user.uid));
                if (userDoc.exists()) {
                    resolve(userDoc.data() as User);
                } else {
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
};

export const login = async (identifier: string, pass: string): Promise<User> => {
    const userCredential = await signInWithEmailAndPassword(getFirebaseAuth(), identifier, pass);
    if (!userCredential.user) throw new Error("Authentication failed.");
    const userDoc = await getDoc(doc(getFirebaseDb(), COLLECTIONS.USERS, userCredential.user.uid));
    if (!userDoc.exists()) throw new Error("User profile not found.");
    return userDoc.data() as User;
};


export const logout = async () => {
    await signOut(getFirebaseAuth());
};

export const signup = async (name: string, email: string, pass: string, mobile: string, marketingConsent: boolean): Promise<User> => {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (!userCredential.user) throw new Error("Could not create user.");
    await updateProfile(userCredential.user, { displayName: name });

    const newUser: User = { 
        id: Date.now(),
        name, 
        email,
        password: '',
        mobile, 
        marketingConsent, 
        role: 'customer'
    };
    await setDoc(doc(getFirebaseDb(), COLLECTIONS.USERS, userCredential.user.uid), cleanData(newUser));
    return newUser;
};

export const updateUser = async (updatedUserData: User): Promise<User> => {
    const uid = getFirebaseAuth().currentUser?.uid;
    if (!uid) throw new Error("Not logged in");
    await setDoc(doc(getFirebaseDb(), COLLECTIONS.USERS, uid), cleanData(updatedUserData), { merge: true });
    return updatedUserData;
};

export const signInWithProvider = async (providerName: 'google' | 'facebook'): Promise<User> => {
    const auth = getFirebaseAuth();
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const firebaseUser = result.user;
        if (!firebaseUser) throw new Error("Authentication failed: No user returned.");

        const userDocRef = doc(getFirebaseDb(), COLLECTIONS.USERS, firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return userDoc.data() as User;
        } else {
            const newUser: User = {
                id: Date.now(),
                name: firebaseUser.displayName || 'New User',
                email: firebaseUser.email || '',
                password: '',
                role: 'customer',
                mobile: firebaseUser.phoneNumber || '',
                addresses: [],
                marketingConsent: true,
            };
            await setDoc(userDocRef, cleanData(newUser));
            return newUser;
        }
    } catch (error: any) {
        console.error(`Error during ${providerName} sign-in:`, error);
        if (error.code === 'auth/account-exists-with-different-credential') {
            throw new Error('An account already exists with the same email address but different sign-in credentials. Please sign in using the original method.');
        }
        throw new Error(`Failed to sign in with ${providerName}. Please try again.`);
    }
};

export const finalizeLogin = (user: User) => { };
export const sendPasswordReset = async (email: string): Promise<void> => {
    await sendPasswordResetEmail(getFirebaseAuth(), email);
};

// --- CART & WISHLIST APIS ---
export const getCart = async (userId: number): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) return [];
    const docSnap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.CARTS, uid));
    return docSnap.exists() ? (docSnap.data() as any).items : [];
};

export const addToCart = async (userId: number, product: Product, variant: ProductVariant): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    const docRef = doc(getFirebaseDb(), COLLECTIONS.CARTS, uid);
    const docSnap = await getDoc(docRef);
    const userCart = docSnap.exists() ? ((docSnap.data() as any).items as CartItem[]) : [];

    const existingItemIndex = userCart.findIndex(item => item.variant.id === variant.id);
    if (existingItemIndex > -1) {
        userCart[existingItemIndex].quantity += 1;
    } else {
        userCart.push({ product, variant, quantity: 1, dateAdded: new Date().toISOString() });
    }
    await setDoc(docRef, { items: cleanData(userCart) });
    return userCart;
};

export const removeFromCart = async (userId: number, variantId: string): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    const docRef = doc(getFirebaseDb(), COLLECTIONS.CARTS, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];

    let userCart = (docSnap.data() as any).items as CartItem[];
    userCart = userCart.filter(item => item.variant.id !== variantId);
    await setDoc(docRef, { items: cleanData(userCart) });
    return userCart;
};

export const updateCartQuantity = async (userId: number, variantId: string, quantity: number): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    const docRef = doc(getFirebaseDb(), COLLECTIONS.CARTS, uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return [];

    const userCart = (docSnap.data() as any).items as CartItem[];
    const itemIndex = userCart.findIndex(item => item.variant.id === variantId);
    if (itemIndex > -1) {
        userCart[itemIndex].quantity = quantity;
    }
    await setDoc(docRef, { items: cleanData(userCart) });
    return userCart;
};

export const clearCart = async (userId: number): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) return [];
    await setDoc(doc(getFirebaseDb(), COLLECTIONS.CARTS, uid), { items: [] });
    return [];
};

export const getWishlist = async (userId: number): Promise<number[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) return [];
    const docSnap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.WISHLISTS, uid));
    return docSnap.exists() ? (docSnap.data() as any).productIds : [];
};

export const toggleWishlist = async (userId: number, productId: number): Promise<number[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    const docRef = doc(getFirebaseDb(), COLLECTIONS.WISHLISTS, uid);
    const docSnap = await getDoc(docRef);
    let userWishlist = docSnap.exists() ? ((docSnap.data() as any).productIds as number[]) : [];

    if (userWishlist.includes(productId)) {
        userWishlist = userWishlist.filter(id => id !== productId);
    } else {
        userWishlist.push(productId);
    }
    await setDoc(docRef, { productIds: userWishlist });
    return userWishlist;
};

// --- ORDER APIS ---
export const getOrders = async (userId: number): Promise<Order[]> => {
    const q = query(collection(getFirebaseDb(), COLLECTIONS.ORDERS), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const orders = querySnapshot.docs.map(doc => doc.data() as Order);
    return orders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getAllOrders = async (): Promise<Order[]> => {
    const q = query(collection(getFirebaseDb(), COLLECTIONS.ORDERS), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Order);
};

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    const cleanedData = cleanData(orderData);
    const docRef = await addDoc(collection(getFirebaseDb(), COLLECTIONS.ORDERS), cleanedData);
    const newOrder: Order = { ...orderData, id: docRef.id };
    await updateDoc(docRef, { id: docRef.id });
    return newOrder;
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    const docRef = doc(getFirebaseDb(), COLLECTIONS.ORDERS, orderId);
    const cleanedUpdates = cleanData(updates);
    await updateDoc(docRef, cleanedUpdates);
    const updatedDoc = await getDoc(docRef);
    return updatedDoc.data() as Order;
};

// --- MISC APIS ---
export const addReview = async (productId: number, review: Review): Promise<Product> => {
    const docRef = doc(getFirebaseDb(), COLLECTIONS.PRODUCTS, productId.toString());
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Product not found");
    
    const product = docSnap.data() as Product;
    const updatedReviews = [review, ...product.reviews];
    await updateDoc(docRef, { reviews: cleanData(updatedReviews) });
    return { ...product, reviews: updatedReviews };
};

export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    const docSnap = await getDoc(doc(getFirebaseDb(), COLLECTIONS.CONFIG, 'homepage'));
    return docSnap.exists() ? docSnap.data() as HomepageConfig : sampleHomepageConfig;
};

export const updateHomepageConfig = async (config: HomepageConfig): Promise<HomepageConfig> => {
    await setDoc(doc(getFirebaseDb(), COLLECTIONS.CONFIG, 'homepage'), cleanData(config));
    return config;
};

export const getCoupons = async (): Promise<Coupon[]> => {
    const querySnapshot = await getDocs(collection(getFirebaseDb(), COLLECTIONS.COUPONS));
    return querySnapshot.docs.map(doc => doc.data() as Coupon);
};
export const addCoupon = async (coupon: Coupon): Promise<Coupon> => {
    await setDoc(doc(getFirebaseDb(), COLLECTIONS.COUPONS, coupon.code), cleanData(coupon));
    return coupon;
};
export const updateCoupon = async (coupon: Coupon): Promise<Coupon> => {
    await updateDoc(doc(getFirebaseDb(), COLLECTIONS.COUPONS, coupon.code), cleanData(coupon));
    return coupon;
};
export const deleteCoupon = async (code: string): Promise<void> => {
    await deleteDoc(doc(getFirebaseDb(), COLLECTIONS.COUPONS, code));
};

export const requestReturn = async (orderId: string, variantId: string, reason: string): Promise<Order> => {
    const docRef = doc(getFirebaseDb(), COLLECTIONS.ORDERS, orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Order not found");

    const order = docSnap.data() as Order;
    const itemIndex = order.items.findIndex(i => i.variant.id === variantId);
    if (itemIndex === -1) throw new Error("Item not found in order");

    order.items[itemIndex].returnRequest = { status: 'pending', reason, date: new Date().toISOString() };
    order.status = 'Return Requested';
    
    await updateDoc(docRef, { items: cleanData(order.items), status: order.status });
    return order;
};

export const updateReturnStatus = async (orderId: string, variantId: string, status: 'approved' | 'rejected'): Promise<Order> => {
    const docRef = doc(getFirebaseDb(), COLLECTIONS.ORDERS, orderId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Order not found");

    const order = docSnap.data() as Order;
    const itemIndex = order.items.findIndex(i => i.variant.id === variantId);
    if (itemIndex === -1) throw new Error("Item not found in order");

    const item = order.items[itemIndex];
    if (!item.returnRequest) throw new Error("No return request found");

    item.returnRequest.status = status;
    const newOrderStatus = status === 'approved' ? 'Refund Approved' : 'Return Rejected';

    await updateDoc(docRef, { items: cleanData(order.items), status: newOrderStatus });
    return { ...order, status: newOrderStatus };
};

// --- MOCK/DEPRECATED APIS ---
export const getPinCode = (): string | null => localStorage.getItem('devmobile_pincode_v2');
export const setPinCode = (pinCode: string) => localStorage.setItem('devmobile_pincode_v2', pinCode);
export const getSentReviewReminders = (): string[] => JSON.parse(localStorage.getItem('devmobile_review_reminders_sent_v2') || '[]');
export const addSentReviewReminder = (orderId: string) => {
    const sent = getSentReviewReminders();
    if (!sent.includes(orderId)) {
        localStorage.setItem('devmobile_review_reminders_sent_v2', JSON.stringify([...sent, orderId]));
    }
};

// Admin only
export const getAllUsers = async (): Promise<User[]> => {
    const querySnapshot = await getDocs(collection(getFirebaseDb(), COLLECTIONS.USERS));
    return querySnapshot.docs.map(doc => doc.data() as User);
};

export const sendTelegramAlert = async (order: Order, user: User | null) => {
    try {
        await fetch(`${API_BASE_URL}/api/send-telegram-alert`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Secret-Key': BACKEND_API_SECRET
            },
            body: JSON.stringify({ order, user }),
        });
    } catch (error) {
        console.warn("Could not connect to backend for Telegram alert.", error);
    }
};
export const addPayout = async (storeId: number, payoutData: Omit<Payout, 'payoutId'>): Promise<Store> => {
    const storeRef = doc(getFirebaseDb(), COLLECTIONS.STORES, storeId.toString());
    const store = await getDoc(storeRef);
    return store.data() as Store;
};

export const findUserByIdentifier = async (identifier: string): Promise<boolean> => {
    const usersRef = collection(getFirebaseDb(), COLLECTIONS.USERS);
    const qEmail = query(usersRef, where("email", "==", identifier));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) return true;

    const qMobile = query(usersRef, where("mobile", "==", identifier));
    const snapMobile = await getDocs(qMobile);
    return !snapMobile.empty;
};

export const updatePassword = async (identifier: string, newPass: string): Promise<void> => {
    console.warn("Direct password update via client API is restricted. Sending reset email instead.");
    await sendPasswordResetEmail(getFirebaseAuth(), identifier);
};