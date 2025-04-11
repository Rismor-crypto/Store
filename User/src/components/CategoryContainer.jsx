import React, { useCallback, useEffect, useRef } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

const CategoryItem = ({ category, depth = 0, selectedCategory, onCategorySelect }) => {
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

  const handleCategoryClick = () => {
    // Only navigate if this category has no children
    if (!hasChildren) {
      navigate(`/products/category/${category.id}`);
      onCategorySelect(category.id);
    } else {
      // If it has children, just toggle expansion
      setIsExpanded(!isExpanded);
    }
  };

  const handleChevronClick = (e) => {
    // Stop event propagation to prevent category click handler
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Calculate padding based on depth
  const paddingLeft = depth > 0 ? `${depth * 0.5}rem` : '0';

  return (
    <div style={{ paddingLeft }}>
      <div
        className={`
          flex items-center gap-2 py-2 cursor-pointer 
          transition-colors duration-200 ease-in-out
          ${selectedCategory === category.id 
            ? 'text-red-600 font-medium' 
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
              onCategorySelect={onCategorySelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryContainer = () => {
  const { categories, selectedCategory, setSelectedCategory, setSearchQuery } = useProductContext();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Function to reset all category expansions when "All Products" is clicked
  const handleAllProductsClick = () => {
    setSelectedCategory(null); // Clear selected category
    setSearchQuery(''); // Clear search query
    navigate('/products');
    
    // This will force a re-render of all components, resetting their expansion state
    // We could implement a more explicit reset mechanism if needed
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
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
            ? 'text-red-600 font-medium' 
            : 'text-gray-700 hover:text-red-600'}
        `}
        onClick={handleAllProductsClick}
      >
        <span className="text-sm font-medium">All Products</span>
      </div>

      {/* Scrollable Category Tree Container */}
      <div 
        ref={containerRef}
        className="space-y-2 max-h-96 overflow-y-auto pr-2"
      >
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryContainer;