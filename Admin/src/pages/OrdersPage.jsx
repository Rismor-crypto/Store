import React from 'react';
import { ShoppingBag, ShoppingCart, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useOrderContext } from '../context/OrderContext';
import OrderFilters from '../components/orders/OrderFilters';
import OrderTable from '../components/orders/OrderTable';
import Pagination from '../components/common/Pagination';

const Orders = () => {
  const { 
    loading, 
    activeCounts, 
    totalOrders, 
    totalPages, 
    currentPage, 
    setCurrentPage, 
    pageSize, 
    setPageSize 
  } = useOrderContext();

  const statusCards = [
    {
      title: 'Total Orders',
      count: activeCounts.total,
      icon: <ShoppingBag className="h-6 w-6 text-blue-600" />,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending',
      count: activeCounts.pending,
      icon: <Clock className="h-6 w-6 text-yellow-600" />,
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Completed',
      count: activeCounts.completed,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Cancelled',
      count: activeCounts.cancelled,
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <ShoppingCart className="h-6 w-6 mr-2" />
          Orders Management
        </h1>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusCards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center">
            <div className={`p-3 rounded-full ${card.bgColor} mr-4`}>
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <OrderFilters />

      {/* Order Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <OrderTable />
      </div>

      {/* Pagination */}
      {!loading && totalOrders > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalOrders}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
};

export default Orders;