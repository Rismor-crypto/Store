// src/components/FilterModal.jsx
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import CategoryContainer from './CategoryContainer';
import { useProductContext } from '../context/ProductContext';

const FilterModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { fetchProducts } = useProductContext();

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReset = () => {
    // Reset to default view (all products)
    fetchProducts();
    setIsOpen(false);
  };

  return (
    <>
      <button 
        className="md:hidden flex items-center justify-center w-full p-3 bg-gray-100 rounded-xs mb-4 text-gray-700 hover:bg-gray-200 transition"
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
            className="bg-white w-full max-h-[80%] rounded-t-lg overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Filter Categories</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-red-500 transition"
                >
                  Reset
                </button>
                <button 
                  onClick={handleClose}
                  className="text-gray-600 hover:text-red-500 transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Category Container */}
            <div className="p-4">
              <CategoryContainer isMobile={true} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterModal;