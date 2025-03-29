import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
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
    filter = null, 
    sort = 'relevance'
  ) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const effectiveCategoryId = categoryId || selectedCategory;
  
      const getAllDescendantCategories = (categoryId) => {
        const findDescendants = (catId) => {
          const category = categories.find(c => c.id === catId);
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
        .eq('status', true)
        .range((page - 1) * pageSize, page * pageSize - 1);
      
      // Apply category filtering
      if (effectiveCategoryId) {
        const descendantCategories = getAllDescendantCategories(effectiveCategoryId);
        query = query.in('category', descendantCategories);
      }

      // Apply discount filtering
      if (filter === 'discount') {
        query = query.gt('discount', 0);
      }
  
      // Apply sorting
      switch(sort) {
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
  
      const { data, count, error } = await query;
  
      if (error) throw error;
  
      if (data) {
        setProducts(data);
        setPagination({
          page,
          pageSize,
          totalProducts: count || 0
        });
        setSortOption(sort);
        
        // Preserve the selected category when changing pages
        if (effectiveCategoryId) {
          setSelectedCategory(effectiveCategoryId);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError({
        message: 'Failed to load products',
        details: err.message
      });
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [categories, selectedCategory]);

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
  }, []);
  return (
    <ProductContext.Provider value={{
      categories,
      products,
      filteredProducts,
      pagination,
      viewMode,
      setViewMode,
      sortOption,
      fetchProducts,
      isLoading,
      isCatLoading,
      error,
      selectedCategory,
      setSelectedCategory,
      clearError
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);