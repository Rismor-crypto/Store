import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, CheckCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColorClass, exportOrderDetailToCSV } from '../../utils/orderUtils';
import { useOrderContext } from '../../context/OrderContext';

const OrderTable = () => {
  const { orders, loading, updateOrderStatus, getOrderDetails } = useOrderContext();
  const navigate = useNavigate();

  const handleStatusChange = async (e, orderId, newStatus) => {
    // Stop propagation to prevent row click navigation when clicking status buttons
    e.stopPropagation();
    
    const result = await updateOrderStatus(orderId, newStatus);
    if (!result.success) {
      // Handle error
      alert(`Failed to update status: ${result.error}`);
    }
  };

  const handleDownload = async (e, orderId) => {
    // Stop propagation to prevent row click navigation when clicking download
    e.stopPropagation();
    
    const result = await getOrderDetails(orderId);
    if (result.success) {
      exportOrderDetailToCSV(result.data);
    } else {
      alert(`Failed to download order: ${result.error}`);
    }
  };

  const handleRowClick = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No orders found with the current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => {
            const statusColors = getStatusColorClass(order.status);
            
            return (
              <tr 
                key={order.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(order.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {order.order_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>
                    {order.customer_first_name} {order.customer_last_name}
                  </div>
                  <div className="text-xs text-gray-400">{order.customer_email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(order.total_amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.type.charAt(0).toUpperCase() + order.type.slice(1)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/orders/${order.id}`);
                      }}
                      className="text-blue-600 hover:text-blue-900 cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    
                    <button
                      onClick={(e) => handleDownload(e, order.id)}
                      className="text-gray-600 hover:text-gray-900 cursor-pointer"
                      title="Download CSV"
                    >
                      <Download size={18} />
                    </button>
                    
                    {order.status === 'pending' ? (
                      <button
                        onClick={(e) => handleStatusChange(e, order.id, 'completed')}
                        className="text-green-600 hover:text-green-900 cursor-pointer"
                        title="Mark as Completed"
                      >
                        <CheckCircle size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleStatusChange(e, order.id, 'pending')}
                        className="text-yellow-600 hover:text-yellow-900 cursor-pointer"
                        title="Mark as Pending"
                      >
                        <CheckCircle size={18} />
                      </button>
                    )}    
                    
                    {order.status !== 'cancelled' ? (
                      <button
                        onClick={(e) => handleStatusChange(e, order.id, 'cancelled')}
                        className="text-red-600 hover:text-red-900 cursor-pointer"
                        title="Cancel Order"
                      >
                        <XCircle size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => handleStatusChange(e, order.id, 'pending')}
                        className="text-yellow-600 hover:text-yellow-900 cursor-pointer"
                        title="Mark as Pending"
                      >
                        <XCircle size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;