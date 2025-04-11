import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';

const Pagination = ({ currentCategory }) => {
  const { pagination, fetchProducts, selectedCategory, sortOption } = useProductContext();
  const { page, pageSize, totalProducts } = pagination;
  
  const totalPages = Math.ceil(totalProducts / pageSize);
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      // Use the currentCategory prop if provided, otherwise fall back to selectedCategory from context
      const categoryToUse = currentCategory !== undefined ? currentCategory : selectedCategory;
      
      // Call fetchProducts with all necessary parameters to maintain state
      fetchProducts(
        newPage,         // page number
        pageSize,        // page size
        categoryToUse,   // category ID
        sortOption,      // sorting option
        null,            // filter (null for normal filtering)
        undefined        // search (undefined to use current search state)
      );
    }
  };
  
  // Generate page number buttons with ellipsis
  const renderPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(
      <button
        key={1}
        onClick={() => handlePageChange(1)}
        className={`
          w-10 h-10 flex items-center justify-center rounded-xs transition-all duration-300
          ${page === 1
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
          mx-1
        `}
      >
        1
      </button>
    );
    
    // Add first ellipsis if needed
    if (page > 4) {
      pageNumbers.push(
        <span key="ellipsis1" className="mx-1 w-10 h-10 flex items-center justify-center">
          . . .
        </span>
      );
    }
    
    // Add pages around current page
    for (let i = Math.max(2, page - 1); i <= Math.min(page + 1, totalPages - 1); i++) {
      // Skip if we're too close to the start or end
      if (i <= 1 || i >= totalPages) continue;
      
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`
            w-10 h-10 flex items-center justify-center rounded-xs transition-all duration-300
            ${page === i
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            mx-1
          `}
        >
          {i}
        </button>
      );
    }
    
    // Add last ellipsis if needed
    if (page < totalPages - 3) {
      pageNumbers.push(
        <span key="ellipsis2" className="mx-1 w-10 h-10 flex items-center justify-center">
          . . .
        </span>
      );
    }
    
    // Always show last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`
            w-10 h-10 flex items-center justify-center rounded-xs transition-all duration-300
            ${page === totalPages
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            mx-1
          `}
        >
          {totalPages}
        </button>
      );
    }
    
    return pageNumbers;
  };
  
  // Don't render pagination if there's only 1 page or no pages
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-center mt-6 mb-6">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page === 1}
        className={`
          p-2 rounded-xs transition-all duration-300
          ${page === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white shadow-md hover:bg-gray-50 text-gray-700'}
          flex items-center justify-center
        `}
      >
        <ChevronLeft size={20} />
      </button>
      
      {/* Page Numbers */}
      <div className="flex mx-2">
        {renderPageNumbers()}
      </div>
      
      {/* Next Button */}
      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page === totalPages}
        className={`
          p-2 rounded-xs transition-all duration-300
          ${page === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white shadow-md hover:bg-gray-50 text-gray-700'}
          flex items-center justify-center
        `}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default Pagination;