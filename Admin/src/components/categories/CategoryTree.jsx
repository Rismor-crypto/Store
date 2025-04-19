import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Plus, Info } from 'lucide-react';
import CategoryItem from './CategoryItem';

const CategoryTree = ({ categories, onEdit, onDelete, onAdd, onMove }) => {
  const [dragOver, setDragOver] = useState(false);
  const [showHint, setShowHint] = useState(true);
 
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
    e.dataTransfer.dropEffect = "move";
  };
 
  const handleDragLeave = () => {
    setDragOver(false);
  };
 
  const handleRootDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
   
    const data = e.dataTransfer.getData("text/plain");
    if (!data) return;
   
    try {
      const draggedItem = JSON.parse(data);
      
      // Move the category to the root level (null parent)
      if (onMove) {
        onMove(draggedItem.id, null);
      }
    } catch (error) {
      console.error("Error parsing root drop data:", error);
    }
  };
 
  const handleCategoryDrop = (categoryId, targetParentId) => {
    if (onMove) {
      onMove(categoryId, targetParentId);
    }
  };

  const handleAddRootCategory = () => {
    onAdd(null); // Passing null indicates adding at root level
  };

  const dismissHint = () => {
    setShowHint(false);
  };
 
  return (
    <div className="overflow-hidden shadow-sm">
      {/* Header with actions */}
      <div className="bg-gray-50 py-3 px-4 border border-gray-200 rounded-t-lg flex items-center justify-between">
        <h2 className="font-medium text-gray-800">All Categories</h2>
      </div>
      
      {/* Drag and drop instruction hint */}
      {showHint && (
        <div className="bg-blue-50 border-x border-b border-blue-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center text-blue-700 text-sm">
            <Info size={16} className="mr-2" />
            <span>Drag and drop categories to rearrange. Categories can have up to 2 levels of nesting.</span>
          </div>
          <button 
            onClick={dismissHint}
            className="text-blue-700 hover:text-blue-800 text-sm font-medium"
          >
            Got it
          </button>
        </div>
      )}
      
      {/* Drop area and categories */}
      <div
        className={`border-x border-b border-gray-200 rounded-b-lg ${dragOver ? 'bg-blue-50' : 'bg-white'} transition-colors duration-200`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleRootDrop}
      >
        {categories.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-3">No categories yet</p>
            <button 
              onClick={handleAddRootCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} className="inline mr-1" />
              Create your first category
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                onEdit={onEdit}
                onDelete={onDelete}
                onAdd={onAdd}
                onDrop={handleCategoryDrop}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTree;