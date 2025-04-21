import React, { useState, useEffect, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import { useOrderContext } from '../../context/OrderContext';

const OrderFilters = () => {
  const { filters, setFilters, setCurrentPage } = useOrderContext();
  const [searchInput, setSearchInput] = useState(filters.searchTerm);
  
  // Use a ref to store the timeout ID
  const searchTimeoutRef = useRef(null);
  
  // Handle status change
  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setFilters(prev => ({ ...prev, status: newStatus }));
    setCurrentPage(1);
  };

  // Handle type change
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setFilters(prev => ({ ...prev, type: newType }));
    setCurrentPage(1);
  };

  // Debounced search implementation
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm: value }));
      setCurrentPage(1);
    }, 500);
  };

  // Keep search input in sync with filters
  useEffect(() => {
    setSearchInput(filters.searchTerm);
  }, [filters.searchTerm]);

  // Clean up function to clear timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      status: 'all',
      dateRange: null,
      searchTerm: '',
      type: 'all'
    });
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.status !== 'all' || filters.searchTerm;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800 mb-2 sm:mb-0 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-gray-500" />
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center text-sm text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Order Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={handleStatusChange}
            className="cursor-pointer block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="status-type" className="block text-sm font-medium text-gray-700 mb-1">
            Order type
          </label>
          <select
            id="status-type"
            value={filters.type}
            onChange={handleTypeChange}
            className="cursor-pointer block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
          >
            <option value="all">All Types</option>
            <option value="wholesale">Wholesale</option>
            <option value="retail">Retail</option>
          </select>
        </div>

        {/* Search Filter - Now with debouncing */}
        <div className="md:col-span-2">
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Search Orders
          </label>
          <div className="flex">
            <input
              type="text"
              id="search-filter"
              placeholder="Search by order #, email, or customer name"
              value={searchInput}
              onChange={handleSearchChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;