import React, { useState, useEffect } from 'react';
import { Plus, Loader } from 'lucide-react';
import CategoryTree from '../components/categories/CategoryTree';
import CategoryForm from '../components/categories/CategoryForm';
import Notification from '../components/common/Notification';
import { fetchCategories, addCategory, updateCategory, deleteCategory, moveCategory } from '../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null); // Combined notification state
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [formError, setFormError] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  // Show notification with type (success/error)
  const showNotification = (message, type = 'error', isFormError = false) => {
    if (isFormError) {
      setFormError(message);
    } else {
      setNotification({ message, type });
      
      // Auto-dismiss notifications after 5 seconds
      if (!isFormError) {
        setTimeout(() => {
          setNotification(null);
        }, 5000);
      }
    }
  };
  
  const clearNotification = () => {
    setNotification(null);
  };
  
  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
      setFormError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to load categories';
      showNotification(errorMessage, 'error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddCategory = async (categoryData) => {
    try {
      await addCategory(categoryData);
      setShowForm(false);
      setFormError(null);
      await loadCategories();
      showNotification('Category added successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to add category';
      showNotification(errorMessage, 'error', true);
      console.error(err);
      return false;
    }
  };
  
  const handleUpdateCategory = async (categoryData) => {
    try {
      await updateCategory(categoryData);
      setShowForm(false);
      setEditingCategory(null);
      setFormError(null);
      await loadCategories();
      showNotification('Category updated successfully', 'success');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update category';
      showNotification(errorMessage, 'error', true);
      console.error(err);
      return false;
    }
  };
  
  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategory(id);
      await loadCategories();
      showNotification('Category deleted successfully', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete category';
      showNotification(errorMessage, 'error');
      console.error(err);
    }
  };
  
  const handleMoveCategory = async (categoryId, newParentId) => {
    // Prevent unnecessary updates if parent hasn't changed
    const findCategoryById = (cats, id) => {
      for (const cat of cats) {
        if (cat.id === id) {
          return cat;
        }
        if (cat.children && cat.children.length > 0) {
          const found = findCategoryById(cat.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    
    const category = findCategoryById(categories, categoryId);
    
    // If category not found or parent hasn't changed, do nothing
    if (!category) return;
    if (category.parent_id === newParentId) return;
    
    setIsMoving(true);
    try {
      await moveCategory(categoryId, newParentId);
      await loadCategories();
      showNotification('Category moved successfully', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Failed to move category';
      showNotification(errorMessage, 'error');
      console.error(err);
    } finally {
      setIsMoving(false);
    }
  };
  
  const handleAddSubcategory = (parentId) => {
    setEditingCategory(null);
    setSelectedParentId(parentId);
    setFormError(null);
    setShowForm(true);
  };
  
  const openEditForm = (category) => {
    setEditingCategory(category);
    setSelectedParentId(null);
    setFormError(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormError(null);
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setSelectedParentId(null);
            setFormError(null);
            setShowForm(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          <Plus size={16} className="mr-2" />
          Add Category
        </button>
      </div>
      
      {/* Render the Notification component when there's a notification */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}
      
      {/* Show a global loading state for moving categories */}
      {isMoving && (
        <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow p-4 flex items-center">
            <Loader className="h-6 w-6 animate-spin text-blue-600 mr-3" />
            <p>Moving category...</p>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center h-full -mt-20">
          <div className="flex flex-col items-center justify-center min-h-screen">
            <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600 font-medium">Loading categories...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 mb-4">No categories found</p>
          <button 
            onClick={() => {
              setEditingCategory(null);
              setSelectedParentId(null);
              setShowForm(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create your first category
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow">
          <CategoryTree 
            categories={categories} 
            onEdit={openEditForm} 
            onDelete={handleDeleteCategory}
            onAdd={handleAddSubcategory}
            onMove={handleMoveCategory}
          />
        </div>
      )}
      
      {showForm && (
        <CategoryForm
          categories={categories}
          editingCategory={editingCategory}
          initialParentId={selectedParentId}
          onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
          onCancel={closeForm}
          error={formError}
        />
      )}
    </div>
  );
};

export default Categories;