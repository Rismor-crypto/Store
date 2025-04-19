import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';
import CategoryContainer from './CategoryContainer';

const FilterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchProducts, categories } = useProductContext();
  const modalContentRef = useRef(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollThreshold = 20; // Smaller threshold to make it more responsive

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = ''; // Re-enable body scrolling
  };

  const handleReset = () => {
    // Reset to default view (all products)
    fetchProducts();
    setExpandedCategories([]);
    setIsOpen(false);
    document.body.style.overflow = '';
  };

  // When modal opens, disable body scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Find all parent categories that have children
  // Now properly defined outside of event handler and using the categories from context
  const getParentCategories = useCallback(() => {
    return categories.filter(category => category.children && category.children.length > 0);
  }, [categories]);

  // Function to recursively find all category IDs including children at any level
  const getAllCategoryIds = useCallback((categoryList) => {
    let ids = [];
    for (const category of categoryList) {
      ids.push(category.id);
      
      if (category.children && category.children.length > 0) {
        ids = [...ids, ...getAllCategoryIds(category.children)];
      }
    }
    return ids;
  }, []);
  
  // Function to expand a category and all its children
  const expandCategoryWithChildren = useCallback((categoryId) => {
    // Find the category
    const findCategory = (catList, id) => {
      for (const cat of catList) {
        if (cat.id === id) return cat;
        if (cat.children && cat.children.length > 0) {
          const found = findCategory(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const category = findCategory(categories, categoryId);
    if (!category) return [];
    
    // Get all child category IDs
    let allIds = [categoryId];
    if (category.children && category.children.length > 0) {
      allIds = [...allIds, ...getAllCategoryIds(category.children)];
    }
    
    return allIds;
  }, [categories, getAllCategoryIds]);

  // Handle scroll events in the modal content
  const handleScroll = useCallback((e) => {
    const currentScrollY = e.target.scrollTop;
    const isScrollingDown = currentScrollY > lastScrollY;
    
    // If scrolling down more than the threshold
    if (isScrollingDown && (currentScrollY - lastScrollY) > scrollThreshold) {
      const parentCategories = getParentCategories();
      
      let newExpandedCategories = [...expandedCategories];
      let hasChanges = false;
      
      // For each parent category not already expanded
      parentCategories.forEach(category => {
        if (!expandedCategories.includes(category.id)) {
          // Add all children IDs
          const idsToAdd = expandCategoryWithChildren(category.id);
          idsToAdd.forEach(id => {
            if (!newExpandedCategories.includes(id)) {
              newExpandedCategories.push(id);
              hasChanges = true;
            }
          });
        }
      });
      
      if (hasChanges) {
        setExpandedCategories(newExpandedCategories);
      }
    }
    
    setLastScrollY(currentScrollY);
  }, [lastScrollY, expandedCategories, getParentCategories, expandCategoryWithChildren]);

  // Attach scroll listener to modal content when open
  useEffect(() => {
    const modalContentElement = modalContentRef.current;
    
    if (isOpen && modalContentElement) {
      modalContentElement.addEventListener('scroll', handleScroll);
      
      return () => {
        modalContentElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [isOpen, handleScroll]);

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