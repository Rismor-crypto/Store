import supabase from '../utils/supabase';

export const transformToTree = (categories, parentId = null) => {
  return categories
    .filter(category => category.parent_id === parentId)
    .map(category => ({
      ...category,
      children: transformToTree(categories, category.id)
    }));
};

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

export const addCategory = async (categoryData) => {
  try {
    if (!categoryData.name || categoryData.name.trim() === '') {
      throw new Error('Category name is required');
    }
    
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

export const updateCategory = async (categoryData) => {
  try {
    const { id, ...fields } = categoryData;
    
    if (!id) {
      throw new Error('Category ID is required for updates');
    }
    
    if (fields.name && fields.name.trim() === '') {
      throw new Error('Category name cannot be empty');
    }
    
    const { data: existingCategory, error: checkError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
      
    if (checkError || !existingCategory) {
      throw new Error('Category not found');
    }
    
    if (fields.parent_id && fields.parent_id !== existingCategory.parent_id) {
      if (fields.parent_id === id) {
        throw new Error('A category cannot be its own parent');
      }
      
      const { data: allCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*');
        
      if (fetchError) throw fetchError;
      
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

export const moveCategory = async (categoryId, newParentId = null, maxLevel = 2) => {
  try {
    if (!categoryId) {
      throw new Error('Category ID is required');
    }

    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
      
    if (categoryError || !category) {
      throw new Error('Category not found');
    }

    if (newParentId) {
      const { data: parentCategory, error: parentError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', newParentId)
        .single();
        
      if (parentError || !parentCategory) {
        throw new Error('Parent category not found');
      }

      if (newParentId === categoryId) {
        throw new Error('A category cannot be its own parent');
      }

      const { data: allCategories, error: fetchError } = await supabase
        .from('categories')
        .select('*');
        
      if (fetchError) throw fetchError;

      const isDescendant = (parentId, childId) => {
        const children = allCategories.filter(c => c.parent_id === childId);
        return children.some(child => child.id === parentId || isDescendant(parentId, child.id));
      };
      
      if (isDescendant(categoryId, newParentId)) {
        throw new Error('Cannot set a descendant as parent (circular reference)');
      }

      const getLevel = (cat, level = 0) => {
        if (!cat.parent_id) return level;
        const parent = allCategories.find(c => c.id === cat.parent_id);
        if (!parent) return level;
        return getLevel(parent, level + 1);
      };

      const parentLevel = getLevel(parentCategory);
      
      const getDescendants = (id) => {
        const direct = allCategories.filter(c => c.parent_id === id);
        let all = [...direct];
        direct.forEach(child => {
          all = [...all, ...getDescendants(child.id)];
        });
        return all;
      };

      const descendants = getDescendants(categoryId);
      const deepestDescendantLevel = descendants.length > 0 ? 
        Math.max(...descendants.map(d => getLevel(d))) - getLevel(category) : 0;

      if (parentLevel + 1 + deepestDescendantLevel > maxLevel) {
        throw new Error(`Moving this category would exceed the maximum category depth of ${maxLevel}`);
      }
    }

    const { data, error } = await supabase
      .from('categories')
      .update({ parent_id: newParentId })
      .eq('id', categoryId)
      .select();
      
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error moving category:', error);
    throw new Error(`Failed to move category: ${error.message}`);
  }
};

export const deleteCategory = async (id) => {
  try {
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
      
    if (categoryError || !category) {
      throw new Error('Category not found');
    }
    
    const { data: allCategories, error: fetchError } = await supabase
      .from('categories')
      .select('*');
      
    if (fetchError) throw fetchError;
    
    const getDescendantIds = (parentId) => {
      const descendants = [];
      
      const findDescendants = (pId) => {
        const children = allCategories.filter(c => c.parent_id === pId);
        
        children.forEach(child => {
          descendants.push(child.id);
          findDescendants(child.id);
        });
      };
      
      findDescendants(parentId);
      return descendants;
    };
    
    const descendantIds = getDescendantIds(id);
    const allIdsToDelete = [id, ...descendantIds];
    
    const { error: transactionError } = await supabase.rpc('delete_category_cascade', {
      category_ids: allIdsToDelete
    });
    
    if (transactionError) {
      console.warn('RPC function not available, falling back to separate operations');
      
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .in('category', allIdsToDelete);
        
      if (productsError) throw productsError;
      
      for (const catId of descendantIds) {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', catId);
          
        if (error) throw error;
      }
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error(`Failed to delete category: ${error.message}`);
  }
};

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