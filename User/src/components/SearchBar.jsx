import React, { useState, useEffect, useRef } from 'react';
import { Loader2, PackageX, Search } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import supabase from '../utils/supabase';
import { useProductContext } from '../context/ProductContext';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchProducts, setSearchQuery } = useProductContext();

  // Debounce search to reduce unnecessary API calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 1) {
        fetchProductSuggestions();
      } else {
        setProductSuggestions([]);
        setIsDropdownVisible(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Handle clicks outside the search dropdown
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

  const fetchProductSuggestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`description.ilike.%${searchTerm}%,upc.ilike.%${searchTerm}%`)
        .limit(3);

      if (data) {
        setProductSuggestions(data);
        setIsDropdownVisible(true);
      }
    } catch (error) {
      console.error('Error fetching product suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    navigate(`/products/${productId}`);
    setSearchTerm('');
    setProductSuggestions([]);
    setIsDropdownVisible(false);
  };

  const handleViewAllProducts = () => {
    // Set the search query in context directly
    setSearchQuery(searchTerm);
    
    // Close the dropdown
    setIsDropdownVisible(false);
    
    // If we're already on the home page, use a URL param to force a refresh
    if (location.pathname === '/' || location.pathname === '/products') {
      // Use search params to force refresh
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      // Otherwise navigate to home with search params
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    }
    
    // Clear the search input
    setSearchTerm('');
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative flex items-center bg-white rounded-xs overflow-hidden">
        <input 
          type="text" 
          placeholder="Search..." 
          className="w-full p-2 pl-4 text-black outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (productSuggestions.length > 0) {
              setIsDropdownVisible(true);
            }
          }}
        />
        
        {isLoading && (
          <div className="absolute right-0 top-0 bottom-0 text-red-600 p-2 px-4 transition">
            <Loader2 className="animate-spin" size={24} />
          </div>
        )}
      </div>
      
      {/* Product Suggestions or No Results */}
      {isDropdownVisible && (
        <div className="absolute z-10 w-full bg-white border rounded-xs shadow-lg mt-1 max-h-96 overflow-y-auto">
          {productSuggestions.length > 0 && searchTerm ? (
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
                      {product.description}
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