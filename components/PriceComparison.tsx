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

  // Defensive check: If no product or variant is available, render nothing
  if (!product || !selectedVariant) {
      return null;
  }

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 2, delay = 1000): Promise<any> => {
      try {
          const response = await fetch(url, options);
          if (!response.ok) {
              const errorBody = await response.text();
              throw new Error(errorBody || `HTTP Error: ${response.status}`);
          }
          return await response.json();
      } catch (error) {
          if (retries > 0) {
              console.warn(`Price check failed, retrying... (${retries} attempts left)`);
              await new Promise(resolve => setTimeout(resolve, delay));
              return fetchWithRetry(url, options, retries - 1, delay * 1.5);
          }
          throw error;
      }
  };

  const handleComparePrices = async () => {
    if (comparisonResults) {
        setComparisonResults(null);
        return;
    }

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

        const data = await fetchWithRetry(`${API_BASE_URL}/api/generate-content`, {
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

        if (data.success && data.text) {
            const results = JSON.parse(data.text) as PriceComparisonType[];
            setComparisonResults(results);
        } else {
             throw new Error(data.message || "Invalid response from backend.");
        }

    } catch (error) {
        console.error("Error fetching price comparison links:", error);
        setComparisonError("Could not check prices at the moment. Please try again.");
    } finally {
        setIsComparingPrices(false);
    }
  };

  const handleClose = () => {
      setComparisonResults(null);
      setComparisonError(null);
      setIsComparingPrices(false);
  };

  return (
    <div className="w-full relative group">
       {/* Enforce exact height to match CartBtn-lg (52px), square look, black background */}
       <button onClick={handleComparePrices} disabled={isComparingPrices} className="w-full bg-gray-900 text-white font-bold py-3 px-6 rounded-md hover:bg-black transition-colors duration-300 flex items-center justify-center text-lg disabled:bg-gray-400 h-[52px] shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {isComparingPrices ? 'Checking...' : 'Check Live Prices'}
        </button>

        {(isComparingPrices || comparisonResults || comparisonError) && (
            <div className="bg-white border border-gray-200 p-3 rounded-md mt-2 animate-fade-in shadow-xl sm:absolute sm:top-full sm:left-0 sm:w-full sm:z-20 relative z-0">
                <button 
                    onClick={handleClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    title="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <p className="text-xs text-gray-600 mb-3 font-medium border-b border-gray-200 pb-2 pr-6">
                    For: {product.name} <span className="text-gray-500 font-normal">({Object.values(selectedVariant.attributes).filter(Boolean).join(' / ')})</span>
                </p>
                {isComparingPrices && (
                    <div className="space-y-2 animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                    </div>
                )}
                {comparisonError && <p className="text-red-600 text-sm">{comparisonError}</p>}
                {comparisonResults && (
                    <div className="space-y-2">
                        {comparisonResults.map(result => (
                            <a 
                            key={result.platform} 
                            href={result.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between text-sm bg-gray-50 p-3 rounded-md border hover:bg-blue-50 hover:border-blue-200 transition-all shadow-sm group"
                            >
                            <span className="font-semibold text-gray-700 group-hover:text-blue-600 capitalize">Check on {result.platform}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 group-hover:text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                        ))}
                        <div className="flex items-start gap-2 text-[10px] text-gray-400 pt-2 mt-1 leading-tight">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>AI-generated links. Please verify details on the retailer's site.</span>
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default PriceComparison;