import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import supabase from '../utils/supabase';
import { useShoppingMode } from './ShoppingModeContext';
import { calculateProductScore } from '../utils/helper';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 40,
    totalProducts: 0
  });
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('relevance');
  const [isLoading, setIsLoading] = useState(true);
  const [isCatLoading, setIsCatLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use ref to track the latest fetch call to prevent race conditions
  const lastFetchId = useRef(0);
  
  // Get the current mode from ShoppingModeContext
  const { isWholesaleMode } = useShoppingMode();

  // Fetch and sort categories
  const fetchCategories = useCallback(async () => {
    setIsCatLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      if (data) {
        // Organize categories into a tree structure
        const categoriesTree = organizeCategories(data);
        setCategories(categoriesTree);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError({
        message: 'Failed to load categories',
        details: err.message
      });
    } finally {
      setIsCatLoading(false);
    }
  }, []);

  // Fetch and sort products - wrap in useCallback with stable dependencies
  const fetchProducts = useCallback(async (
    page = 1, 
    pageSize = 40, 
    categoryId = null, 
    sort = null, 
    filter = null,
    search = null
  ) => {
    setIsLoading(true);
    setError(null);
    
    // Generate unique ID for this fetch request to handle race conditions
    const fetchId = ++lastFetchId.current;
  
    try {
      const effectiveCategoryId = categoryId !== undefined ? categoryId : selectedCategory;
      const effectiveSearch = search !== undefined ? search : searchQuery;
      const effectiveSort = sort || sortOption;
  
      const getAllDescendantCategories = (categoryId) => {
        if (!categoryId) return [];
        
        const findDescendants = (catId) => {
          const findCategory = (cats, id) => {
            for (const cat of cats) {
              if (cat.id === id) return cat;
              if (cat.children && cat.children.length > 0) {
                const found = findCategory(cat.children, id);
                if (found) return found;
              }
            }
            return null;
          };
          
          const category = findCategory(categories, catId);
          if (!category) return [catId];
          
          const descendants = [catId];
          if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
              descendants.push(...findDescendants(child.id));
            });
          }
          
          return descendants;
        };
        
        return findDescendants(categoryId);
      };
  
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .in('status', [1, 2]); // Updated to use .in() for status filtering
      
      // Apply wholesale filter if in wholesale mode
      if (isWholesaleMode) {
        query = query.gt('wholesale_price', 0); // Only products with wholesale price > 0
      }
      
      // Apply category filtering
      if (effectiveCategoryId) {
        const descendantCategories = getAllDescendantCategories(effectiveCategoryId);
        if (descendantCategories.length > 0) {
          query = query.in('category', descendantCategories);
        }
      }
  
      // Apply discount filtering
      if (filter === 'discount') {
        query = query.gt('discount', 0);
      }
      
    // Apply search with prioritization
    if (effectiveSearch && effectiveSearch.trim() !== '') {
      const terms = effectiveSearch.trim().split(/\s+/).filter(term => term.length > 0);
      
      if (terms.length > 0) {
        // Create search conditions
        let searchConditions = [];
        
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
            searchConditions.push(`description.ilike.%${variantLower}%`);
            searchConditions.push(`upc.ilike.%${variantLower}%`);
          });
        });
        
        query = query.or(searchConditions.join(','));
        
        // We need to get ALL matching products for client-side sorting
        const { data: allProducts, count, error: searchError } = await query;
        
        if (searchError) throw searchError;
        
        // Get main keyword for prioritization
        let mainKeyword = terms[0];
        if (terms.length > 1) {
          const potentialBrands = terms.filter(term => term.length >= 4);
          if (potentialBrands.length > 0) {
            mainKeyword = potentialBrands[0];
          }
        }
        
        // Sort by relevance
        const sortedProducts = allProducts.sort((a, b) => {
          const scoreA = calculateProductScore(a, terms, mainKeyword);
          const scoreB = calculateProductScore(b, terms, mainKeyword);
          return scoreB - scoreA;
        });
        
        // Apply pagination manually
        const paginatedProducts = sortedProducts.slice(
          (page - 1) * pageSize, 
          page * pageSize
        );
        
        // Update state
        if (fetchId === lastFetchId.current) {
          setProducts(paginatedProducts);
          setPagination({
            page,
            pageSize,
            totalProducts: count || 0
          });
          setSortOption(effectiveSort);
          
          if (categoryId !== null && categoryId !== undefined) {
            setSelectedCategory(categoryId);
          }
          
          if (search !== null && search !== undefined) {
            setSearchQuery(search);
          }
        }
        
        setIsLoading(false);
        return; // Exit early since we've handled everything
      }
    }
  
      // Apply sorting
      switch(effectiveSort) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'discount':
          query = query.order('discount', { ascending: false });
          break;
        default:
          // query = query.order('created_at', { ascending: false });
      }
      
      // Apply pagination last
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
  
      const { data, count, error } = await query;
  
      if (error) throw error;
      
      // Only update state if this is still the most recent fetch
      if (fetchId === lastFetchId.current && data) {
        setProducts(data);
        setPagination({
          page,
          pageSize,
          totalProducts: count || 0
        });
        setSortOption(effectiveSort);
        
        // Preserve the selected category when changing pages
        if (categoryId !== null && categoryId !== undefined) {
          setSelectedCategory(categoryId);
        }
        
        // Update search state if explicitly passed
        if (search !== null && search !== undefined) {
          setSearchQuery(search);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // Only update error state if this is still the most recent fetch
      if (fetchId === lastFetchId.current) {
        setError({
          message: 'Failed to load products',
          details: err.message
        });
        setProducts([]);
      }
    } finally {
      // Only update loading state if this is still the most recent fetch
      if (fetchId === lastFetchId.current) {
        setIsLoading(false);
      }
    }
  }, [categories, selectedCategory, searchQuery, sortOption, isWholesaleMode]); // Added isWholesaleMode dependency

  // Helper to organize categories into a tree
  const organizeCategories = (categories) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // First pass: create map of all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
      if (cat.parent_id) {
        const parentCategory = categoryMap.get(cat.parent_id);
        if (parentCategory) {
          parentCategory.children.push(categoryMap.get(cat.id));
        }
      } else {
        rootCategories.push(categoryMap.get(cat.id));
      }
    });

    return rootCategories;
  };

  // Reset error state
  const clearError = () => {
    setError(null);
  };

  // Reload products when mode changes
  useEffect(() => {
    if (categories.length > 0) {
      fetchProducts(pagination.page, pagination.pageSize);
    }
  }, [isWholesaleMode, categories.length]);

  // Initial fetch effect
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);
  
  return (
    <ProductContext.Provider value={{
      categories,
      products,
      filteredProducts,
      pagination,
      viewMode,
      setViewMode,
      sortOption,
      setSortOption,
      fetchProducts,
      isLoading,
      isCatLoading,
      error,
      selectedCategory,
      setSelectedCategory,
      clearError,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);