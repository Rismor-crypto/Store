import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import CategoryContainer from '../components/CategoryContainer';
import ProductGrid from '../components/ProductGrid';
import FilterModal from '../components/FilterModal';
import { useProductContext } from '../context/ProductContext';
import { Loader2, Tag } from 'lucide-react';
import { ArrowRight } from 'lucide-react';

const SpecialOffersSection = () => {
  const { products } = useProductContext();
  const specialOffers = products.filter(product => product.discount > 0);

  return (
    <div className="bg-red-400 text-white py-6 md:py-8 shadow-lg mb-8 rounded-xs">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Left Section with Icon and Title */}
          <div className="flex items-center space-x-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Tag className="text-white" size={32} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                Exclusive Special Offers
              </h2>
              <p className="text-sm md:text-base text-white/80 mt-1">
                Limited time deals you won't want to miss!
              </p>
            </div>
          </div>

          {/* Right Section with CTA and Countdown */}
          <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">


            <Link 
              to="/offers" 
              className="flex items-center justify-center space-x-2 
                         bg-white text-red-600 px-6 py-3 
                         rounded-full font-semibold 
                         hover:bg-gray-100 transition 
                         transform hover:-translate-y-1 
                         shadow-lg hover:shadow-xl"
            >
              <span>View All Offers</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomePage = () => {
  const { 
    isLoading, 
    categories, 
    fetchProducts, 
    selectedCategory, 
    isCatLoading, 
    setSelectedCategory 
  } = useProductContext();
  const { categoryId } = useParams();
  const location = useLocation();
  const [showSpecialOffers, setShowSpecialOffers] = useState(true);

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

  useEffect(() => {
    // Determine if we're on the offers page
    const isOffersPage = location.pathname === '/offers';
    setShowSpecialOffers(!isOffersPage);

    if (categories.length > 0) {
      let fetchParams = { page: 1, pageSize: 40 };

      if (isOffersPage) {
        // Fetch only products with discounts
        fetchParams.filter = 'discount';
      } else if (categoryId || selectedCategory) {
        const foundCategory = findCategoryById(categories, categoryId || selectedCategory);
        
        if (foundCategory) {
          fetchParams.categoryId = foundCategory.id;
        }
      }

      fetchProducts(
        fetchParams.page, 
        fetchParams.pageSize, 
        fetchParams.categoryId, 
        fetchParams.filter
      );
    }
  }, [categories, categoryId, location.pathname]);
  
  if (isLoading || isCatLoading) {
    return (
      <div className="flex justify-center items-center h-screen -mt-20">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  return (
    <main>
      <div className="mx-auto px-4 py-6">
        
        <FilterModal />
        
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="hidden md:block w-full md:w-1/4">
            <CategoryContainer />
          </div>
          
          <div className="w-full md:w-3/4">
        {showSpecialOffers && <SpecialOffersSection />}
            <ProductGrid />
          </div>
        </div>
      </div>
    </main>
  );
};

export default HomePage;