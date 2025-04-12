import React from 'react';
import { useProductContext } from '../context/ProductContext';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import ProductHeader from './ProductHeader';

const ProductGrid = () => {
  const { products, viewMode, categories, selectedCategory, isLoading } = useProductContext();

  const findCategoryById = (categoryId, categoriesList) => {
    for (let category of categoriesList) {
      if (category.id === categoryId) {
        return category;
      }
      
      if (category.children && category.children.length > 0) {
        const foundInChildren = category.children.find(child => child.id === categoryId);
        if (foundInChildren) {
          return foundInChildren;
        }

        for (let child of category.children) {
          const deepSearchResult = findCategoryById(categoryId, [child]);
          if (deepSearchResult) {
            return deepSearchResult;
          }
        }
      }
    }

    return null;
  };

  const selectedCategoryInfo = selectedCategory 
    ? findCategoryById(selectedCategory, categories) 
    : null;

  return (
    <div className="">
      <ProductHeader />
      
      {/* Category Heading */}
      {selectedCategoryInfo && (
        <div className="bg-white border border-gray-200 p-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {selectedCategoryInfo.name}
          </h2>
        </div>
      )}
     
      {products.length === 0 ? (
        <div className="flex justify-center items-center h-96 bg-white border border-gray-200">
          <p className="text-gray-500 text-xl">No products found</p>
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 bg-white gap-2 mt-2' 
            : 'flex flex-col bg-white mt-2 gap-2'
          }`}
        >
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              viewMode={viewMode} 
            />
          ))}
        </div>
      )}
     
      <Pagination currentCategory={selectedCategory} />
    </div>
  );
};

export default ProductGrid;