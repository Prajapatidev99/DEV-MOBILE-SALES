// FIX: Changed React import to `import * as React from 'react'` to ensure the JSX namespace is correctly picked up, resolving errors with unrecognized HTML elements.
import * as React from 'react';
import type { Product } from '../types';

interface SearchBarProps {
  id: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  recentSearches: string[];
  allProducts: Product[];
}

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


const SearchBar: React.FC<SearchBarProps> = ({ id, searchQuery, onSearchChange, onSearchSubmit, recentSearches, allProducts }) => {
  const [suggestions, setSuggestions] = React.useState<Product[]>([]);
  const [isSuggestionsVisible, setSuggestionsVisible] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (searchQuery.length > 1) {
        const queryLower = searchQuery.toLowerCase();

        const scoredSuggestions = allProducts
            .map(product => {
                const nameLower = product.name.toLowerCase();
                const brandLower = product.brand.toLowerCase();
                const categoryLower = product.category.toLowerCase();
                let score = 0;

                // Direct substring match in name is a strong signal
                if (nameLower.includes(queryLower)) {
                    score = 100;
                    if (nameLower.startsWith(queryLower)) {
                        score += 50; // Prefix bonus
                    }
                } 
                // Substring match in brand/category
                else if (brandLower.includes(queryLower) || categoryLower.includes(queryLower)) {
                    score = 70;
                }
                else {
                    // Fuzzy match on name based on Levenshtein distance
                    const distance = levenshteinDistance(queryLower, nameLower);
                    const threshold = Math.floor(queryLower.length / 3) + 1; // Allow more errors for longer queries
                    
                    if (distance <= threshold) {
                        // Score is higher for lower distance.
                        score = 50 - distance * 10;
                    }
                }
                return { product, score };
            })
            .filter(item => item.score > 30) // Only keep items that matched with a decent score
            .sort((a, b) => b.score - a.score); // Sort by highest score

        const uniqueSuggestions = scoredSuggestions.reduce((acc, current) => {
            if (!acc.find(item => item.product.id === current.product.id)) {
                acc.push(current);
            }
            return acc;
        }, [] as typeof scoredSuggestions);

        const filteredSuggestions = uniqueSuggestions.map(item => item.product).slice(0, 5);
        
        setSuggestions(filteredSuggestions);
        setSuggestionsVisible(filteredSuggestions.length > 0);
    } else {
        setSuggestions([]);
        setSuggestionsVisible(false);
    }
  }, [searchQuery, allProducts]);

  // Handle clicks outside the search bar to close suggestions
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSuggestionsVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleFocus = () => {
    if (searchQuery.length === 0 && recentSearches.length > 0) {
        setSuggestionsVisible(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
      setSuggestionsVisible(false);
    }
  };

  const handleSuggestionClick = (productName: string) => {
    onSearchChange(productName);
    onSearchSubmit(productName);
    setSuggestionsVisible(false);
  };
  
  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return <span>{text}</span>;
    }
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <strong key={i} className="font-bold">
              {part}
            </strong>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const showRecentSearches = isSuggestionsVisible && searchQuery.length === 0 && recentSearches.length > 0;
  const showProductSuggestions = isSuggestionsVisible && searchQuery.length > 1 && suggestions.length > 0;

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor={id} className="sr-only">Search for smartphones, laptops etc</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          id={id}
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Search for smartphones, laptops etc"
          className="w-full pl-10 pr-4 py-2 bg-white text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
          autoComplete="off"
          aria-label="Search for products"
        />
      </form>
      {isSuggestionsVisible && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          {showRecentSearches && (
            <div>
                <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
                <ul>
                    {recentSearches.map((term, index) => (
                        <li 
                            key={index}
                            onClick={() => handleSuggestionClick(term)}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          {term}
                        </li>
                    ))}
                </ul>
            </div>
          )}
          {showProductSuggestions && (
             <ul>
              {suggestions.map(product => (
                <li 
                  key={product.id}
                  onClick={() => handleSuggestionClick(product.name)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-gray-800"
                >
                  {getHighlightedText(product.name, searchQuery)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;