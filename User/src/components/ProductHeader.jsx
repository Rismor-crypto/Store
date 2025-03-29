import React from 'react';
import { Grid, List } from 'lucide-react';
import { useProductContext } from '../context/ProductContext';

const ProductHeader = () => {
    const { 
      pagination, 
      fetchProducts, 
      viewMode, 
      setViewMode, 
      sortOption 
    } = useProductContext();
  
    const handleSortChange = (e) => {
      const selectedSort = e.target.value;
      fetchProducts(
        pagination.page, 
        pagination.pageSize, 
        null, 
        selectedSort
      );
    };
  
    const handlePageSizeChange = (e) => {
      const selectedPageSize = parseInt(e.target.value);
      fetchProducts(
        1, 
        selectedPageSize, 
        null, 
        sortOption
      );
    };
  
    return (
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row justify-between items-center p-4 bg-white border border-gray-200 rounded-xs">
        {/* Product Count */}
        <div className="hidden md:block w-full md:w-auto text-center md:text-left mb-4 md:mb-0">
          <span className="text-sm text-gray-600 block">
            Showing {(pagination.page - 1) * pagination.pageSize + 1} -  {' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.totalProducts)} {' '}
            of {pagination.totalProducts} items
          </span>
        </div>
       
        {/* Controls Container */}
        <div className="w-full md:w-auto flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-4">
          {/* View Mode Toggles */}
          <div className="flex items-center bg-gray-100 mb-4 md:mb-0 rounded-xs">
            <button 
              className={`p-2 cursor-pointer rounded-l-xs ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-500 hover:text-red-600'}`}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={20} />
            </button>
            <button 
              className={`p-2 cursor-pointer rounded-r-xs overflow-hidden ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-500 hover:text-red-600'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={20} />
            </button>
          </div>
  
          {/* Controls Wrapper */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full">
            {/* Page Size Selector */}
            <select 
              className="w-full md:w-auto border border-gray-200 p-2 text-sm bg-gray-100 mb-4 md:mb-0 cursor-pointer rounded-xs"
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
            >
              <option value={20}>20 per page</option>
              <option value={40}>40 per page</option>
              <option value={80}>80 per page</option>
            </select>
          
            {/* Sort Selector */}
            <select 
              className="w-full md:w-auto border p-2 text-sm border-gray-200 bg-gray-100 cursor-pointer rounded-xs"
              value={sortOption}
              onChange={handleSortChange}
            >
              <option value="relevance">Sort: Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>
    );
  };

  export default ProductHeader;