import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import supabase from '../utils/supabase';

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

  // Fetch and sort products
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
        .eq('status', true);
      
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
      
      // Apply search filtering - this is important
      if (effectiveSearch && effectiveSearch.trim() !== '') {
        query = query.or(`description.ilike.%${effectiveSearch}%,upc.ilike.%${effectiveSearch}%`);
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
          query = query.order('created_at', { ascending: false });
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
  }, [categories, selectedCategory, searchQuery, sortOption]);

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