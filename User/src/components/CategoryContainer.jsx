import React, { useEffect, useState } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';

const CategoryItem = ({ 
  category, 
  depth = 0, 
  selectedCategory, 
  onCategorySelect,
  expandedCategories,
  setExpandedCategories,
  parentId = null,
  isMobile = false,
  onCategorySelected = null,
  allCategories
}) => {
  const navigate = useNavigate();
  const hasChildren = category.children && category.children.length > 0;
  const isExpanded = expandedCategories.includes(category.id);

  const handleCategoryClick = () => {
    // Always navigate and select this category (whether it has children or not)
    navigate(`/products/category/${category.id}`);
    onCategorySelect(category.id);
    
    // If this category has children, also expand it
    if (hasChildren && !isExpanded) {
      setExpandedCategories([...expandedCategories, category.id]);
    }
    
    // Close modal if in mobile view
    if (isMobile && onCategorySelected) {
      onCategorySelected();
    }
  };

  const toggleExpansion = () => {
    if (isExpanded) {
      setExpandedCategories(expandedCategories.filter(id => id !== category.id));
    } else {
      setExpandedCategories([...expandedCategories, category.id]);
    }
  };

  const handleChevronClick = (e) => {
    // Stop event propagation to prevent category click handler
    e.stopPropagation();
    toggleExpansion();
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
              ? 'opacity-100 py-2' 
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
              expandedCategories={expandedCategories}
              setExpandedCategories={setExpandedCategories}
              parentId={category.id}
              isMobile={isMobile}
              onCategorySelected={onCategorySelected}
              allCategories={allCategories}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CategoryContainer = ({ 
  isMobile = false, 
  onCategorySelected = null,
  expandedCategories: externalExpandedCategories = null,
  setExpandedCategories: externalSetExpandedCategories = null
}) => {
  const { categories, selectedCategory, setSelectedCategory, setSearchQuery } = useProductContext();
  const navigate = useNavigate();
  
  // Use external state if provided, otherwise use internal state
  const [internalExpandedCategories, setInternalExpandedCategories] = useState([]);
  
  // Determine which state to use
  const expandedCategories = externalExpandedCategories !== null ? 
    externalExpandedCategories : internalExpandedCategories;
  
  const setExpandedCategories = externalSetExpandedCategories !== null ?
    externalSetExpandedCategories : setInternalExpandedCategories;

  // When on mobile, but not receiving external expansion state, initialize with top-level categories expanded
  useEffect(() => {
    if (isMobile && externalExpandedCategories === null && categories.length > 0 && internalExpandedCategories.length === 0) {
      // Only include the top-level categories 
      const topLevelIds = categories.map(category => category.id);
      setInternalExpandedCategories(topLevelIds);
    }
  }, [categories, isMobile, internalExpandedCategories.length, externalExpandedCategories]);

  // Auto-expand parent of selected category only when category selection changes
  const [lastSelectedCategory, setLastSelectedCategory] = useState(null);
  
  useEffect(() => {
    // Only run this effect when the selected category actually changes
    if (selectedCategory !== lastSelectedCategory) {
      setLastSelectedCategory(selectedCategory);
      
      if (selectedCategory) {
        const findParentCategory = (cats, targetId, parentId = null) => {
          for (const cat of cats) {
            if (cat.id === targetId) {
              return parentId;
            }
            
            if (cat.children && cat.children.length > 0) {
              // Check direct children first
              for (const child of cat.children) {
                if (child.id === targetId) {
                  return cat.id;
                }
              }
              
              // Then check deeper nested children
              for (const child of cat.children) {
                const result = findParentCategory([child], targetId, cat.id);
                if (result) return result;
              }
            }
          }
          return null;
        };
        
        const parentCategoryId = findParentCategory(categories, selectedCategory);
        if (parentCategoryId && !expandedCategories.includes(parentCategoryId)) {
          setExpandedCategories(prev => [...prev, parentCategoryId]);
        }
      }
    }
  }, [selectedCategory, categories, lastSelectedCategory]);

  // Function to reset when "All Products" is clicked
  const handleAllProductsClick = () => {
    setSelectedCategory(null); // Clear selected category
    setSearchQuery(''); // Clear search query
    
    // On mobile, keep only top-level expanded
    if (isMobile) {
      const topLevelIds = categories.map(category => category.id);
      setExpandedCategories(topLevelIds);
    } else {
      setExpandedCategories([]);
    }
    
    navigate('/products');
    
    // If we're in mobile mode and have a callback, call it to close the modal
    if (isMobile && onCategorySelected) {
      onCategorySelected();
    }
  };

  const handleCategorySelect = (categoryId) => {
    // When a category is selected, clear any search query
    setSearchQuery('');
    
    // Set selected category
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

      {/* Category Tree Container */}
      <div className="space-y-2 pr-2 overflow-visible">
        {categories.map(category => (
          <CategoryItem
            key={category.id}
            category={category}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            expandedCategories={expandedCategories}
            setExpandedCategories={setExpandedCategories}
            isMobile={isMobile}
            onCategorySelected={onCategorySelected}
            allCategories={categories}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryContainer;