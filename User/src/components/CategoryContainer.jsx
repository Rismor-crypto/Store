import React, { useCallback, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

const CategoryItem = ({ category, depth = 0, selectedCategory }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = category.children && category.children.length > 0;


  const isAncestorOfSelected = useCallback(() => {
    if (!selectedCategory || category.id === selectedCategory) return false;
    
    const checkDescendants = (currentCategory) => {
      if (!currentCategory.children) return false;
      
      // Check direct children
      if (currentCategory.children.some(child => child.id === selectedCategory)) {
        return true;
      }
      
      // Check deeper descendants
      return currentCategory.children.some(child => checkDescendants(child));
    };
    
    return checkDescendants(category);
  }, [selectedCategory, category]);

  // Auto-expand if selected category is a descendant (but not self)
  useEffect(() => {
    if (selectedCategory && isAncestorOfSelected()) {
      setIsExpanded(true);
    }
  }, [selectedCategory, isAncestorOfSelected]);

  const handleCategoryClick = (e) => {
    // Navigate using category ID
    navigate(`/products/category/${category.id}`);
  };

  const handleChevronClick = (e) => {
    // Stop event propagation to prevent navigation
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`pl-${depth}`}>
      <div
        className={`
          flex items-center gap-2 py-2 cursor-pointer 
          transition-colors duration-200 ease-in-out
          ${selectedCategory === category.id 
            ? 'text-red-600' 
            : 'text-gray-700 hover:text-red-600'}
        `}
        onClick={handleCategoryClick}
      >
        <span className={`text-sm flex-grow ${depth > 0 ? 'pl-2' : ''}`}>
          {category.name}
        </span>
        {hasChildren && (
          <div 
            onClick={handleChevronClick} 
            className="transition-transform duration-300 ease-in-out"
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </div>
        )}
      </div>
     
      {hasChildren && (
        <div 
          className={`
            pl-4 overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded 
              ? 'max-h-screen opacity-100 py-2' 
              : 'max-h-0 opacity-0 py-0'}
          `}
        >
          {isExpanded && category.children.map(child => (
            <CategoryItem
              key={child.id}
              category={child}
              depth={depth + 1}
              selectedCategory={selectedCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryContainer = () => {
  const { categories, fetchProducts, selectedCategory, setSelectedCategory, setSearchQuery } = useProductContext();
  const navigate = useNavigate();

  const handleAllProductsClick = () => {
    setSelectedCategory(null); // Clear selected category
    setSearchQuery(''); // Clear search query
    navigate('/products');
  };

  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xs">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Categories</h2>
     
      {/* All Products Button */}
      <div
        className={`
          mb-4 py-2 cursor-pointer 
          transition-colors duration-200 ease-in-out
          ${selectedCategory === null 
            ? 'text-red-600' 
            : 'text-gray-700 hover:text-red-600'}
        `}
        onClick={handleAllProductsClick}
      >
        <span className="text-sm font-medium">All Products</span>
      </div>

      {/* Category Tree */}
      <div className="space-y-2">
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            selectedCategory={selectedCategory}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryContainer;