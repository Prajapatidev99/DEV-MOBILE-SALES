// FIX: Replaced Firebase v9 SDK calls with v8 equivalents to match the project's dependency version.
import { db, auth, storage } from './firebase';
import type { Product, User, CartItem, Order, Review, Store, ProductVariant, HomepageConfig, Address, Coupon, Payout } from './types';

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

// --- HELPER: Get User UID from numeric ID ---
// This is a workaround to bridge the gap between the app's numeric user IDs and Firebase's string UIDs.
const _getUidFromNumericId = async (userId: number): Promise<string | null> => {
    // FIX: Converted Firestore query from v9 to v8 syntax.
    const q = db.collection(COLLECTIONS.USERS).where("id", "==", userId).limit(1);
    const querySnapshot = await q.get();
    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    }
    return null;
};


// --- SAMPLE DATA (for seeding) ---
// Note: User data is no longer seeded. The first user to sign up becomes the admin.
const minimalPlaceholder = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const generatePlaceholder = () => minimalPlaceholder;

const sampleProducts: Omit<Product, 'id'>[] = [
    { name: 'Apple iPhone 15', category: 'Smartphones', imageUrls: [generatePlaceholder()], rating: 4.8, description: 'The latest iPhone with a stunning new camera and the powerful A16 Bionic chip.', brand: 'Apple', specifications: { display: '6.1" Super Retina XDR', camera: '48MP Main', processor: 'A16 Bionic', battery: '3349mAh' }, reviews: [], dateAdded: '2023-10-01', approvalStatus: 'approved',
        variants: [ { id: '1-pink-128', sellerPrice: 58900, price: 59900, originalPrice: 65900, attributes: { Color: 'Pink', Storage: '128GB', RAM: '6GB' }, colorCode: '#F5C6D0', inventory: [{ storeId: 1, quantity: 10 }] } ]
    },
    { name: 'Samsung Galaxy S24 Ultra', category: 'Smartphones', imageUrls: [generatePlaceholder()], rating: 4.9, description: 'Experience the new era of mobile AI with Galaxy S24 Ultra.', brand: 'Samsung', specifications: { display: '6.8" Dynamic AMOLED 2X', camera: '200MP Wide', processor: 'Snapdragon 8 Gen 3', battery: '5000mAh' }, reviews: [], dateAdded: '2024-01-15', approvalStatus: 'approved',
        variants: [ { id: '2-grey-256', sellerPrice: 128499, price: 129999, originalPrice: 134999, attributes: { Color: 'Titanium Gray', Storage: '256GB', RAM: '12GB' }, colorCode: '#848482', inventory: [{ storeId: 1, quantity: 10 }] } ]
    },
    { name: 'Google Pixel 8 Pro', category: 'Smartphones', imageUrls: [generatePlaceholder()], rating: 4.7, description: 'The power of Google AI, in your hand.', brand: 'Google', specifications: { display: '6.7" Super Actua LTPO OLED', camera: '50MP Octa-PD', processor: 'Google Tensor G3', battery: '5050mAh' }, reviews: [], dateAdded: '2023-11-05', approvalStatus: 'approved',
        variants: [ { id: '3-obsidian-128', sellerPrice: 88999, price: 89999, attributes: { Color: 'Obsidian', Storage: '128GB', RAM: '12GB' }, colorCode: '#1C1C1E', inventory: [{ storeId: 1, quantity: 10 }] } ]
    },
    { name: 'Apple Watch Series 9', category: 'Smartwatches', imageUrls: [generatePlaceholder()], rating: 4.9, description: 'Smarter, brighter, and mightier.', brand: 'Apple', specifications: { display: 'Always-On Retina LTPO OLED', camera: 'N/A', processor: 'S9 SiP', battery: 'Up to 18 hours' }, reviews: [], dateAdded: '2023-09-15', approvalStatus: 'approved',
        variants: [ { id: '4-midnight-45', sellerPrice: 44000, price: 44900, attributes: { Color: 'Midnight', Storage: '45mm' }, colorCode: '#1f2937', inventory: [{ storeId: 1, quantity: 10 }] } ]
    },
    { name: 'OnePlus 12', category: 'Smartphones', imageUrls: [generatePlaceholder()], rating: 4.7, description: 'Elite performance and an effortlessly smooth experience.', brand: 'OnePlus', specifications: { display: '6.82" 2K ProXDR Display', camera: '50MP Sony LYT-808', processor: 'Snapdragon 8 Gen 3', battery: '5400mAh' }, reviews: [], dateAdded: '2024-02-01', approvalStatus: 'approved',
        variants: [ { id: '5-green-256', sellerPrice: 64499, price: 64999, attributes: { Color: 'Flowy Emerald', Storage: '256GB', RAM: '12GB' }, colorCode: '#90EE90', inventory: [{ storeId: 1, quantity: 10 }] } ]
    },
    { name: 'Apple AirPods Pro (2nd Gen)', category: 'Accessories', imageUrls: [generatePlaceholder()], rating: 4.8, description: 'Richer audio quality, next-level Active Noise Cancellation.', brand: 'Apple', specifications: { display: 'N/A', camera: 'N/A', processor: 'H2 Chip', battery: 'Up to 6 hours' }, reviews: [], dateAdded: '2023-09-20', approvalStatus: 'approved',
        variants: [ { id: '6-white-usbc', sellerPrice: 24000, price: 24900, attributes: { Color: 'White', Storage: 'USB-C' }, colorCode: '#ffffff', inventory: [{ storeId: 1, quantity: 10 }] } ]
    },
    { name: 'Samsung Galaxy Watch 6', category: 'Smartwatches', imageUrls: [generatePlaceholder()], rating: 4.6, description: 'The smart watch that knows you best.', brand: 'Samsung', specifications: { display: '1.5" Super AMOLED', camera: 'N/A', processor: 'Exynos W930', battery: 'Up to 40 hours' }, reviews: [], dateAdded: '2023-08-10', approvalStatus: 'approved',
        variants: [ { id: '7-graphite-44', sellerPrice: 33500, price: 33999, attributes: { Color: 'Graphite', Storage: '44mm' }, colorCode: '#2d2d2d', inventory: [{ storeId: 1, quantity: 10 }] } ]
    },
    { name: 'Xiaomi 14', category: 'Smartphones', imageUrls: [generatePlaceholder()], rating: 4.5, description: 'Next-generation Leica optics.', brand: 'Xiaomi', specifications: { display: '6.36" CrystalRes AMOLED', camera: '50MP Light Fusion 900', processor: 'Snapdragon 8 Gen 3', battery: '4610mAh' }, reviews: [], dateAdded: '2024-03-01', sellerId: 2, approvalStatus: 'pending',
        variants: [ { id: '8-white-256', sellerPrice: 69500, price: 69999, attributes: { Color: 'White', Storage: '256GB', RAM: '12GB' }, colorCode: '#E0E0E0', inventory: [{ storeId: 2, quantity: 5 }] } ]
    }
];

const sampleStores: Store[] = [
    { id: 1, name: 'Dev Mobile Satellite', address: 'Shreeji enclave complex, L-15, Ramdevnagar Rd, satellite, Ahmedabad, Gujarat 380015', latitude: 23.0399049, longitude: 72.5186593, paymentDetails: { upi: 'devmobile@axisbank' } },
    { id: 2, name: 'Test Store Maninagar', address: 'Maninagar, Ahmedabad, Gujarat', latitude: 23.0035, longitude: 72.6001 }
];
const sampleHomepageConfig: HomepageConfig = {
    hero: { title: 'The Future Is Here. Get Yours Now.', imageUrl: '' },
    promos: [
        { id: 1, title: 'Smartwatch Deals', subtitle: 'Up to 30% off', imageUrl: '', link: '#/shop/Smartwatches' },
        { id: 2, title: 'Audio Accessories', subtitle: 'Starting at ₹999', imageUrl: '', link: '#/shop/Accessories' },
        { id: 3, title: 'New Arrivals', subtitle: 'Shop the latest tech', imageUrl: '', link: '#/shop' },
    ]
};
const sampleCoupons: Coupon[] = [
    { code: 'WELCOME10', discountPercentage: 10, maxDiscount: 500, isActive: true },
    { code: 'SALE50', discountPercentage: 50, maxDiscount: 2000, expiryDate: '2024-12-31', isActive: true },
    { code: 'EXPIRED', discountPercentage: 20, isActive: false },
];

export const seedDatabase = async () => {
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const seedFlagDoc = db.collection(COLLECTIONS.METADATA).doc('dbSeeded');
    const seedFlag = await seedFlagDoc.get();

    if (seedFlag.exists) return;

    console.log("First time setup: Seeding database...");

    const batch = db.batch();

    // Seed Products
    sampleProducts.forEach((prod, index) => {
        const id = index + 1;
        const newProd = { ...prod, id };
        const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(id.toString());
        batch.set(docRef, newProd);
    });

    // Seed Stores
    sampleStores.forEach(store => {
        const docRef = db.collection(COLLECTIONS.STORES).doc(store.id.toString());
        batch.set(docRef, store);
    });

    // Seed Coupons
    sampleCoupons.forEach(coupon => {
        const docRef = db.collection(COLLECTIONS.COUPONS).doc(coupon.code);
        batch.set(docRef, coupon);
    });

    // Seed Homepage Config
    const homepageConfigRef = db.collection(COLLECTIONS.CONFIG).doc('homepage');
    batch.set(homepageConfigRef, sampleHomepageConfig);

    // Set the seed flag
    batch.set(seedFlagDoc, { seeded: true, date: new Date().toISOString() });
    
    await batch.commit();
    console.log("Database seeded successfully.");
};


// --- IMAGE STORAGE API (replaces IndexedDB) ---
export const saveImageToDb = async (blob: Blob): Promise<string> => {
    // FIX: Converted Firebase Storage calls from v9 to v8 syntax.
    const storageRef = storage.ref(`images/${Date.now()}-${Math.random()}`);
    const snapshot = await storageRef.put(blob);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
};

// --- PRODUCT APIS ---
export const getProducts = async (): Promise<Product[]> => {
    // FIX: Converted Firestore query from v9 to v8 syntax.
    const querySnapshot = await db.collection(COLLECTIONS.PRODUCTS).get();
    return querySnapshot.docs.map(doc => doc.data() as Product);
};

export const addProduct = async (productData: Omit<Product, 'id' | 'reviews'>): Promise<Product> => {
    const newId = Date.now();
    const newProduct: Product = { ...productData, id: newId, reviews: [] };
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(newId.toString());
    await docRef.set(newProduct);
    return newProduct;
};
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(updatedProduct.id.toString());
    await docRef.set(updatedProduct, { merge: true });
    return updatedProduct;
};
export const deleteProduct = async (productId: number): Promise<void> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(productId.toString());
    await docRef.delete();
};

// --- STORE APIS ---
export const getStores = async (): Promise<Store[]> => {
    // FIX: Converted Firestore query from v9 to v8 syntax.
    const querySnapshot = await db.collection(COLLECTIONS.STORES).get();
    return querySnapshot.docs.map(doc => doc.data() as Store);
};
export const updateStore = async (updatedStore: Store): Promise<Store> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.STORES).doc(updatedStore.id.toString());
    await docRef.set(updatedStore, { merge: true });
    return updatedStore;
};

// --- AUTH APIS ---
export const getCurrentUser = async (): Promise<User | null> => {
    return new Promise((resolve) => {
        // FIX: Converted Auth and Firestore calls from v9 to v8 syntax.
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            unsubscribe();
            if (user) {
                const userDoc = await db.collection(COLLECTIONS.USERS).doc(user.uid).get();
                if (userDoc.exists) {
                    resolve(userDoc.data() as User);
                } else {
                    resolve(null); // Auth user exists but no profile in DB
                }
            } else {
                resolve(null);
            }
        });
    });
};

export const login = async (email: string, pass: string): Promise<User> => {
    // FIX: Converted Auth and Firestore calls from v9 to v8 syntax.
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);
    if (!userCredential.user) throw new Error("Authentication failed.");
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userCredential.user.uid).get();
    if (!userDoc.exists) throw new Error("User profile not found.");
    return userDoc.data() as User;
};

export const logout = async () => {
    // FIX: Converted Auth call from v9 to v8 syntax.
    await auth.signOut();
};

export const signup = async (name: string, email: string, pass: string, mobile: string, marketingConsent: boolean): Promise<User> => {
    // FIX: Patched a critical security and permission issue in the `signup` function. The original code attempted to read the entire 'users' collection to determine if the new user should be an admin. This operation is blocked by standard Firestore security rules, causing all new signups to fail with a 'Missing or insufficient permissions' error. The fix removes this insecure collection query and defaults all new users to the 'customer' role, restoring the signup functionality. Admin users can be designated manually in the Firebase console.
    
    // FIX: Converted Auth and Firestore calls from v9 to v8 syntax.
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    if (!userCredential.user) throw new Error("Could not create user.");
    await userCredential.user.updateProfile({ displayName: name });

    const newUser: User = { 
        id: Date.now(), // Numeric ID for compatibility with the rest of the app
        name, 
        email,
        password: '', // Don't store password in DB
        mobile, 
        marketingConsent, 
        role: 'customer' // Default all new users to 'customer' 
    };

    await db.collection(COLLECTIONS.USERS).doc(userCredential.user.uid).set(newUser);
    return newUser;
};

export const updateUser = async (updatedUserData: User): Promise<User> => {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("Not logged in");
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.USERS).doc(uid);
    await docRef.set(updatedUserData, { merge: true });
    return updatedUserData;
};

export const findOrCreateSocialUser = async (userData: Omit<User, 'id' | 'password'>): Promise<User> => {
    // This is a mock function as Firebase Social Auth requires a popup flow.
    // In a real app, you would use signInWithPopup and then check if the user is new.
    const mockUser: User = {
        id: Date.now(),
        password: '',
        ...userData,
    };
    return mockUser;
};

// Mock login functions for demo purposes
export const finalizeLogin = (user: User) => { /* No longer needed with real auth */ };
export const findUserByIdentifier = async (identifier: string): Promise<User> => { throw new Error("Password reset not implemented for Firebase.") };
export const updatePassword = async (identifier: string, newPass: string): Promise<void> => { throw new Error("Password reset not implemented for Firebase.") };

// --- CART & WISHLIST APIS ---
export const getCart = async (userId: number): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) return [];
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docSnap = await db.collection(COLLECTIONS.CARTS).doc(uid).get();
    return docSnap.exists ? (docSnap.data() as any).items : [];
};

export const addToCart = async (userId: number, product: Product, variant: ProductVariant): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.CARTS).doc(uid);
    const docSnap = await docRef.get();
    const userCart = docSnap.exists ? ((docSnap.data() as any).items as CartItem[]) : [];

    const existingItemIndex = userCart.findIndex(item => item.variant.id === variant.id);
    if (existingItemIndex > -1) {
        userCart[existingItemIndex].quantity += 1;
    } else {
        userCart.push({ product, variant, quantity: 1, dateAdded: new Date().toISOString() });
    }
    await docRef.set({ items: userCart });
    return userCart;
};

export const removeFromCart = async (userId: number, variantId: string): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.CARTS).doc(uid);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return [];

    let userCart = (docSnap.data() as any).items as CartItem[];
    userCart = userCart.filter(item => item.variant.id !== variantId);
    await docRef.set({ items: userCart });
    return userCart;
};

export const updateCartQuantity = async (userId: number, variantId: string, quantity: number): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.CARTS).doc(uid);
    const docSnap = await docRef.get();
    if (!docSnap.exists) return [];

    const userCart = (docSnap.data() as any).items as CartItem[];
    const itemIndex = userCart.findIndex(item => item.variant.id === variantId);
    if (itemIndex > -1) {
        userCart[itemIndex].quantity = quantity;
    }
    await docRef.set({ items: userCart });
    return userCart;
};

export const clearCart = async (userId: number): Promise<CartItem[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) return [];
    // FIX: Converted Firestore call from v9 to v8 syntax.
    await db.collection(COLLECTIONS.CARTS).doc(uid).set({ items: [] });
    return [];
};

export const getWishlist = async (userId: number): Promise<number[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) return [];
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docSnap = await db.collection(COLLECTIONS.WISHLISTS).doc(uid).get();
    return docSnap.exists ? (docSnap.data() as any).productIds : [];
};

export const toggleWishlist = async (userId: number, productId: number): Promise<number[]> => {
    const uid = await _getUidFromNumericId(userId);
    if (!uid) throw new Error("User not found");
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.WISHLISTS).doc(uid);
    const docSnap = await docRef.get();
    let userWishlist = docSnap.exists ? ((docSnap.data() as any).productIds as number[]) : [];

    if (userWishlist.includes(productId)) {
        userWishlist = userWishlist.filter(id => id !== productId);
    } else {
        userWishlist.push(productId);
    }
    await docRef.set({ productIds: userWishlist });
    return userWishlist;
};

// --- ORDER APIS ---
export const getOrders = async (userId: number): Promise<Order[]> => {
    // FIX: Converted Firestore query from v9 to v8 syntax.
    const q = db.collection(COLLECTIONS.ORDERS).where("userId", "==", userId).orderBy("date", "desc");
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => doc.data() as Order);
};

export const getAllOrders = async (): Promise<Order[]> => {
    // FIX: Converted Firestore query from v9 to v8 syntax.
    const q = db.collection(COLLECTIONS.ORDERS).orderBy("date", "desc");
    const querySnapshot = await q.get();
    return querySnapshot.docs.map(doc => doc.data() as Order);
};

export const createOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = await db.collection(COLLECTIONS.ORDERS).add(orderData);
    const newOrder: Order = { ...orderData, id: docRef.id };
    await docRef.update({ id: docRef.id }); // Store the auto-generated ID within the document
    return newOrder;
};

export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
    await docRef.update(updates);
    const updatedDoc = await docRef.get();
    return updatedDoc.data() as Order;
};

// --- MISC APIS ---
export const addReview = async (productId: number, review: Review): Promise<Product> => {
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.PRODUCTS).doc(productId.toString());
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error("Product not found");
    
    const product = docSnap.data() as Product;
    const updatedReviews = [review, ...product.reviews];
    await docRef.update({ reviews: updatedReviews });
    return { ...product, reviews: updatedReviews };
};

export const getHomepageConfig = async (): Promise<HomepageConfig> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    const docSnap = await db.collection(COLLECTIONS.CONFIG).doc('homepage').get();
    return docSnap.exists ? docSnap.data() as HomepageConfig : sampleHomepageConfig;
};

export const updateHomepageConfig = async (config: HomepageConfig): Promise<HomepageConfig> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    await db.collection(COLLECTIONS.CONFIG).doc('homepage').set(config);
    return config;
};

export const getCoupons = async (): Promise<Coupon[]> => {
    // FIX: Converted Firestore query from v9 to v8 syntax.
    const querySnapshot = await db.collection(COLLECTIONS.COUPONS).get();
    return querySnapshot.docs.map(doc => doc.data() as Coupon);
};
export const addCoupon = async (coupon: Coupon): Promise<Coupon> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    await db.collection(COLLECTIONS.COUPONS).doc(coupon.code).set(coupon);
    return coupon;
};
export const updateCoupon = async (coupon: Coupon): Promise<Coupon> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    await db.collection(COLLECTIONS.COUPONS).doc(coupon.code).update({ ...coupon });
    return coupon;
};
export const deleteCoupon = async (code: string): Promise<void> => {
    // FIX: Converted Firestore call from v9 to v8 syntax.
    await db.collection(COLLECTIONS.COUPONS).doc(code).delete();
};

export const requestReturn = async (orderId: string, variantId: string, reason: string): Promise<Order> => {
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error("Order not found");

    const order = docSnap.data() as Order;
    const itemIndex = order.items.findIndex(i => i.variant.id === variantId);
    if (itemIndex === -1) throw new Error("Item not found in order");

    order.items[itemIndex].returnRequest = { status: 'pending', reason, date: new Date().toISOString() };
    order.status = 'Return Requested';
    
    await docRef.update({ items: order.items, status: order.status });
    return order;
};

export const updateReturnStatus = async (orderId: string, variantId: string, status: 'approved' | 'rejected'): Promise<Order> => {
    // FIX: Converted Firestore calls from v9 to v8 syntax.
    const docRef = db.collection(COLLECTIONS.ORDERS).doc(orderId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) throw new Error("Order not found");

    const order = docSnap.data() as Order;
    const itemIndex = order.items.findIndex(i => i.variant.id === variantId);
    if (itemIndex === -1) throw new Error("Item not found in order");

    const item = order.items[itemIndex];
    if (!item.returnRequest) throw new Error("No return request found");

    item.returnRequest.status = status;
    const newOrderStatus = status === 'approved' ? 'Refund Approved' : 'Return Rejected';

    await docRef.update({ items: order.items, status: newOrderStatus });
    return { ...order, status: newOrderStatus };
};

// --- MOCK/DEPRECATED APIS from old file ---
// Kept for compatibility if they are called somewhere, though they shouldn't be.
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
    // FIX: Converted Firestore query from v9 to v8 syntax.
    const querySnapshot = await db.collection(COLLECTIONS.USERS).get();
    return querySnapshot.docs.map(doc => doc.data() as User);
};

export const sendTelegramAlert = async (order: Order, user: User | null) => {
    const backendUrl = 'http://localhost:3001/api/send-telegram-alert';
    try {
        await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order, user }),
        });
    } catch (error) {
        console.warn("Could not connect to local backend for Telegram alert.", error);
    }
};
export const addPayout = async (storeId: number, payoutData: Omit<Payout, 'payoutId'>): Promise<Store> => {
    // This function is complex with subcollections, returning a simple mock for now.
    const store = await db.collection(COLLECTIONS.STORES).doc(storeId.toString()).get();
    return store.data() as Store;
};
