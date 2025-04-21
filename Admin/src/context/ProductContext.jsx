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
        id, upc, description, price, category, status, case_pack, discount, image_url, wholesale_price,
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
          id, upc, description, price, category, status, case_pack, discount, image_url, wholesale_price,
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
      
      // First check if category exists
      let query = supabase
        .from('categories')
        .select('id, name');
      
      // Add filters
      if (parentId === null) {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', parentId);
      }
      
      // Use ilike for case-insensitive matching
      query = query.ilike('name', trimmedName);
      
      // Execute query
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
        // Try to create, but handle potential race condition
        try {
          const { data: newCategory, error: createError } = await supabase
            .from('categories')
            .insert({ name: trimmedName, parent_id: parentId })
            .select('id')
            .single();
          
          if (createError) {
            // If error is a unique constraint violation, try fetching again
            if (createError.code === '23505') { // PostgreSQL unique violation code
              // Someone else created it, fetch the existing one
              const { data: retryData } = await supabase
                .from('categories')
                .select('id')
                .ilike('name', trimmedName)
                .eq('parent_id', parentId)
                .single();
              
              if (retryData) {
                finalCategoryId = retryData.id;
                parentId = finalCategoryId;
                continue;
              }
            }
            console.error("Create error:", createError);
            throw createError;
          }
          
          finalCategoryId = newCategory.id;
          parentId = finalCategoryId;
        } catch (err) {
          // If we got an error, try fetching one more time in case of race condition
          const { data: fallbackData } = await supabase
            .from('categories')
            .select('id')
            .ilike('name', trimmedName)
            .eq('parent_id', parentId)
            .single();
          
          if (fallbackData) {
            finalCategoryId = fallbackData.id;
            parentId = finalCategoryId;
          } else {
            throw err; // Re-throw if we still can't find it
          }
        }
      }
    }
    
    return finalCategoryId;
  };

  // In ProductContext.jsx
  const importProductsFromCSV = async (file, onProgress) => {
    return new Promise((resolve, reject) => {
      // Track stats to return to the UI
      const stats = {
        added: 0,
        updated: 0,
        errors: 0,
        total: 0,
        processed: 0,
        errorRecords: [] // Array to track specific error records
      };

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const { data, errors, meta } = results;
            stats.total = data.length;

            // Process in batches of 50 records
            const BATCH_SIZE = 50;
            const batches = [];

            // Split data into batches
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
              batches.push(data.slice(i, i + BATCH_SIZE));
            }

            // Process each batch
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
              const batch = batches[batchIndex];

              try {
                // Step 1: Process all categories first to reduce DB calls
                const processedCategories = {}; // Cache to avoid duplicate processing
                // Process categories sequentially
                for (const row of batch.filter(row => row.category && row.category.includes('>'))) {
                  try {
                    // Skip if we've already processed this category path
                    if (!processedCategories[row.category]) {
                      const categoryId = await findOrCreateCategory(row.category);
                      processedCategories[row.category] = categoryId;
                    }
                  } catch (error) {
                    console.error("Error processing category:", error, row.category);
                  }
                }

                // Use processedCategories as your category map
                const categoryMap = processedCategories;

                // Step 2: Filter out and track records with missing required fields
                let validRecords = [];
                const invalidRecords = [];

                batch.forEach((row, index) => {
                  // Check for required fields - UPC and description are mandatory
                  if (!row.upc || row.upc.trim() === '') {
                    invalidRecords.push({
                      rowIndex: stats.processed + index + 1, // 1-based index for user display
                      row,
                      reason: "Missing UPC"
                    });
                    return;
                  }

                  if (!row.description || row.description.trim() === '') {
                    invalidRecords.push({
                      rowIndex: stats.processed + index + 1,
                      row,
                      reason: "Missing description"
                    });
                    return;
                  }

                  // Price validation (must be a valid number)
                  if (isNaN(parseFloat(row.price))) {
                    invalidRecords.push({
                      rowIndex: stats.processed + index + 1,
                      row,
                      reason: "Invalid price"
                    });
                    return;
                  }

                  validRecords.push(row);
                });

                // Add invalid records to stats
                if (invalidRecords.length > 0) {
                  stats.errors += invalidRecords.length;
                  stats.errorRecords = [...stats.errorRecords, ...invalidRecords];
                }

                // Step 3: Handle duplicate UPCs within the batch
                // Group records by UPC to identify duplicates
                const recordsByUpc = {};
                validRecords.forEach(record => {
                  const upc = String(record.upc);
                  if (!recordsByUpc[upc]) {
                    recordsByUpc[upc] = [];
                  }
                  recordsByUpc[upc].push(record);
                });

                // Keep only the last occurrence of each UPC
                const deduplicatedRecords = [];
                Object.entries(recordsByUpc).forEach(([upc, records]) => {
                  if (records.length > 1) {
                    // Log warning about duplicate UPCs
                    console.warn(`Found ${records.length} duplicate entries for UPC ${upc}, using last entry`);

                    // Add the duplicates to error records for reporting
                    records.slice(0, -1).forEach((duplicateRecord) => {
                      const origIndex = validRecords.findIndex(r => r === duplicateRecord);
                      stats.errorRecords.push({
                        rowIndex: stats.processed + origIndex + 1,
                        row: duplicateRecord,
                        reason: `Duplicate UPC (${records.length} occurrences found in import)`
                      });
                      stats.errors++;
                    });

                    // Keep only the last record
                    deduplicatedRecords.push(records[records.length - 1]);
                  } else {
                    deduplicatedRecords.push(records[0]);
                  }
                });

                // Replace validRecords with deduplicatedRecords
                validRecords = deduplicatedRecords;

                // Skip DB operations if no valid records in this batch
                if (validRecords.length === 0) {
                  stats.processed += batch.length;
                  if (onProgress) {
                    onProgress({
                      ...stats,
                      percentage: Math.round((stats.processed / stats.total) * 100)
                    });
                  }
                  continue;
                }

                // Step 4: Get all existing products to determine updates vs inserts
                const upcs = validRecords.map(row => String(row.upc));

                const { data: existingProducts } = await supabase
                  .from('products')
                  .select('id, upc')
                  .in('upc', upcs);

                // Create a map using string UPCs to ensure consistent comparison
                const existingProductMap = existingProducts.reduce((map, product) => {
                  map[String(product.upc)] = product.id;
                  return map;
                }, {});

                // Step 5: Prepare update and insert batches
                const productsToUpdate = [];
                const productsToInsert = [];

                for (const row of validRecords) {
                  try {
                    // Ensure UPC is treated as a string
                    const upc = String(row.upc);

                    const productData = {
                      upc: upc,
                      description: row.description,
                      status: row.status || 1,
                      price: parseFloat(row.price) || 0,
                      case_pack: parseFloat(row.case_pack) || 0,
                      image_url: row.image_url || '',
                      category: (row.category && row.category.includes('>'))
                        ? categoryMap[row.category]
                        : row.category || null,
                      wholesale_price: parseFloat(row.wholesale_price) || 0,
                    };

                    // Check if product exists by string UPC comparison
                    if (existingProductMap[upc]) {
                      productsToUpdate.push({
                        id: existingProductMap[upc],
                        ...productData
                      });
                    } else {
                      productsToInsert.push(productData);
                    }
                  } catch (error) {
                    console.error("Error processing row:", error, row);
                    stats.errors++;
                    stats.errorRecords.push({
                      rowIndex: stats.processed + validRecords.indexOf(row) + 1,
                      row,
                      reason: "Processing error: " + error.message
                    });
                  }
                }

                // Step 6: Perform updates
                if (productsToUpdate.length > 0) {
                  // Process updates one by one to avoid conflicts
                  for (const product of productsToUpdate) {
                    const { error: updateError } = await supabase
                      .from('products')
                      .update(product)
                      .eq('id', product.id);

                    if (updateError) {
                      console.error("Error updating product:", updateError, product);
                      stats.errors++;
                      stats.errorRecords.push({
                        rowIndex: -1, // Unknown row index for individual errors
                        row: product,
                        reason: "Update error: " + updateError.message
                      });
                    } else {
                      stats.updated++;
                    }
                  }
                }

                // Step 7: Handle inserts
                if (productsToInsert.length > 0) {
                  // Process inserts one by one to handle potential duplicates
                  for (const product of productsToInsert) {
                    // First check if the product exists (could have been added by another concurrent process)
                    const { data: existingCheck } = await supabase
                      .from('products')
                      .select('id')
                      .eq('upc', product.upc)
                      .maybeSingle();

                    if (existingCheck) {
                      // Product exists, do an update instead
                      const { error: updateError } = await supabase
                        .from('products')
                        .update(product)
                        .eq('id', existingCheck.id);

                      if (updateError) {
                        console.error("Error updating existing product:", updateError, product);
                        stats.errors++;
                        stats.errorRecords.push({
                          rowIndex: -1,
                          row: product,
                          reason: "Update error: " + updateError.message
                        });
                      } else {
                        stats.updated++;
                      }
                    } else {
                      // Product doesn't exist, insert it
                      const { error: insertError } = await supabase
                        .from('products')
                        .insert([product]);

                      if (insertError) {
                        console.error("Error inserting product:", insertError, product);
                        stats.errors++;
                        stats.errorRecords.push({
                          rowIndex: -1,
                          row: product,
                          reason: "Insert error: " + insertError.message
                        });
                      } else {
                        stats.added++;
                      }
                    }
                  }
                }

                // Update processed count and report progress
                stats.processed += batch.length;
                if (onProgress) {
                  onProgress({
                    ...stats,
                    percentage: Math.round((stats.processed / stats.total) * 100)
                  });
                }

              } catch (batchError) {
                console.error("Error processing batch:", batchError);
                stats.errors += batch.length;

                // Track all records in this batch as errors
                batch.forEach((row, index) => {
                  stats.errorRecords.push({
                    rowIndex: stats.processed + index + 1,
                    row,
                    reason: "Batch error: " + batchError.message
                  });
                });

                // Still update processed count even for errors
                stats.processed += batch.length;
                if (onProgress) {
                  onProgress({
                    ...stats,
                    percentage: Math.round((stats.processed / stats.total) * 100)
                  });
                }
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

  const importSalesFromCSV = async (file, onProgress) => {
    return new Promise((resolve, reject) => {
      // Track stats to return to the UI
      const stats = {
        updated: 0,
        total: 0,
        processed: 0,
        notFound: [], // List of UPCs not found in database
        errors: 0,
        errorRecords: [] // Detailed error tracking
      };

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const { data } = results;
            stats.total = data.length;

            // Process in batches of 50 records
            const BATCH_SIZE = 50;
            const batches = [];

            // Split data into batches
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
              batches.push(data.slice(i, i + BATCH_SIZE));
            }

            // Process each batch
            for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
              const batch = batches[batchIndex];
              const batchStartIndex = batchIndex * BATCH_SIZE; // For tracking row numbers

              try {
                // First validate all rows and separate invalid ones
                const validRows = [];
                const invalidRows = [];

                batch.forEach((row, rowIndex) => {
                  const absoluteRowIndex = batchStartIndex + rowIndex + 1; // 1-based index for user display

                  // Check for missing UPC
                  if (!row.upc || row.upc.trim() === '') {
                    invalidRows.push({
                      rowIndex: absoluteRowIndex,
                      row,
                      reason: "Missing UPC"
                    });
                    return;
                  }

                  // Check for missing or invalid final_price
                  if (!row.final_price || row.final_price.trim() === '') {
                    invalidRows.push({
                      rowIndex: absoluteRowIndex,
                      row,
                      reason: "Missing final price"
                    });
                    return;
                  }

                  // Check that final_price is a valid number
                  const finalPrice = parseFloat(row.final_price);
                  if (isNaN(finalPrice) || finalPrice <= 0) {
                    invalidRows.push({
                      rowIndex: absoluteRowIndex,
                      row,
                      reason: `Invalid final price: ${row.final_price}`
                    });
                    return;
                  }

                  validRows.push(row);
                });

                // Add invalid rows to error stats
                if (invalidRows.length > 0) {
                  stats.errors += invalidRows.length;
                  stats.errorRecords = [...stats.errorRecords, ...invalidRows];
                }

                if (validRows.length === 0) {
                  stats.processed += batch.length;

                  // Report progress
                  if (onProgress) {
                    onProgress({
                      ...stats,
                      percentage: Math.round((stats.processed / stats.total) * 100)
                    });
                  }
                  continue; // Skip this batch if no valid rows
                }

                // Get all valid UPCs in this batch
                const upcs = validRows.map(row => row.upc);

                // Fetch all existing products in this batch
                const { data: existingProducts } = await supabase
                  .from('products')
                  .select('id, upc, price')
                  .in('upc', upcs);

                // Create a map for quick lookup
                const existingProductMap = existingProducts.reduce((map, product) => {
                  map[product.upc] = product;
                  return map;
                }, {});

                // Track UPCs not found in this batch
                const notFoundUPCs = [];

                // Process each row individually using proper updates (not upsert)
                for (const row of validRows) {
                  try {
                    const rowIndex = batchStartIndex + batch.indexOf(row) + 1; // 1-based index

                    // Only proceed if product exists
                    if (existingProductMap[row.upc]) {
                      const product = existingProductMap[row.upc];
                      const finalPrice = parseFloat(row.final_price);
                      const productPrice = parseFloat(product.price);

                      // Validate that discount is not greater than or equal to price
                      if (finalPrice >= productPrice) {
                        stats.errors++;
                        stats.errorRecords.push({
                          rowIndex,
                          row,
                          reason: `Discount price (${finalPrice}) must be less than product price (${productPrice})`
                        });
                        continue;
                      }

                      // Only update if the final price is valid
                      if (finalPrice > 0) {
                        // Use precise update with eq filter instead of upsert
                        const { error } = await supabase
                          .from('products')
                          .update({ discount: finalPrice })
                          .eq('id', product.id);

                        if (error) {
                          console.error(`Error updating product ${row.upc}:`, error);
                          stats.errors++;
                          stats.errorRecords.push({
                            rowIndex,
                            row,
                            reason: `Database error: ${error.message}`
                          });
                        } else {
                          stats.updated++;
                        }
                      }
                    } else {
                      // Product not found
                      notFoundUPCs.push(row.upc);
                      stats.errorRecords.push({
                        rowIndex,
                        row,
                        reason: "Product UPC not found in database"
                      });
                    }
                  } catch (rowError) {
                    console.error(`Error processing row with UPC ${row.upc}:`, rowError);
                    stats.errors++;
                    stats.errorRecords.push({
                      rowIndex: -1, // Unknown index for caught errors
                      row,
                      reason: `Processing error: ${rowError.message}`
                    });
                  }
                }

                // Add not found UPCs to stats
                if (notFoundUPCs.length > 0) {
                  stats.notFound = [...stats.notFound, ...notFoundUPCs];
                }

                // Update processed count and report progress
                stats.processed += batch.length;
                if (onProgress) {
                  onProgress({
                    ...stats,
                    percentage: Math.round((stats.processed / stats.total) * 100)
                  });
                }

              } catch (batchError) {
                console.error("Error processing batch:", batchError);
                stats.errors += batch.length;

                // Add all batch rows to error records
                batch.forEach((row, index) => {
                  stats.errorRecords.push({
                    rowIndex: batchStartIndex + index + 1,
                    row,
                    reason: `Batch processing error: ${batchError.message}`
                  });
                });

                // Still update processed count even for errors
                stats.processed += batch.length;
                if (onProgress) {
                  onProgress({
                    ...stats,
                    percentage: Math.round((stats.processed / stats.total) * 100)
                  });
                }
              }
            }

            // Refresh products list after import
            await fetchProducts();
            resolve(stats);
          } catch (error) {
            console.error("Error importing sales CSV:", error);
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
    importSalesFromCSV,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};