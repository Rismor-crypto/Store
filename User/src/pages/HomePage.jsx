import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useLocation, useSearchParams } from 'react-router-dom';
import CategoryContainer from '../components/CategoryContainer';
import ProductGrid from '../components/ProductGrid';
import FilterModal from '../components/FilterModal';
import { useProductContext } from '../context/ProductContext';
import { Loader2, Search, X } from 'lucide-react';
import SpecialOffersSection from '../components/SpecialOfferSection';

const HomePage = () => {
  const { 
    isLoading, 
    categories, 
    fetchProducts, 
    selectedCategory, 
    isCatLoading, 
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    sortOption
  } = useProductContext();
  const { categoryId } = useParams();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [showSpecialOffers, setShowSpecialOffers] = useState(true);
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const findCategoryById = useCallback((categories, targetId) => {
    for (let category of categories) {
      if (category.id === targetId) return category;
      
      if (category.children) {
        const foundInChildren = category.children.find(child => child.id === targetId);
        if (foundInChildren) return foundInChildren;
        
        for (let child of category.children) {
          const deepSearch = findCategoryById([child], targetId);
          if (deepSearch) return deepSearch;
        }
      }
    }
    return null;
  }, []);

  // Process URL search parameters only once when component mounts
  useEffect(() => {
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchQuery(decodeURIComponent(urlSearchTerm));
    }
  }, [searchParams, setSearchQuery]);

  // Main effect for fetching products with correct parameters
  useEffect(() => {
    if (!categories.length) return; // Wait for categories to load

    // Determine if we're on the offers page
    const isOffersPage = location.pathname === '/offers';
    setShowSpecialOffers(!isOffersPage && !searchQuery);

    let fetchParams = { 
      page: 1, 
      pageSize: 40,
      sort: sortOption,
      filter: isOffersPage ? 'discount' : null
    };

    // Only set category ID if valid
    if (categoryId || selectedCategory) {
      const targetCategoryId = categoryId || selectedCategory;
      const foundCategory = findCategoryById(categories, targetCategoryId);
      
      if (foundCategory) {
        fetchParams.categoryId = foundCategory.id;
      }
    }
    
    // Use a timeout to ensure state changes have settled
    const timer = setTimeout(() => {
      
      fetchProducts(
        fetchParams.page, 
        fetchParams.pageSize, 
        fetchParams.categoryId, 
        fetchParams.sort,
        fetchParams.filter,
        searchQuery // Always include current search query
      );
      
      setInitialFetchDone(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [
    categories, 
    categoryId, 
    location.pathname, 
    searchQuery, 
    fetchProducts, 
    findCategoryById, 
    selectedCategory, 
    sortOption
  ]);
  
  const clearSearch = () => {
    setSearchQuery('');
  };

  if ((isLoading || isCatLoading) && !initialFetchDone) {
    return (
      <div className="flex justify-center items-center h-screen -mt-20">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  return (
    <main className='font-noto'>
      <div className="mx-auto px-4 py-6">
        
        <FilterModal />
        
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="hidden md:block w-full md:w-1/4">
            <CategoryContainer />
          </div>
          
          <div className="w-full md:w-3/4">
          {searchQuery && (
          <div className="mb-6 p-3 bg-gray-100 rounded flex items-center justify-between">
            <div className="flex items-center">
              <Search className="mr-2 text-red-600" size={20} />
              <span className="font-medium">Search results for: "{searchQuery}"</span>
            </div>
            <button 
              onClick={clearSearch}
              className="flex items-center text-gray-600 hover:text-red-600"
            >
              <X size={18} className="mr-1" />
              <span>Clear</span>
            </button>
          </div>
        )}
            {showSpecialOffers && <SpecialOffersSection />}
            <ProductGrid />
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;