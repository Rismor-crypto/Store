import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download,
  CheckCircle, 
  XCircle,
  Loader,
  Package
} from 'lucide-react';
import { useOrderContext } from '../../context/OrderContext';
import { 
  formatCurrency, 
  formatDate, 
  getStatusColorClass,
  exportOrderDetailToCSV
} from '../../utils/orderUtils';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderDetails, updateOrderStatus } = useOrderContext();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        setLoading(true);
        const result = await getOrderDetails(id);
        
        if (result.success) {
          setOrder(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrderDetails();
  }, [id, getOrderDetails]);
  
  const handleStatusChange = async (newStatus) => {
    const result = await updateOrderStatus(id, newStatus);
    
    if (result.success) {
      // Update the local state
      setOrder({ ...order, status: newStatus });
    } else {
      alert(`Failed to update status: ${result.error}`);
    }
  };
  
  const handleExport = () => {
    if (order) {
      exportOrderDetailToCSV(order);
    }
  };
  
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 h-screen">
        <Loader className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-700">Loading details...</span>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error</h2>
        <p className="text-red-700">{error || 'Order not found'}</p>
        <Link to="/orders" className="mt-4 text-blue-600 hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Orders
        </Link>
      </div>
    );
  }
  
  const statusColors = getStatusColorClass(order.status);
  
  return (
    <div className="bg-white rounded-lg shadow-md print:shadow-none">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center print:hidden">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/orders" className="mr-4 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">
            Order #{order.order_number}
          </h1>
          <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {order.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange('completed')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </button>
              
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Cancel
              </button>
            </>
          )}
          
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
          
        </div>
      </div>
      
      {/* Order Information */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Customer Information</h2>
          <div className="bg-gray-50 p-4 rounded-md">
            <p className="font-medium">{order.customer_first_name} {order.customer_last_name}</p>
            <p className="text-gray-600">{order.customer_email}</p>
            <p className="text-gray-600">{order.customer_phone}</p>
            <p className="text-gray-600 whitespace-pre-line mt-2">{order.customer_address}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium text-gray-800 mb-4">Order Summary</h2>
          <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between mb-2">
              <span className="text-gray-600">Order Type:</span>
              <span className="font-medium">{order.type.charAt(0).toUpperCase() + order.type.slice(1)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Date:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${statusColors.text}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Discount:</span>
                <span>{formatCurrency(order.discount_amount)}</span>
              </div>
              <div className="flex justify-between font-medium text-lg">
                <span>Total:</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Order Items */}
      <div className="p-6 border-t border-gray-200">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Order Items</h2>
        
        {order.items && order.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    UPC
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cases
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-wrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.upc}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.cases}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {item.discount_percent ? `${item.discount_percent}%` : '-'}
                      {item.discount_amount > 0 && ` (${formatCurrency(item.discount_amount)})`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.line_total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan="6" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Subtotal:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(order.subtotal)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="6" className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Discount:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(order.discount_amount)}
                  </td>
                </tr>
                <tr>
                  <td colSpan="6" className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    Total:
                  </td>
                  <td className="px-6 py-3 text-right text-sm font-medium text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 p-6 rounded-md text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No items found for this order.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;