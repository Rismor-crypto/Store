import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader, Plus } from "lucide-react";
import { useProductContext } from "../context/ProductContext";
import supabase from "../utils/supabase";

const AddEditProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateProduct, addProduct } = useProductContext();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesTree, setCategoriesTree] = useState({});
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({
    upc: "",
    description: "",
    status: 1,
    price: 0,
    case_pack: 0,
    image_url: "",
    category: "",
    discount: 0,
    wholesale_price: 0,
  });
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [categoryPath, setCategoryPath] = useState("");
  
  // For hierarchical category selection
  const [selectedParentCategory, setSelectedParentCategory] = useState("");
  const [selectedChildCategory, setSelectedChildCategory] = useState("");
  const [selectedGrandchildCategory, setSelectedGrandchildCategory] = useState("");
  const [childCategories, setChildCategories] = useState([]);
  const [grandchildCategories, setGrandchildCategories] = useState([]);

useEffect(() => {
  const initializeData = async () => {
    await fetchCategories();
    
    if (isEditMode) {
      await fetchProduct();
    }
  };

  initializeData();
}, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category_info:categories(id, name, parent_id)
        `)
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      setProduct(data);
      setFormData({
        upc: data.upc || "",
        description: data.description || "",
        status: data.status || 1,
        price: data.price || 0,
        case_pack: data.case_pack || 0,
        image_url: data.image_url || "",
        category: data.category || "",
        discount: data.discount || 0,
        wholesale_price: data.wholesale_price || 0,
      });
      
      // Set image preview if image_url exists
      if (data.image_url) {
        setImagePreview(data.image_url);
      }
      
      // Get category path
      if (data.category) {
        fetchCategoryPath(data.category);
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      
      setCategories(data || []);
      
      // Build category tree for hierarchical selection
      const tree = {};
      const parentCategories = data.filter(cat => !cat.parent_id);
      
      parentCategories.forEach(parent => {
        tree[parent.id] = {
          name: parent.name,
          children: {}
        };
        
        const children = data.filter(cat => cat.parent_id === parent.id);
        children.forEach(child => {
          tree[parent.id].children[child.id] = {
            name: child.name,
            children: {}
          };
          
          const grandchildren = data.filter(cat => cat.parent_id === child.id);
          grandchildren.forEach(grandchild => {
            tree[parent.id].children[child.id].children[grandchild.id] = {
              name: grandchild.name
            };
          });
        });
      });
      
      setCategoriesTree(tree);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again.");
    }
  };

  const fetchCategoryPath = async (categoryId) => {
    try {
      let path = [];
      let currentCategoryId = categoryId;
      let categoryIds = [];
      let currentLevel = 'grandchild';
      
      while (currentCategoryId) {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, parent_id")
          .eq("id", currentCategoryId)
          .single();
        
        if (error) throw error;
        
        path.unshift(data.name);
        categoryIds.unshift({
          id: data.id,
          level: currentLevel,
          parentId: data.parent_id
        });
        
        // Update the level for next iteration
        if (currentLevel === 'grandchild') {
          currentLevel = 'child';
        } else if (currentLevel === 'child') {
          currentLevel = 'parent';
        }
        
        currentCategoryId = data.parent_id;
      }
      
      setCategoryPath(path.join(">"));
      
      // Fetch and set categories in sequence
      for (const cat of categoryIds) {
        if (cat.level === 'parent') {
          setSelectedParentCategory(cat.id);
          
          // Wait for child categories to be populated
          const parentChildren = categories.filter(c => c.parent_id === cat.id);
          setChildCategories(parentChildren);
          
          // If we have a child category to set
          const childCategories = categories.filter(c => c.parent_id === cat.id);
          const nextCategoryInPath = categoryIds.find(c => c.level === 'child');
          
          if (nextCategoryInPath && childCategories.some(c => c.id === nextCategoryInPath.id)) {
            setSelectedChildCategory(nextCategoryInPath.id);
            
            // Fetch and set grandchild categories
            const childGrandchildren = categories.filter(c => c.parent_id === nextCategoryInPath.id);
            setGrandchildCategories(childGrandchildren);
            
            // If we have a grandchild category to set
            const grandchildCategory = categoryIds.find(c => c.level === 'grandchild');
            if (grandchildCategory && childGrandchildren.some(c => c.id === grandchildCategory.id)) {
              setSelectedGrandchildCategory(grandchildCategory.id);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching category path:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle numeric inputs
    if (type === "number") {
      setFormData({ ...formData, [name]: value === "" ? "" : Number(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleManualCategoryChange = (e) => {
    setCategoryPath(e.target.value);
    setFormData({ ...formData, category: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    if(!formData.upc || !formData.description || !formData.price || !formData.category || !formData.case_pack || !formData.image_url || !formData.status) {
        setError("Please fill in all required fields.");
        setSaving(false);
        return;
    }
    
    try {
      
      if (isEditMode) {
        // Update product
        await updateProduct(id ,formData);
      } else {
        // Create product
        await addProduct(formData)
      }
      
      // Redirect to products page on success
      navigate("/products");
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'add'} product. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-screen">
        <Loader className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="ml-2">Loading product...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link 
          to="/products" 
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </Link>
        <h1 className="text-2xl font-bold">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              UPC
            </label>
            <input
              type="text"
              name="upc"
              value={formData.upc}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter UPC code"
            />
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter product name"
              required
            />
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount
            </label>
            <input
              type="number"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Case Pack
            </label>
            <input
              type="number"
              name="case_pack"
              value={formData.case_pack}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>
          
          <div className="col-span-1">
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
            </div>
            
              <div>
                <input
                  type="text"
                  value={categoryPath}
                  onChange={handleManualCategoryChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Household>Kitchen>Utensils"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Format: Parent{'>'}Child{'>'}Grandchild
                </p>
              </div>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>  
              <option value="2">Low Quantity</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wholesale Price ($)
            </label>
            <input
              type="number"
              name="wholesale_price"
              value={formData.wholesale_price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6">
              <div className="flex-shrink-0 mb-4 sm:mb-0">
                <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">No image</span>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter image URL"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <Link
            to="/products"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 mr-2"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
          >
            {saving ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Update Product' : 'Save Product'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProductPage;