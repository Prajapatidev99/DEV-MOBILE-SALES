
import * as React from 'react';
import type { Product, ProductCategory, ProductVariant, User, Store } from '../types';
import { API_BASE_URL } from '../api';

// --- Price Calculation ---
const calculateCustomerPrice = (sellerPrice: number): number => {
    if (sellerPrice >= 5000 && sellerPrice < 10000) {
        return sellerPrice + 350;
    }
    if (sellerPrice >= 10000 && sellerPrice < 30000) {
        return sellerPrice + 500;
    }
    if (sellerPrice >= 30000 && sellerPrice < 50000) {
        return sellerPrice + 800;
    }
    if (sellerPrice >= 50000 && sellerPrice < 100000) {
        return sellerPrice + 1000;
    }
    if (sellerPrice >= 100000) {
        return sellerPrice + 1500;
    }
    return sellerPrice;
};

const emptyVariant: Omit<ProductVariant, 'id' | 'inventory'> = {
    sellerPrice: 0,
    price: 0,
    originalPrice: 0,
    attributes: { Color: '', Storage: '', RAM: '' },
};

const initialProductState: Omit<Product, 'id' | 'reviews'> = {
    name: '',
    category: 'Smartphones',
    imagePublicIds: [''],
    rating: 4.5,
    description: '',
    brand: '',
    specifications: { display: '', camera: '', processor: '', battery: '' },
    dateAdded: new Date().toISOString().split('T')[0],
    variants: [{ ...emptyVariant, id: `new-${Date.now()}`, inventory: [] }],
    approvalStatus: 'pending',
    image360Urls: [],
};

interface ProductEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product | Omit<Product, 'id' | 'reviews'>) => void;
    productToEdit: Product | null;
    currentUser: User;
    allStores: Store[];
}

const ProductEditorModal: React.FC<ProductEditorModalProps> = ({ isOpen, onClose, onSave, productToEdit, currentUser, allStores }) => {
    const [productData, setProductData] = React.useState<Product | Omit<Product, 'id' | 'reviews'>>(initialProductState);
    const [isFetching, setIsFetching] = React.useState(false);
    const [fetchError, setFetchError] = React.useState<string | null>(null);
    const [productUrl, setProductUrl] = React.useState('');

    React.useEffect(() => {
        if (productToEdit) {
            setProductData(productToEdit);
        } else {
            setProductData(initialProductState);
        }
        setFetchError(null);
        setProductUrl('');
    }, [productToEdit, isOpen]);
    
    const handleFetchData = async () => {
        if (!productUrl) {
            setFetchError("Please enter a URL.");
            return;
        }
        setIsFetching(true);
        setFetchError(null);
        try {
            const schema = {
                type: 'OBJECT',
                properties: {
                    name: { type: 'STRING', description: "The full official name of the product, including model and variant if available." },
                    brand: { type: 'STRING', description: "The brand of the product (e.g., Apple, Samsung)." },
                    description: { type: 'STRING', description: "A detailed and accurate product description, often found in the 'About this item' section." },
                    imageUrl: { type: 'STRING', description: "The direct, high-resolution URL of the main product image. Must end in .jpg, .png, .webp, etc." },
                    specifications: {
                        type: 'OBJECT',
                        properties: {
                            display: { type: 'STRING', description: "e.g., 6.7-inch Super Retina XDR display" },
                            camera: { type: 'STRING', description: "e.g., 48MP Main, 12MP Ultra Wide" },
                            processor: { type: 'STRING', description: "e.g., A17 Bionic chip" },
                            battery: { type: 'STRING', description: "e.g., Up to 29 hours video playback" },
                            RAM: { type: 'STRING', description: "The amount of RAM, e.g., '8GB'. If multiple, pick the most common one." },
                            Storage: { type: 'STRING', description: "The amount of internal storage, e.g., '256GB'. If multiple, pick the most common one." }
                        },
                    },
                },
                required: ["name", "brand", "description", "imageUrl", "specifications"],
            };
            
            const prompt = `You are a highly accurate e-commerce data specialist. Your task is to extract key product information for a mobile device from a given URL and format it as a clean JSON object.

            Analyze the product page from this URL: ${productUrl}

            Your goal is to be as precise as possible. Extract the following details and adhere strictly to the provided JSON schema:

            1.  **Product Name:** The full, official name of the product.
            2.  **Brand:** The manufacturer's brand name.
            3.  **Description:** The primary product description.
            4.  **Image URL:** The most important one. Find the primary, high-resolution product image and provide its direct URL. This URL must link directly to an image file (e.g., ending in .jpg, .png, .webp). Do not provide a data URI or a link to a webpage.
            5.  **Specifications:** Extract key technical details for display, camera, processor, battery, RAM, and storage. Be concise and accurate.

            Respond ONLY with the single JSON object that matches the schema. Do not include any surrounding text, explanations, or markdown formatting like \`\`\`json.`;

            const response = await fetch(`${API_BASE_URL}/api/generate-content`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: schema,
                    },
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch from backend proxy.');
            }

            const data = await response.json();
            
            if (data.success && data.text) {
                const fetchedData = JSON.parse(data.text);
                setProductData(prev => {
                    const newProductData = {
                        ...prev,
                        name: fetchedData.name || prev.name,
                        brand: fetchedData.brand || prev.brand,
                        description: fetchedData.description || prev.description,
                        imagePublicIds: [fetchedData.imageUrl || (prev.imagePublicIds && prev.imagePublicIds[0]) || ''],
                        specifications: {
                            ...prev.specifications,
                            ...fetchedData.specifications,
                        },
                    };

                    // If we have variants and the AI found RAM/Storage, pre-fill the first variant
                    if (newProductData.variants.length > 0 && fetchedData.specifications) {
                        const firstVariant = { ...newProductData.variants[0] };
                        if (fetchedData.specifications.RAM) {
                            firstVariant.attributes.RAM = fetchedData.specifications.RAM;
                        }
                        if (fetchedData.specifications.Storage) {
                            firstVariant.attributes.Storage = fetchedData.specifications.Storage;
                        }
                        newProductData.variants[0] = firstVariant;
                    }

                    return newProductData;
                });
            } else {
                throw new Error(data.message || "Invalid response from backend.");
            }

        } catch (error) {
            console.error("Error fetching product data:", error);
            setFetchError("Failed to fetch data. The URL might be unsupported or the AI could not process it. Please fill the details manually.");
        } finally {
            setIsFetching(false);
        }
    };


    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProductData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProductData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [name]: value,
            }
        }));
    };

    const handleVariantChange = (index: number, field: string, value: string | number | boolean) => {
        setProductData(prev => {
            const newVariants = [...prev.variants];
            const variantToUpdate = { ...newVariants[index] };
    
            if (field.startsWith('attr.')) {
                const attrKey = field.split('.')[1] as keyof ProductVariant['attributes'];
                variantToUpdate.attributes = { ...variantToUpdate.attributes, [attrKey]: value as string };
            } else if (field === 'sellerPrice') {
                const sellerPrice = Number(value) || 0;
                variantToUpdate.sellerPrice = sellerPrice;
                variantToUpdate.price = calculateCustomerPrice(sellerPrice);
            } else if (field === 'imagePublicId') {
                variantToUpdate.imagePublicId = value as string;
            } else {
                (variantToUpdate as any)[field] = value;
            }
            
            newVariants[index] = variantToUpdate;
            return { ...prev, variants: newVariants };
        });
    };

    const handleInventoryChange = (variantIndex: number, storeId: number, quantityStr: string) => {
        const quantity = parseInt(quantityStr, 10) || 0;
        setProductData(prev => {
            const newVariants = [...prev.variants];
            const variant = { ...newVariants[variantIndex] };
            let inventory = [...(variant.inventory || [])];
            const storeInvIndex = inventory.findIndex(i => i.storeId === storeId);
            
            if (storeInvIndex > -1) {
                inventory[storeInvIndex] = { ...inventory[storeInvIndex], quantity };
            } else {
                inventory.push({ storeId, quantity });
            }

            variant.inventory = inventory.filter(i => i.quantity > 0);
            newVariants[variantIndex] = variant;
            return { ...prev, variants: newVariants };
        });
    };
    
    const addVariant = () => {
        setProductData(prev => ({
            ...prev,
            variants: [...prev.variants, { ...emptyVariant, id: `new-${Date.now()}`, inventory: [] }]
        }));
    };

    const removeVariant = (index: number) => {
        setProductData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const handle360UrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const urls = e.target.value.split(',').map(url => url.trim()).filter(Boolean);
        setProductData(prev => ({ ...prev, image360Urls: urls }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!productData.name || !productData.brand || productData.variants.length === 0 || !productData.variants[0].sellerPrice) {
            alert("Please fill in all required fields: Name, Brand, and at least one Variant with a selling price.");
            return;
        }
        onSave(productData);
    };

    const inputClasses = "w-full px-3 py-2 bg-gray-50 text-gray-800 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="flex-shrink-0 p-6 flex justify-between items-center border-b">
                    <h2 className="text-2xl font-bold">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black text-3xl transition-colors">&times;</button>
                </header>
                
                <form onSubmit={handleSubmit} className="flex-grow flex flex-col overflow-hidden">
                    <div className="flex-grow overflow-y-auto custom-scrollbar p-6 sm:p-8">
                        <div className="space-y-6">
                            
                            <div className="p-4 border rounded-lg bg-gray-50/50">
                                <label htmlFor="productUrl" className={labelClasses}>Fetch Data from URL (Optional)</label>
                                <div className="flex gap-2">
                                    <input type="url" id="productUrl" value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="Paste Amazon/Flipkart product URL here" className={inputClasses} />
                                    <button type="button" onClick={handleFetchData} disabled={isFetching} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                                        {isFetching ? 'Fetching...' : 'Fetch Data'}
                                    </button>
                                </div>
                                {isFetching && <p className="text-sm text-blue-600 mt-2">Fetching product details with AI...</p>}
                                {fetchError && <p className="text-sm text-red-600 mt-2">{fetchError}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label htmlFor="name" className={labelClasses}>Product Name</label><input type="text" id="name" name="name" value={productData.name} onChange={handleInputChange} className={inputClasses} required /></div>
                                <div><label htmlFor="brand" className={labelClasses}>Brand</label><input type="text" id="brand" name="brand" value={productData.brand} onChange={handleInputChange} className={inputClasses} required /></div>
                                <div><label htmlFor="category" className={labelClasses}>Category</label><select id="category" name="category" value={productData.category} onChange={handleInputChange} className={inputClasses}><option value="Smartphones">Smartphones</option><option value="Smartwatches">Smartwatches</option><option value="Accessories">Accessories</option><option value="Refurbished Phones">Refurbished Phones</option></select></div>
                                <div><label htmlFor="imagePublicIds" className={labelClasses}>Main Image Public ID</label><input type="text" id="imagePublicIds" name="imagePublicIds" value={(productData.imagePublicIds && productData.imagePublicIds[0]) || ''} onChange={(e) => setProductData(p => ({...p, imagePublicIds: [e.target.value]}))} className={inputClasses} /></div>
                            </div>
                            <div><label htmlFor="description" className={labelClasses}>Description</label><textarea id="description" name="description" value={productData.description} onChange={handleInputChange} rows={3} className={inputClasses}></textarea></div>
                            <div><label htmlFor="image360Urls" className={labelClasses}>360° Image URLs (comma-separated)</label><textarea id="image360Urls" name="image360Urls" value={productData.image360Urls?.join(', ') || ''} onChange={handle360UrlsChange} rows={2} className={inputClasses} placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg, ..."></textarea></div>
                            <div>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-4">Base Specifications</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                   <input placeholder="Display" name="display" value={productData.specifications.display} onChange={handleSpecChange} className={inputClasses} />
                                   <input placeholder="Camera" name="camera" value={productData.specifications.camera} onChange={handleSpecChange} className={inputClasses} />
                                   <input placeholder="Processor" name="processor" value={productData.specifications.processor} onChange={handleSpecChange} className={inputClasses} />
                                   <input placeholder="Battery" name="battery" value={productData.specifications.battery} onChange={handleSpecChange} className={inputClasses} />
                                </div>
                            </div>

                            <div>
                                 <div className="flex justify-between items-center border-b pb-2 mb-4">
                                    <h3 className="text-lg font-semibold">Variants & Inventory</h3>
                                    <button type="button" onClick={addVariant} className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 text-sm rounded-md hover:bg-gray-300">+ Add Variant</button>
                                 </div>
                                 <div className="space-y-4">
                                    {productData.variants.map((variant, index) => (
                                        <div key={variant.id} className="p-4 bg-gray-50 rounded-lg border relative">
                                            <button type="button" onClick={() => removeVariant(index)} className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs">&times;</button>
                                            
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4 mb-4">
                                                <div className="flex items-center gap-2">
                                                    <input placeholder="Color Name" value={variant.attributes.Color || ''} onChange={e => handleVariantChange(index, 'attr.Color', e.target.value)} className={`${inputClasses} flex-grow min-w-0`} />
                                                    <label className="relative w-8 h-8 rounded-full border border-gray-300 cursor-pointer flex-shrink-0" style={{ backgroundColor: variant.colorCode || '#ffffff' }} title="Choose variant color">
                                                        <input type="color" value={variant.colorCode || '#ffffff'} onChange={e => handleVariantChange(index, 'colorCode', e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                                                    </label>
                                                </div>
                                                <input placeholder="Storage" value={variant.attributes.Storage || ''} onChange={e => handleVariantChange(index, 'attr.Storage', e.target.value)} className={inputClasses} />
                                                <input placeholder="RAM" value={variant.attributes.RAM || ''} onChange={e => handleVariantChange(index, 'attr.RAM', e.target.value)} className={inputClasses} />
                                                
                                                <div>
                                                    <label className="text-xs text-gray-500">Your Selling Price*</label>
                                                    <input placeholder="Your Price" type="number" value={variant.sellerPrice} onChange={e => handleVariantChange(index, 'sellerPrice', Number(e.target.value))} className={inputClasses} required />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">Customer Price (Auto)</label>
                                                    <p className="p-2 bg-gray-200 rounded-md text-gray-700 h-10 flex items-center">₹{variant.price.toLocaleString('en-IN')}</p>
                                                </div>
                                                <input placeholder="Original Price (for discount)" type="number" value={variant.originalPrice || ''} onChange={e => handleVariantChange(index, 'originalPrice', Number(e.target.value))} className={inputClasses} />
                                                
                                                <input placeholder="Variant Image Public ID" value={variant.imagePublicId || ''} onChange={e => handleVariantChange(index, 'imagePublicId', e.target.value)} className={`${inputClasses} col-span-2 sm:col-span-1`} />
                                                <input placeholder="Discount Label (e.g., Sale)" value={variant.discountLabel || ''} onChange={e => handleVariantChange(index, 'discountLabel', e.target.value)} className={`${inputClasses} col-span-2 sm:col-span-1`} />
                                            </div>

                                            <div className="border-t pt-3">
                                                <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">Inventory</h4>
                                                {currentUser.role === 'admin' ? (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                                                        {allStores.map(store => {
                                                            const inventoryItem = (variant.inventory || []).find(i => i.storeId === store.id);
                                                            return (
                                                                <div key={store.id} className="flex items-center gap-2">
                                                                    <label htmlFor={`inv-${variant.id}-${store.id}`} className="text-sm text-gray-600 truncate">{store.name}</label>
                                                                    <input id={`inv-${variant.id}-${store.id}`} type="number" value={inventoryItem?.quantity || ''} onChange={e => handleInventoryChange(index, store.id, e.target.value)} className={`${inputClasses} w-20`} />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    // Seller view
                                                    <div>
                                                        <label htmlFor={`inv-${variant.id}-${currentUser.storeId}`} className="text-sm text-gray-600">Stock for your store</label>
                                                        <input id={`inv-${variant.id}-${currentUser.storeId}`} type="number" value={(variant.inventory || []).find(i => i.storeId === currentUser.storeId)?.quantity || ''} onChange={e => handleInventoryChange(index, currentUser.storeId!, e.target.value)} className={`${inputClasses} w-24`} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                 </div>
                            </div>
                        </div>
                    </div>
                    <footer className="flex-shrink-0 p-6 flex justify-end items-center border-t bg-gray-50/50">
                        <button type="button" onClick={onClose} className="mr-4 text-gray-600 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">Cancel</button>
                        <button type="submit" className="bg-yellow-400 text-black font-bold py-2 px-6 rounded-md hover:bg-yellow-500 transition-colors">Save Product</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default ProductEditorModal;