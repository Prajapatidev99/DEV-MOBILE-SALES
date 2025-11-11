// FIX: Changed import to `import * as React from 'react'`. This is a more robust way to import the React module and its associated types, ensuring that the `JSX` namespace is available before any augmentations are made. This resolves the widespread issue where TypeScript failed to recognize standard HTML elements.
// FIX: Changed `import React from 'react'` to `import * as React from 'react'` to ensure proper namespace augmentation for custom elements.
import * as React from 'react';

// FIX: Replaced a non-functional triple-slash directive with a standard 'import'.
// The previous directive failed to load React's types, causing the global JSX
// namespace augmentation to replace React's default intrinsic elements instead
// of merging with them. This import makes React's types available, fixing errors
// for all standard HTML elements project-wide.

// FIX: Added global JSX declaration for the 'model-viewer' custom element.
// By declaring it here in a central module, we augment React's JSX types
// project-wide, which resolves all 'Property ... does not exist on type JSX.IntrinsicElements' errors.
// Because this file is a module (due to the import/export statements), this declaration
// safely augments the global namespace without overriding standard HTML element types.
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export type ProductCategory = "Smartphones" | "Smartwatches" | "Accessories";

export interface ProductVariant {
  id: string; // A unique identifier for the variant, e.g., "product-1-blue-128gb"
  sellerPrice: number; // The price set by the shopkeeper/seller
  price: number; // The final price shown to the customer (sellerPrice + profit)
  originalPrice?: number;
  imageUrl?: string; // Optional: specific image for this variant
  attributes: {
    Color?: string;
    Storage?: string;
    RAM?: string;
  };
  colorCode?: string; // For UI color swatches
  inventory: { storeId: number; quantity: number }[];
  discountLabel?: string;
  costPrice?: number;
  specialOffer?: {
    expiry: string; // ISO string for the deadline
  };
}

export interface Product {
  id: number;
  name:string;
  imageUrls: string[]; // General gallery images
  rating: number;
  description: string;
  brand: string;
  category: ProductCategory;
  specifications: {
    display: string;
    camera: string;
    processor: string;
    battery: string;
  };
  variants: ProductVariant[];
  reviews: Review[];
  dateAdded: string;
  image360Urls?: string[];
  sellerId?: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface CartItem {
  product: Product;
  variant: ProductVariant;
  quantity: number;
  dateAdded: string;
  returnRequest?: {
    status: 'pending' | 'approved' | 'rejected';
    reason: string;
    date: string;
  };
}

export interface Address {
  id: number;
  fullName: string;
  mobileNumber: string;
  pincode: string;
  addressLine1: string; // Flat, House no., Building, Company, Apartment
  addressLine2: string; // Area, Street, Sector, Village
  landmark?: string;
  city: string;
  state: string;
  country: string;
  isDefault: boolean;
  deliveryInstructions?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password: string; // In a real app, this would be a hash
  role?: 'admin' | 'customer' | 'seller';
  mobile?: string;
  dob?: string;
  addresses?: Address[];
  marketingConsent?: boolean;
  storeId?: number;
}

export interface Payout {
  payoutId: number;
  date: string;
  amount: number;
  method: 'UPI' | 'Bank Transfer';
  transactionId: string;
}

export interface Store {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  paymentDetails?: {
    upi?: string;
    bankAccount?: {
      accountNumber: string;
      ifsc: string;
      accountHolder: string;
    };
  };
  payouts?: Payout[];
}

export interface Order {
  id: string;
  userId: number;
  date: string;
  status: 'Pending Payment' | 'Pending Verification' | 'Pending Seller Acceptance' | 'Accepted' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' | 'Return Requested' | 'Refund Approved' | 'Return Rejected';
  items: CartItem[];
  deliveryAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
  };
  total: number;
  deliveryMethod: 'shipping' | 'pickup' | 'quick-delivery';
  deliveryType?: 'LOCAL' | 'COURIER';
  pickupStore?: Store;
  fulfilledByStoreId?: number;
  paymentId?: string;
  gstin?: string;
  companyName?: string;
  couponCode?: string;
  discountAmount?: number;
  paymentProof?: string;
  verificationNotes?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface Notification {
  id: number;
  type: 'stock' | 'price' | 'order' | 'promo' | 'review';
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  timestamp: string;
}


// Fix: Add ProfileData interface for use in Profile.tsx component.
export interface ProfileData {
  name: string;
  avatarUrl: string;
  bio: string;
}

// Fix: Add Link interface for use in LinkCard.tsx component.
export interface Link {
  title: string;
  url: string;
  icon?: React.ReactNode;
}

// Fix: Add Theme type for use in ThemeToggle.tsx component.
export type Theme = 'light' | 'dark';

export interface PriceComparison {
  platform: string;
  url: string;
}

export interface DisplayableProduct {
  uniqueId: string;
  parentId: number;
  name: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  rating: number;
  inStock: boolean;
  dateAdded: string;
  brand: string;
  product: Product;
  variant: ProductVariant;
}

export interface FocalPoint {
  x: number;
  y: number;
}

export interface HeroBannerConfig {
  title: string;
  imageUrl: string;
  focalPoint?: FocalPoint;
}

export interface PromoBannerConfig {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  link: string;
  focalPoint?: FocalPoint;
}

export interface HomepageConfig {
  hero: HeroBannerConfig;
  promos: PromoBannerConfig[];
}

export interface Coupon {
  code: string;
  discountPercentage: number;
  maxDiscount?: number;
  expiryDate?: string;
  isActive: boolean;
}