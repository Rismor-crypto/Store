import React, { createContext, useContext, useState, useEffect } from "react";
import supabase from "../utils/supabase"; // Adjust the path as needed
import Papa from "papaparse"; // You'll need to install this: npm install papaparse

const ProductContext = createContext();

export const useProductContext = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);


  // Fetch products with pagination and search
  const fetchProducts = async (page = 1, size = pageSize, search = searchTerm) => {
    try {
      setLoading(true);
      setSearchTerm(search);
      
      // For counting total records
      let countQuery = supabase
        .from("products")
        .select("id", { count: "exact" });
      
      // For fetching data with relations
      let dataQuery = supabase
        .from("products")
        .select(`
          *,
          category_info:categories(id, name, parent_id)
        `);
      
      // Apply search filters to both queries if search term exists
      if (search && search.trim() !== "") {
        const searchTerm = `%${search.trim()}%`;
        
        // Filter expression for both queries
        const filterExpression = `description.ilike.${searchTerm},upc.ilike.${searchTerm}`;
        
        countQuery = countQuery.or(filterExpression);
        dataQuery = dataQuery.or(filterExpression);
      }
      
      // Get total count
      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      // Calculate pagination values
      const total = count || 0;
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / size));
      
      // Calculate range for pagination
      const rangeStart = (page - 1) * size;
      
      // Apply pagination and ordering to data query
      const { data, error } = await dataQuery
        .range(rangeStart, rangeStart + size - 1)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      setProducts(data || []);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    // Reset to first page when searching
    fetchProducts(1, pageSize, searchValue);
  };


  // Change page
  const changePage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
  };

  // Change page size
  const changePageSize = (size) => {
    setPageSize(size);
    fetchProducts(1, size);
  };


  const addProduct = async (productData) => {
    try {
      setLoading(true);
      
      // Process category if it's a path
      let categoryId = productData.category;
      if (typeof productData.category === 'string' && productData.category.includes('>')) {
        categoryId = await findOrCreateCategory(productData.category);
      }
      
      const { data, error } = await supabase
      .from("products")
      .insert([{
        ...productData,
        category: categoryId
      }])
      .select(`
        id, upc, description, price, category, status, case_pack, discount, image_url,
        category_info:categories(id, name, parent_id)
      `)
      .single();

      if (error) throw error;
      setProducts([data, ...products]);
      return data[0];
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      setLoading(true);
      
      // Process category if it's a path
      let categoryId = productData.category;
      if (typeof productData.category === 'string' && productData.category.includes('>')) {
        categoryId = await findOrCreateCategory(productData.category);
      }
      
      const { data, error } = await supabase
        .from("products")
        .update({
          ...productData,
          category: categoryId
        })
        .eq("id", id)
        .select(`
          id, upc, description, price, category, status, case_pack, discount, image_url,
          category_info:categories(id, name, parent_id)
        `)
        .single();

      if (error) throw error;
      
      setProducts(products.map(product => 
        product.id === id ? { ...data } : product
      ));
      
      return data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const batchDeleteProducts = async () => {
    try {
      setLoading(true);
      // Supabase doesn't support batch deletes directly, so we need to use 'in'
      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", selectedProducts);

      if (error) throw error;
      setProducts(products.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error batch deleting products:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prevSelected => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter(id => id !== productId);
      } else {
        return [...prevSelected, productId];
      }
    });
  };

  const selectAllProducts = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(product => product.id));
    }
  };

  // Function to find or create category hierarchy
  const findOrCreateCategory = async (categoryPath) => {
    if (!categoryPath) return null;
    
    const categories = categoryPath.split('>');
    let parentId = null;
    let finalCategoryId = null;
    
    for (const categoryName of categories) {
      // Thoroughly trim whitespace and convert to lowercase for consistent matching
      const trimmedName = categoryName.trim();      
      // Use ilike for case-insensitive matching
      let query = supabase
        .from('categories')
        .select('id, name')  // Also select name for debugging
        .ilike('name', trimmedName);  // Case-insensitive matching
      
      // Add the parent_id filter only if parentId is not null
      if (parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }
      
      // Execute query and log results for debugging
      const { data, error } = await query;
      
      if (error) {
        console.error("Query error:", error);
        throw error;
      }
      
      if (data && data.length > 0) {
        // Category exists, use its ID
        finalCategoryId = data[0].id;
        parentId = finalCategoryId;
      } else {
        // Create new category
        const { data: newCategory, error: createError } = await supabase
          .from('categories')
          .insert({ name: trimmedName, parent_id: parentId })
          .select('id')
          .single();
        
        if (createError) {
          console.error("Create error:", createError);
          throw createError;
        }
        
        finalCategoryId = newCategory.id;
        parentId = finalCategoryId;
      }
    }
    
    return finalCategoryId;
  };

  // Function to import products from CSV
  const importProductsFromCSV = async (file) => {
    return new Promise((resolve, reject) => {
      // Track stats to return to the UI
      const stats = {
        added: 0,
        updated: 0,
        errors: 0,
        total: 0
      };

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const { data, errors, meta } = results;
            stats.total = data.length;
            
            // Process each row sequentially (not in parallel to avoid race conditions)
            for (const row of data) {
              try {
                // Check if product exists based on UPC
                const { data: existingProducts } = await supabase
                  .from('products')
                  .select('id')
                  .eq('upc', row.upc);

                // Format product data from CSV row
                const productData = {
                  upc: row.upc,
                  description: row.description,
                  status: row.status || 'true',
                  price: parseFloat(row.price) || 0,
                  case_pack: parseFloat(row.case_pack) || 0,
                  image_url: row.image_url || '',
                  category: row.category || null,
                  discount: parseFloat(row.discount) || 0,
                };

                // Process category if it's a path
                // In importProductsFromCSV
                if (productData.category && productData.category.includes('>')) {
                    try {
                      const categoryId = await findOrCreateCategory(productData.category);
                      productData.category = categoryId;
                    } catch (error) {
                      console.error("Error in category processing:", error);
                      // Set to null rather than keeping the string
                      productData.category = null;
                    }
                  }

                if (existingProducts && existingProducts.length > 0) {
                  // Update existing product
                  const { error } = await supabase
                    .from('products')
                    .update(productData)
                    .eq('id', existingProducts[0].id);
                  
                  if (error) throw error;
                  stats.updated++;
                } else {
                  // Add new product
                  const { error } = await supabase
                    .from('products')
                    .insert([productData]);
                  
                  if (error) throw error;
                  stats.added++;
                }
              } catch (error) {
                console.error("Error processing CSV row:", error, row);
                stats.errors++;
              }
            }

            // Refresh products list after import
            await fetchProducts();
            resolve(stats);
          } catch (error) {
            console.error("Error importing CSV:", error);
            reject(error);
          }
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          reject(error);
        }
      });
    });
  };

  const value = {
    products,
    loading,
    error,
    selectedProducts,
    totalProducts,
    totalPages,
    currentPage,
    pageSize,
    fetchProducts,
    changePage,
    changePageSize,
    addProduct,
    updateProduct,
    deleteProduct,
    batchDeleteProducts,
    toggleProductSelection,
    selectAllProducts,
    findOrCreateCategory,
    importProductsFromCSV,
    handleSearch,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};