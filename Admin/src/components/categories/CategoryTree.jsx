import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash, Plus } from 'lucide-react';

const CategoryItem = ({ 
  category, 
  onEdit, 
  onDelete, 
  onAdd,
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [delLoading, setDelLoading] = useState(false);
  
  const canAddSubcategory = level < 2;
  
  const toggleExpand = () => {
    if (category.children && category.children.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };
  
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteAlert(true);
  };
  
  const confirmDelete = async () => {
    setDelLoading(true);
    await onDelete(category.id);
    setDelLoading(false);
    setShowDeleteAlert(false);
  };
  
  const cancelDelete = () => {
    setShowDeleteAlert(false);
  };
  
  // Count all subcategories
  const countSubcategories = (cat) => {
    if (!cat.children || cat.children.length === 0) return 0;
    
    let count = cat.children.length;
    for (const child of cat.children) {
      count += countSubcategories(child);
    }
    return count;
  };
  
  const subcategoryCount = countSubcategories(category);
  
  return (
    <div>
      <div 
        className="flex items-center py-2 px-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
        onClick={toggleExpand}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        <div className="flex-grow flex items-center">
          {category.children && category.children.length > 0 ? (
            <button 
              className="mr-1 text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          ) : (
            <span className="ml-5"></span>
          )}
          
          <span className="font-medium">{category.name}</span>
        </div>
        
        <div className="flex space-x-2">
          {canAddSubcategory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(category.id);
              }}
              className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none cursor-pointer"
              title="Add subcategory"
            >
              <Plus size={16} />
            </button>
          )}
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="p-1 text-gray-500 hover:text-blue-600 focus:outline-none cursor-pointer"
            title="Edit category"
          >
            <Edit size={16} />
          </button>
          
          <button
            onClick={handleDeleteClick}
            className="p-1 text-gray-500 hover:text-red-500 focus:outline-none cursor-pointer"
            title="Delete category"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      
      {/* Delete confirmation alert */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete "{category.name}"?
            </p>
            
            {(category.children && category.children.length > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                <p className="text-amber-800 text-sm">
                  Warning: This will also delete {subcategoryCount} subcategories
                  and all associated products.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none"
              >
                {delLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {isExpanded && category.children && category.children.length > 0 && (
        <div>
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
const CategoryTree = ({ categories, onEdit, onDelete, onAdd }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 py-2 px-3 border-b border-gray-200 font-medium text-gray-700">
        All Categories
      </div>
      {categories.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No categories yet
        </div>
      ) : (
        categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            onEdit={onEdit}
            onDelete={onDelete}
            onAdd={onAdd}
          />
        ))
      )}
    </div>
  );
};

export default CategoryTree;