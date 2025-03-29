import supabase from '../utils/supabase';

// Transform flat list to tree structure
export const transformToTree = (categories, parentId = null) => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      ...category,
      children: transformToTree(categories, category.id)
    }));
};

// Check if category with the same name exists
export const nameExists = async (name, excludeId = null) => {
  try {
    let query = supabase
      .from('categories')
      .select('name')
      .eq('name', name);
    
    // If excludeId is provided, exclude that category from the check
    // (useful for updates where we don't want to match the current category)
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data.length > 0;
  } catch (error) {
    console.error('Error checking if name exists:', error);
    throw new Error(`Failed to check if name exists: ${error.message}`);
  }
};

// Fetch all categories
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return transformToTree(data);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
};

// Add a new category
export const addCategory = async (categoryData) => {
  try {
    // Validate required fields
    if (!categoryData.name || categoryData.name.trim() === '') {
      throw new Error('Category name is required');
    }
    
    // Check for name uniqueness
    const exists = await nameExists(categoryData.name);
    if (exists) {
      throw new Error('A category with this name already exists');
    }
    
    // If parent_id is provided, verify it exists
    if (categoryData.parent_id) {
      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('id', categoryData.parent_id)
        .single();
        
      if (error || !data) {
        throw new Error('Parent category does not exist');
      }
    }
    
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding category:', error);
    throw new Error(`Failed to add category: ${error.message}`);
  }
};

// Update an existing category
export const updateCategory = async (categoryData) => {
  try {
    const { id, ...fields } = categoryData;
    
    // Validate required fields
    if (!id) {
      throw new Error('Category ID is required for updates');
    }
    
    if (fields.name && fields.name.trim() === '') {
      throw new Error('Category name cannot be empty');
    }
    
    // Check if category exists
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
      
    if (checkError || !existingCategory) {
      throw new Error('Category not found');
    }
    
    // Check for name uniqueness (excluding current category)
    if (fields.name && fields.name !== existingCategory.name) {
      const exists = await nameExists(fields.name, id);
      if (exists) {
        throw new Error('A category with this name already exists');
      }
    }
    
    // Prevent setting parent to itself or its descendants (avoid circular references)
    if (fields.parent_id && fields.parent_id !== existingCategory.parent_id) {
      // Check if the new parent is not the category itself
      if (fields.parent_id === id) {
        throw new Error('A category cannot be its own parent');
      }
      
      // Get all categories to check for circular references
      const { data: allCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*');
        
      if (fetchError) throw fetchError;
      
      // Check if new parent is not a descendant
      const isDescendant = (parentId, childId) => {
        const children = allCategories.filter(c => c.parent_id === childId);
        return children.some(child => child.id === parentId || isDescendant(parentId, child.id));
      };
      
      if (isDescendant(id, fields.parent_id)) {
        throw new Error('Cannot set a descendant as parent (circular reference)');
      }
    }
    
    const { data, error } = await supabase
      .from('categories')
      .update(fields)
      .eq('id', id)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating category:', error);
    throw new Error(`Failed to update category: ${error.message}`);
  }
};

// Delete a category
export const deleteCategory = async (id) => {
  try {
    // Check if category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
      
    if (categoryError || !category) {
      throw new Error('Category not found');
    }
    
    // Check if category has children
    const { data: children, error: childrenError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', id);
      
    if (childrenError) throw childrenError;
    
    if (children.length > 0) {
      throw new Error('Cannot delete a category with subcategories');
    }
    
    // Check if category is used in products (assuming you have a products table)
    // This would be implemented based on your actual schema
    // For example:
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('category', id);
      
    if (productsError) throw productsError;
    
    if (products && products.length > 0) {
      throw new Error('Cannot delete a category that is used by products');
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

// Get flattened category path for breadcrumbs
export const getCategoryPath = (categories, categoryId) => {
  try {
    const path = [];
    
    const findPath = (cats, id) => {
      for (const cat of cats) {
        if (cat.id === id) {
          path.unshift(cat);
          return true;
        }
        
        if (cat.children && cat.children.length) {
          if (findPath(cat.children, id)) {
            path.unshift(cat);
            return true;
          }
        }
      }
      return false;
    };
    
    findPath(categories, categoryId);
    
    if (path.length === 0) {
      console.warn(`Category path not found for ID: ${categoryId}`);
    }
    
    return path;
  } catch (error) {
    console.error('Error getting category path:', error);
    throw new Error(`Failed to get category path: ${error.message}`);
  }
};