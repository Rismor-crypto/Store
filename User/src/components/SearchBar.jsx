import React, { useState, useEffect, useRef } from 'react';
import { Loader2, PackageX, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useProductContext } from '../context/ProductContext';
import { useShoppingMode } from '../context/ShoppingModeContext';
import { calculateProductScore } from '../utils/helper';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search was performed
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { setSearchQuery, setSelectedCategory } = useProductContext();
  const { isWholesaleMode } = useShoppingMode(); 

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 1) {
        fetchProductSuggestions();
        setHasSearched(true); // Mark that a search was performed
      } else {
        setProductSuggestions([]);
        setIsDropdownVisible(false);
        setHasSearched(false); // Reset search status
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

const getPrioritizedResults = async (terms) => {
  let mainKeyword = terms[0];
  
  if (terms.length > 1) {
    const potentialBrands = terms.filter(term => term.length >= 4);
    if (potentialBrands.length > 0) {
      mainKeyword = potentialBrands[0];
    }
  }
  
  let query = supabase
    .from('products')
    .select('*')
    .in('status', [1, 2]);
  
  if (isWholesaleMode) {
    query = query.gt('wholesale_price', 0);
  }
  
  let allSearchConditions = [];
  terms.forEach(term => {
    const variations = new Set();
    variations.add(term);
    
    const withoutHyphens = term.replace(/-/g, '');
    variations.add(withoutHyphens);
    
    if (term.length > 1 && !term.includes('-')) {
      for (let i = 1; i < term.length; i++) {
        variations.add(`${term.substring(0, i)}-${term.substring(i)}`);
      }
    }
    
    variations.forEach(variant => {
      const variantLower = variant.toLowerCase();
      allSearchConditions.push(`description.ilike.%${variantLower}%`);
      allSearchConditions.push(`upc.ilike.%${variantLower}%`);
    });
  });
  
  query = query.or(allSearchConditions.join(','));
  query = query.limit(40); // Get more results for filtering
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  if (!data || data.length === 0) return { data: [] };
  
  // Sort products by score
  const sortedProducts = data.sort((a, b) => {
    const scoreA = calculateProductScore(a, terms, mainKeyword);
    const scoreB = calculateProductScore(b, terms, mainKeyword);
    return scoreB - scoreA; // Descending order
  });
  
  return { data: sortedProducts.slice(0, 5) }; // Return top 5
};

// Update the fetchProductSuggestions function
const fetchProductSuggestions = async () => {
  setIsLoading(true);
  try {
    if (searchTerm && searchTerm.trim() !== '') {
      const terms = searchTerm.trim().split(/\s+/).filter(term => term.length > 0);
      
      if (terms.length > 0) {
        // Get prioritized results using our new function
        const { data } = await getPrioritizedResults(terms);
        setProductSuggestions(data || []);
        setIsDropdownVisible(searchTerm.trim() !== '');
      } else {
        setProductSuggestions([]);
        setIsDropdownVisible(false);
      }
    } else {
      setProductSuggestions([]);
      setIsDropdownVisible(false);
    }
  } catch (error) {
    console.error('Error fetching product suggestions:', error);
    setProductSuggestions([]);
    setIsDropdownVisible(searchTerm.trim() !== '');
  } finally {
    setIsLoading(false);
  }
};

  const handleProductSelect = (productId) => {
    navigate(`/items/${productId}`);
    setSearchTerm('');
    setProductSuggestions([]);
    setIsDropdownVisible(false);
    setHasSearched(false);
  };

  const handleViewAllProducts = () => {
    setSearchQuery(searchTerm);
    setSelectedCategory(null);
    setIsDropdownVisible(false);
    
    if (location.pathname === '/' || location.pathname === '/products') {
      navigate(`/products/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/products/?search=${encodeURIComponent(searchTerm)}`);
    }
    setSearchTerm('');
    setHasSearched(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchTerm.trim() !== '') {
      e.preventDefault();
      handleViewAllProducts();
    }
  };

  const highlightMatches = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;
    
    const terms = searchTerm.trim().split(/\s+/).filter(term => term.length > 0);
    let highlightedText = text;
    
    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
    
    const termsToHighlight = new Set();
    
    terms.forEach(term => {
      termsToHighlight.add(term);
      
      const withoutHyphens = term.replace(/-/g, '');
      termsToHighlight.add(withoutHyphens);
      
      if (term.length > 1 && !term.includes('-')) {
        for (let i = 1; i < term.length; i++) {
          termsToHighlight.add(`${term.substring(0, i)}-${term.substring(i)}`);
        }
      }
    });
    
    termsToHighlight.forEach(term => {
      if (term.length > 0) {
        const safeRegex = escapeRegExp(term);
        const regex = new RegExp(`(${safeRegex})`, 'gi');
        highlightedText = highlightedText.replace(regex, '<span class="bg-yellow-200">$1</span>');
      }
    });
    
    return <span dangerouslySetInnerHTML={{ __html: highlightedText }} />;
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative flex items-center bg-white rounded-xs overflow-hidden">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full p-2 pl-4 text-black outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => {
            // Show dropdown on focus if we have suggestions or if we've searched with no results
            if (productSuggestions.length > 0 || (hasSearched && searchTerm.trim() !== '')) {
              setIsDropdownVisible(true);
            }
          }}
        />
        
        {isLoading && (
          <div className="absolute right-0 top-0 bottom-0 text-red-600 p-2 px-4 transition">
            <Loader2 className="animate-spin" size={24} />
          </div>
        )}
        
        {/* Search button */}
        <button 
          type="button"
          title="Search"
          className="absolute right-0 top-0 bottom-0 text-gray-500 hover:text-red-600 p-2 px-4 transition"
          onClick={handleViewAllProducts}
          disabled={searchTerm.trim() === ''}
        >
          <Search size={24} />
        </button>
      </div>
      
      {/* Product Suggestions or No Results */}
      {isDropdownVisible && (
        <div className="absolute z-10 w-full bg-white border rounded-xs shadow-lg mt-1 max-h-96 overflow-y-auto">
          {productSuggestions.length > 0 ? (
            <>
              {productSuggestions.map((product) => (
                <div 
                  key={product.id} 
                  className="p-2 flex items-center hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleProductSelect(product.id)}
                >
                  <img 
                    src={product.image_url || '/api/placeholder/50/50'} 
                    alt={product.description} 
                    className="w-12 h-12 object-cover mr-4 rounded"
                  />
                  <div>
                    <p className="text-black font-semibold truncate w-full max-w-[300px]">
                      {highlightMatches(product.description, searchTerm)}
                    </p>
                    <p className="text-green-600 font-bold">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              {/* View All Products Button */}
              <div 
                className="p-3 border-t flex items-center justify-center text-red-600 hover:bg-gray-100 cursor-pointer font-medium"
                onClick={handleViewAllProducts}
              >
                <Search className="mr-2" size={18} />
                <span>View all products for "{searchTerm}"</span>
              </div>
            </>
          ) : (
            <div className="p-4 flex items-center justify-center text-gray-500">
              <PackageX className="mr-2" />
              <span>No products found for "{searchTerm}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;