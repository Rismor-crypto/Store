import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

const CategoryForm = ({ 
  categories, 
  editingCategory = null, 
  initialParentId = null,
  onSubmit, 
  onCancel,
  error
}) => {
  const [formData, setFormData] = useState({
    name: '',
    parent_id: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        id: editingCategory.id,
        name: editingCategory.name || '',
        parent_id: editingCategory.parent_id
      });
    } else if (initialParentId) {
      setFormData(prev => ({ ...prev, parent_id: initialParentId }));
    }
  }, [editingCategory, initialParentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParentChange = (e) => {
    const value = e.target.value === "" ? null : e.target.value;
    setFormData(prev => ({
      ...prev,
      parent_id: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(formData);
      if (success !== false) {
        // Only reset if submission was successful
        setFormData({
          name: '',
          parent_id: null,
          id: null
        });
      }
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine the level of the category being edited or created
  const getCategoryLevel = (parentId) => {
    if (!parentId) return 0;
    
    const findCategoryLevel = (cats, id, currentLevel = 0) => {
      for (const cat of cats) {
        if (cat.id === id) {
          return currentLevel;
        }
        if (cat.children && cat.children.length > 0) {
          const level = findCategoryLevel(cat.children, id, currentLevel + 1);
          if (level !== -1) return level;
        }
      }
      return -1;
    };
    
    return findCategoryLevel(categories, parentId);
  };

  // Flatten categories for the select dropdown
  const flattenCategories = (cats, depth = 0, prefix = '') => {
    let options = [];
    cats.forEach(cat => {
      // Skip the category being edited and its children to prevent circular references
      if (editingCategory && cat.id === editingCategory.id) {
        return;
      }
      
      // Skip categories at level 2 (3rd level) as they can't have children
      const categoryLevel = getCategoryLevel(cat.id);
      if (categoryLevel < 2) {
        options.push({
          id: cat.id,
          name: `${prefix}${cat.name}`,
          depth,
          level: categoryLevel
        });
      }
      
      if (cat.children && cat.children.length > 0) {
        options = [...options, ...flattenCategories(cat.children, depth + 1, `${prefix}— `)];
      }
    });
    return options;
  };

  const flatCategories = flattenCategories(categories);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle size={16} className="mr-2 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
              autoFocus
            />
          </div>
          {!editingCategory && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Category
            </label>
            <select
              name="parent_id"
              value={formData.parent_id || ""}
              onChange={handleParentChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="">No Parent</option>
              {flatCategories.map(cat => (
                <option 
                  key={cat.id} 
                  value={cat.id}
                  style={{ paddingLeft: `${cat.depth * 10}px` }}
                >
                  {cat.name}
                </option>
              ))}
            </select>
            <span className='text-xs text-gray-600'>Select "No Parent" for top-level category</span>
          </div>
        )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;