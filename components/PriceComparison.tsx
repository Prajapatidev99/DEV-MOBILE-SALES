
import React, { useState } from 'react';
import type { Product, ProductVariant, PriceComparison as PriceComparisonType } from '../types';
import { API_BASE_URL } from '../api';

interface PriceComparisonProps {
  product: Product;
  selectedVariant: ProductVariant;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ product, selectedVariant }) => {
  const [comparisonResults, setComparisonResults] = useState<PriceComparisonType[] | null>(null);
  const [isComparingPrices, setIsComparingPrices] = useState(false);
  const [comparisonError, setComparisonError] = useState<string | null>(null);

  const handleComparePrices = async () => {
    setIsComparingPrices(true);
    setComparisonError(null);
    setComparisonResults(null);
    try {
        const schema = {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    platform: { type: 'STRING' },
                    url: { type: 'STRING' }
                },
                required: ['platform', 'url']
            }
        };
        const variantDetails = Object.entries(selectedVariant.attributes)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
            
        const prompt = `You are an expert price comparison assistant for electronics in India. Your goal is to generate a direct search URL for a specific product variant on major e-commerce sites.

Product Name: "${product.name}"
Variant Details: "${variantDetails}"

Based on this, create a search URL for this exact product on amazon.in and flipkart.com. The URL should take the user to the search results page for that product.

Respond ONLY with the JSON object that matches the provided schema.`;

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
            const results = JSON.parse(data.text) as PriceComparisonType[];
            setComparisonResults(results);
        } else {
             throw new Error(data.message || "Invalid response from backend.");
        }

    } catch (error) {
        console.error("Error fetching price comparison links:", error);
        setComparisonError("Sorry, we couldn't generate search links at this time.");
    } finally {
        setIsComparingPrices(false);
    }
  };

  return (
    <div className="w-full">
       {/* Enforce exact height to match CartBtn-lg (52px) and remove any margin that causes misalignment */}
       <button onClick={handleComparePrices} disabled={isComparingPrices} className="w-full bg-gray-800 text-white font-bold py-3 px-6 rounded-xl hover:bg-black transition-transform transform hover:scale-105 duration-300 flex items-center justify-center text-lg disabled:bg-gray-400 h-[52px] shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Check Live Prices
        </button>

        {(isComparingPrices || comparisonResults || comparisonError) && (
            <div className="bg-gray-50 p-4 rounded-lg mt-6 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Check Live Prices</h3>
                <p className="text-xs text-gray-500 mb-3">For: {product.name} ({Object.values(selectedVariant.attributes).filter(Boolean).join(' / ')})</p>
                {isComparingPrices && (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                )}
                {comparisonError && <p className="text-red-600">{comparisonError}</p>}
                {comparisonResults && (
                    <div className="space-y-3">
                        {comparisonResults.map(result => (
                            <a 
                            key={result.platform} 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between text-sm bg-white p-3 rounded-md border hover:bg-gray-50 transition-colors"
                            >
                            <span className="font-semibold text-blue-600 capitalize">Check on {result.platform}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        ))}
                        <div className="flex items-start gap-2 text-xs text-gray-500 pt-2 border-t mt-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>AI-generated links to help you find the best price. Please verify all details on the retailer's site.</span>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default PriceComparison;