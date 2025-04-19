import React, { useState, useRef, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import CategoryContainer from './CategoryContainer';

const FilterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchProducts, categories } = useProductContext();
  const modalContentRef = useRef(null);
  const [expandedCategories, setExpandedCategories] = useState([]);

  // Function to get ONLY top-level category IDs for initial expansion
  const getTopLevelExpansion = () => {
    // Only include the top-level categories, not their children
    return categories.map(category => category.id);
  };

  // When modal opens, expand only top-level categories and disable body scrolling
  useEffect(() => {
    if (isOpen) {
      // Only expand top-level categories by default
      setExpandedCategories(getTopLevelExpansion());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, categories]);

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = ''; // Re-enable body scrolling
  };

  const handleReset = () => {
    // Reset to default view (all products)
    fetchProducts();
    // Only expand top-level categories
    setExpandedCategories(getTopLevelExpansion());
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  // Prevent click events on modal content from bubbling up
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <button 
        type="button"
        className="md:hidden flex items-center justify-center w-full p-3 bg-red-600 rounded-xs mb-4 text-white transition"
        onClick={() => setIsOpen(true)}
      >
        <Filter className="mr-2" size={20} /> 
        <span className="text-sm">Filter Categories</span>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end"
          onClick={handleClose}
        >
          <div 
            ref={modalContentRef}
            className="bg-white w-full max-h-[80%] rounded-t-lg overflow-y-auto shadow-xl"
            onClick={handleModalContentClick}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-800">Filter Categories</h2>
              <div className="flex space-x-2">
                <button 
                  type="button"
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-red-500 transition"
                >
                  Reset
                </button>
                <button 
                  type="button"
                  onClick={handleClose}
                  className="text-gray-600 hover:text-red-500 transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Category Container */}
            <div className="p-4">
              <CategoryContainer 
                isMobile={true} 
                onCategorySelected={handleClose}
                expandedCategories={expandedCategories}
                setExpandedCategories={setExpandedCategories}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterModal;