import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronDown, Edit, Trash, Plus, GripVertical, AlertTriangle } from 'lucide-react';

const CategoryItem = ({ 
  category, 
  onEdit, 
  onDelete, 
  onAdd,
  onDrop,
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isDragOverAsChild, setIsDragOverAsChild] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const itemRef = useRef(null);
  const canAddSubcategory = level < 2;
  const canBeParent = level < 2;
  
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
    try {
      setLoading(true);
      await onDelete(category.id);
      setShowDeleteAlert(false);
    } catch (error) {
      console.error("Error deleting category:", error);
    }finally {
      setLoading(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteAlert(false);
  };
  
  // Count all subcategories recursively
  const countSubcategories = (cat) => {
    if (!cat.children || cat.children.length === 0) return 0;
    
    let count = cat.children.length;
    for (const child of cat.children) {
      count += countSubcategories(child);
    }
    return count;
  };
  
  const subcategoryCount = countSubcategories(category);

  // Drag and drop handlers
  const handleDragStart = (e) => {
    e.stopPropagation();
    
    // Store the category ID in the dataTransfer object
    e.dataTransfer.setData("text/plain", JSON.stringify({
      id: category.id,
      name: category.name, 
      level: level
    }));
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
    
    // Add a delay to prevent the immediate collapse
    setTimeout(() => {
      if (itemRef.current) {
        itemRef.current.classList.add('opacity-50');
      }
    }, 0);
  };
  
  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
    setIsDragOverAsChild(false);
    
    if (itemRef.current) {
      itemRef.current.classList.remove('opacity-50');
    }
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseY = e.clientY;
    const threshold = rect.top + (rect.height / 3);
    
    // If mouse is in the top third of the element, highlight as drop target
    if (mouseY < threshold) {
      setIsDragOver(true);
      setIsDragOverAsChild(false);
    } 
    // Otherwise highlight as potential parent (if it can be a parent)
    else if (canBeParent) {
      setIsDragOver(false);
      setIsDragOverAsChild(true);
    }
    
    // Get the dragged item data
    try {
      const data = e.dataTransfer.getData("text/plain");
      if (!data) return;
      
      const draggedItem = JSON.parse(data);
      
      // Prevent dropping on itself
      if (draggedItem.id === category.id) {
        e.dataTransfer.dropEffect = "none";
        return;
      }
      
      // Set drop effect to indicate a valid drop target
      e.dataTransfer.dropEffect = "move";
    } catch (error) {
      console.error("Error parsing drag data:", error);
    }
  };
  
  const handleDragLeave = () => {
    setIsDragOver(false);
    setIsDragOverAsChild(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setIsDragOverAsChild(false);
    
    try {
      const data = e.dataTransfer.getData("text/plain");
      if (!data) return;
      
      const draggedItem = JSON.parse(data);
      
      // Prevent dropping on itself
      if (draggedItem.id === category.id) return;
      
      const rect = e.currentTarget.getBoundingClientRect();
      const mouseY = e.clientY;
      const threshold = rect.top + (rect.height / 3);
      
      // If mouse is in the top third, drop as sibling
      if (mouseY < threshold) {
        // If this is a root category, use null as parent
        const targetParentId = level === 0 ? null : category.parent_id;
        onDrop(draggedItem.id, targetParentId);
      } 
      // Otherwise drop as child if this can be a parent
      else if (canBeParent) {
        // Only allow dropping as child if level constraints are met
        // (draggedItem cannot be at level 2 already)
        if (draggedItem.level < 2 || level === 0) {
          onDrop(draggedItem.id, category.id);
          
          // Auto-expand when dropping as child
          setIsExpanded(true);
        }
      }
    } catch (error) {
      console.error("Error parsing drop data:", error);
    }
  };
  
  return (
    <div 
      ref={itemRef}
      className={`category-item-container ${isDragging ? 'opacity-50' : ''}`}
    >
      <div 
        className={`
          flex items-center py-3 px-4 cursor-grab relative
          ${isDragOver ? 'border-t-2 border-blue-500' : ''}
          ${isDragOverAsChild ? 'bg-blue-50' : 'hover:bg-gray-50'}
          transition-colors duration-150
        `}
        style={{ paddingLeft: `${level * 24 + 16}px` }}
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex-grow flex items-center min-w-0">
          <div className="mr-2 text-gray-400">
            <GripVertical size={16} />
          </div>
          
          <div 
            className="mr-2 text-gray-500 cursor-pointer flex items-center justify-center w-6"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {category.children && category.children.length > 0 ? (
              isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />
            ) : (
              <span className="w-6"></span>
            )}
          </div>
          
          <span 
            className="font-medium text-gray-800 truncate overflow-ellipsis"
            onClick={toggleExpand}
          >
            {category.name}
          </span>
          
          {subcategoryCount > 0 && (
            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {subcategoryCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-1 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100">
          {canAddSubcategory && (
            <button
                type='button'
                title="Add subcategory"
              onClick={(e) => {
                e.stopPropagation();
                onAdd(category.id);
              }}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded focus:outline-none cursor-pointer"
            >
              <Plus size={16} />
            </button>
          )}
          
          <button
            type='button'
            title="Edit category"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(category);
            }}
            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded focus:outline-none cursor-pointer"
          >
            <Edit size={16} />
          </button>
          
          <button
            type='button'
            onClick={handleDeleteClick}
            className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded focus:outline-none cursor-pointer"
            title="Delete category"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      
      {isExpanded && category.children && category.children.length > 0 && (
        <div className="category-children">
          {category.children.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAdd={onAdd}
              onDrop={onDrop}
              level={level + 1}
            />
          ))}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <div className="flex items-center mb-4">
              <AlertTriangle className="text-amber-500 mr-3" size={24} />
              <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete "{category.name}"?
            </p>
            
            {(category.children && category.children.length > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4">
                <p className="text-amber-800 text-sm flex items-start">
                  <AlertTriangle className="text-amber-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>This will also delete {subcategoryCount} subcategories and all associated products.</span>
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none transition-colors cursor-pointer"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryItem;