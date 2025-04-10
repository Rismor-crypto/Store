import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useProductContext } from "../context/ProductContext";
import { 
  FileUp, Plus, Trash2, Search, Loader,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  X as XIcon
} from "lucide-react";

import ProductsTable from "../components/Products/ProductsTable";
import Notification from "../components/common/Notification";
import ImportModal from "../components/Products/ImportModal";
import ConfirmationModal from "../components/common/ConfirmationModal";
import Pagination from "../components/common/Pagination";

const ProductsPage = () => {
  const { 
    products, 
    loading,
    error: contextError, 
    selectedProducts,
    searchTerm,
    handleSearch: contextHandleSearch,
    batchDeleteProducts,
    deleteProduct,
    importProductsFromCSV,
    totalProducts,
    totalPages,
    currentPage,
    pageSize,
    changePage,
    changePageSize
  } = useProductContext();
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Update local search when context search changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);
  
  // Debounce function for search
  const debounce = (func, delay) => {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  };
  
  // Debounced search handler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value) => {
      contextHandleSearch(value);
    }, 500),
    []
  );
  
  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);
    debouncedSearch(value);
  };
  
  // Clear search
  const clearSearch = () => {
    setLocalSearchTerm("");
    contextHandleSearch("");
  };

  const handleDeleteProduct = async (id) => {
    try {
      setDeleting(true);
      await deleteProduct(id);
      showNotification("Product deleted successfully", "success");
      setShowDeleteConfirm(false);
      setDeleteConfirmProduct(null);
    } catch (error) {
      showNotification(`Error deleting product: ${error.message}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleBatchDelete = async () => {
    try {
      setDeleting(true);
      await batchDeleteProducts();
      showNotification(`${selectedProducts.length} products deleted successfully`, "success");
      setShowBatchDeleteConfirm(false);
    } catch (error) {
      showNotification(`Error deleting products: ${error.message}`, "error");
    } finally {
      setDeleting(false);
    }
  };

  const showNotification = (message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  // Import CSV handler
  const handleImportCSV = async (csvFile) => {
    try {
      const stats = await importProductsFromCSV(csvFile);
      showNotification(`Import complete: ${stats.added} added, ${stats.updated} updated, ${stats.errors} errors`, "success");
      
      // Close modal after successful import if no errors
      // if (stats.errors === 0) {
      //   setTimeout(() => {
      //     setShowImportModal(false);
      //   }, 3000);
      // }
      
      return stats;
    } catch (error) {
      showNotification(`Error importing CSV: ${error.message}`, "error");
      throw error;
    }
  };

  return (
    <div className="container mx-auto">
      {/* Notification Component */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex space-x-2">
          {selectedProducts.length > 0 && (
            <button
              onClick={() => setShowBatchDeleteConfirm(true)}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete Selected ({selectedProducts.length})
            </button>
          )}
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
          >
            <FileUp className="mr-2 h-5 w-5" />
            Import CSV
          </button>
          <Link
            to="/products/add"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search products by name, UPC..."
          value={localSearchTerm}
          onChange={handleSearchChange}
        />
        {localSearchTerm && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={clearSearch}
          >
            <XIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center p-8 bg-white shadow-md rounded-lg">
          <Loader className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="ml-2">Loading products...</span>
        </div>
      ) : contextError ? (
        <div className="text-center p-4 text-red-500 bg-white shadow-md rounded-lg">
          Error loading products: {contextError}
        </div>
      ) : (
        <>
          {/* Search Results Summary */}
          {searchTerm && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md text-blue-700">
              <div className="flex items-center justify-between">
                <span>
                  Showing {totalProducts} results for: <strong>"{searchTerm}"</strong>
                </span>
                <button 
                  onClick={clearSearch}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Clear search
                </button>
              </div>
            </div>
          )}
          
          {/* Products Table */}
          <ProductsTable 
            products={products} 
            onDeleteClick={(product) => {
              setDeleteConfirmProduct(product);
              setShowDeleteConfirm(true);
            }}
          />
          
          {/* No Results Message */}
          {products.length === 0 && !loading && (
            <div className="text-center p-8 bg-white shadow-md rounded-lg mt-4">
              {searchTerm ? (
                <div>
                  <p className="text-gray-500 mb-2">No products match your search criteria</p>
                  <button 
                    onClick={clearSearch}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">No products found</p>
              )}
            </div>
          )}
          
          {/* Pagination Component */}
          {totalPages > 0 && (
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalProducts}
              pageSize={pageSize}
              onPageChange={changePage}
              onPageSizeChange={changePageSize}
            />
          )}
        </>
      )}

      {/* Import Modal Component */}
      <ImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportCSV}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showDeleteConfirm}
        title="Confirm Delete"
        message={`Are you sure you want to delete the product "${deleteConfirmProduct?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmIcon={<Trash2 className="mr-2 h-4 w-4" />}
        confirmColor="bg-red-600 hover:bg-red-700"
        isLoading={deleting}
        loadingText="Deleting..."
        onConfirm={() => handleDeleteProduct(deleteConfirmProduct?.id)}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setDeleteConfirmProduct(null);
        }}
      />

      {/* Batch Delete Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showBatchDeleteConfirm}
        title="Confirm Batch Delete"
        message={`Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`}
        confirmText="Delete All Selected"
        confirmIcon={<Trash2 className="mr-2 h-4 w-4" />}
        confirmColor="bg-red-600 hover:bg-red-700"
        isLoading={deleting}
        loadingText="Deleting..."
        onConfirm={handleBatchDelete}
        onCancel={() => setShowBatchDeleteConfirm(false)}
      />
    </div>
  );
};

export default ProductsPage;