import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import supabase from '../utils/supabase';

const OrderContext = createContext();

export const useOrderContext = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeCounts, setActiveCounts] = useState({
    pending: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: null,
    searchTerm: '',
    type: 'all'
  });

  // Fetch orders with pagination and filters
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      // Start with base query
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' });
      
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      if (filters.searchTerm) {
        query = query.or(
          `order_number.ilike.%${filters.searchTerm}%,customer_email.ilike.%${filters.searchTerm}%,customer_last_name.ilike.%${filters.searchTerm}%`
        );
      }
      
      if (filters.dateRange && filters.dateRange.from && filters.dateRange.to) {
        query = query
          .gte('created_at', filters.dateRange.from)
          .lte('created_at', filters.dateRange.to);
      }

      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      // Add pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;
      
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) throw error;
      
      setOrders(data || []);
      setTotalOrders(count || 0);
      setTotalPages(Math.ceil((count || 0) / pageSize));
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // Refresh counts
      fetchOrderCounts();
      
      return { success: true, data };
    } catch (err) {
      console.error('Error updating order status:', err);
      return { success: false, error: err.message };
    }
  };

  // Get order details with items
  const getOrderDetails = async (orderId) => {
    try {
      // Fetch order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
        
      if (orderError) throw orderError;
      
      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
        
      if (itemsError) throw itemsError;
      
      return { 
        success: true, 
        data: { 
          ...order, 
          items: items || [] 
        } 
      };
    } catch (err) {
      console.error('Error fetching order details:', err);
      return { success: false, error: err.message };
    }
  };

  // Fetch counts for different statuses
  const fetchOrderCounts = useCallback(async () => {
    try {
      // Total count
      const { count: totalCount, error: totalError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
        
      if (totalError) throw totalError;
      
      // Pending count
      const { count: pendingCount, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
        
      if (pendingError) throw pendingError;
      
      // Completed count
      const { count: completedCount, error: completedError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
        
      if (completedError) throw completedError;
      
      // Cancelled count
      const { count: cancelledCount, error: cancelledError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'cancelled');
        
      if (cancelledError) throw cancelledError;
      
      setActiveCounts({
        total: totalCount || 0,
        pending: pendingCount || 0,
        completed: completedCount || 0,
        cancelled: cancelledCount || 0
      });
    } catch (err) {
      console.error('Error fetching order counts:', err);
    }
  }, []);

  // Fetch data when needed dependencies change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);
  
  // Fetch counts on initial load
  useEffect(() => {
    fetchOrderCounts();
  }, [fetchOrderCounts]);

  // Set up real-time subscription separately
  useEffect(() => {
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          fetchOrders();
          fetchOrderCounts();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchOrders, fetchOrderCounts]);

  const value = {
    orders,
    loading,
    totalOrders,
    totalPages,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    activeCounts,
    updateOrderStatus,
    getOrderDetails,
    fetchOrders
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};