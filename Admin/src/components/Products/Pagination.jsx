import React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from "lucide-react";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  pageSize,
  onPageChange,
  onPageSizeChange
}) => {
  // Calculate page info
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  // Generate page buttons
  const renderPageButtons = () => {
    const pageButtons = [];
    
    // Always show first page
    pageButtons.push(
      <button
        key="page-1"
        className={`px-3 py-1 rounded-md ${
          currentPage === 1 
            ? "bg-blue-600 text-white" 
            : "bg-white text-gray-700 hover:bg-gray-100"
        }`}
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
      >
        1
      </button>
    );
    
    // Logic for which page buttons to show
    let startPage = Math.max(2, currentPage - 2);
    let endPage = Math.min(totalPages - 1, currentPage + 2);
    
    // Show ellipsis if needed
    if (startPage > 2) {
      pageButtons.push(
        <span key="ellipsis-1" className="px-3 py-1">
          ...
        </span>
      );
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(
        <button
          key={`page-${i}`}
          className={`px-3 py-1 rounded-md ${
            currentPage === i 
              ? "bg-blue-600 text-white" 
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      );
    }
    
    // Show ellipsis if needed
    if (endPage < totalPages - 1) {
      pageButtons.push(
        <span key="ellipsis-2" className="px-3 py-1">
          ...
        </span>
      );
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageButtons.push(
        <button
          key={`page-${totalPages}`}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages 
              ? "bg-blue-600 text-white" 
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        >
          {totalPages}
        </button>
      );
    }
    
    return pageButtons;
  };
  
  // Render page size options
  const pageSizeOptions = [10, 20, 50, 100];
  
  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
      <div className="flex-1 flex justify-between sm:hidden">
        {/* Mobile pagination */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        {/* Desktop pagination */}
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        
        <div className="flex items-center">
          {/* Page size selector */}
          <div className="mr-4">
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
          
          {/* Navigation buttons */}
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">First</span>
              <ChevronsLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === 1
                  ? "text-gray-300"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {/* Page numbers */}
            <div className="hidden md:flex">
              {renderPageButtons()}
            </div>
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                currentPage === totalPages
                  ? "text-gray-300"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Last</span>
              <ChevronsRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;