```jsx


// Similarly update the fetchProducts function in your products list component
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
  
  // Generate unique ID for this fetch request
  const fetchId = ++lastFetchId.current;

  try {
    const effectiveCategoryId = categoryId !== undefined ? categoryId : selectedCategory;
    const effectiveSearch = search !== undefined ? search : searchQuery;
    const effectiveSort = sort || sortOption;

    // Handle category descendants
    const getAllDescendantCategories = (categoryId) => {
      if (!categoryId) return [];
      
      // Your existing function for finding descendant categories
      // ...
    };

    // Base query
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .in('status', [1, 2]);
    
    // Apply wholesale filter if needed
    if (isWholesaleMode) {
      query = query.gt('wholesale_price', 0);
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
    

    
    // If we get here, there's no search or it's empty
    // Continue with regular sorting and pagination
    
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
        // Your default sorting
    }
    
    // Apply pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, count, error } = await query;

    if (error) throw error;
    
    // Update state if this is still the latest fetch
    if (fetchId === lastFetchId.current && data) {
      setProducts(data);
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
  } catch (err) {
    console.error('Error fetching products:', err);
    if (fetchId === lastFetchId.current) {
      setError({
        message: 'Failed to load products',
        details: err.message
      });
      setProducts([]);
    }
  } finally {
    if (fetchId === lastFetchId.current) {
      setIsLoading(false);
    }
  }
}, [categories, selectedCategory, searchQuery, sortOption, isWholesaleMode]);

