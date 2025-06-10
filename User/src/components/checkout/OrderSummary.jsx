import React from "react";
import { Link } from "react-router-dom";

const OrderSummary = ({ 
  cartItems, 
  totalWithDiscount, 
  onPlaceOrder, 
  getDiscountedPrice, 
  showMobileButton = true,
  isProcessing = false
}) => {
  // Get the final price for an item based on whether it has a discount
  const getFinalPrice = (item) => {
    if (item.discount && item.discount > 0) {
      return (item.discount * item.quantity).toFixed(2);
    }
    return (item.price * item.quantity).toFixed(2);
  };

  // Calculate case count for an item
  const getCaseCount = (item) => {
    return Math.floor(item.quantity / item.case_pack);
  };

  // Calculate eaches count (remainder after cases)
  const getEachesCount = (item) => {
    return item.quantity % item.case_pack;
  };

  // Format quantity as "X case(s) + Y each(es)"
  const getFormattedQuantity = (item) => {
    const cases = getCaseCount(item);
    const eaches = getEachesCount(item);
    
    if (cases > 0 && eaches > 0) {
      return `${cases} case${cases !== 1 ? 's' : ''} + ${eaches} each${eaches !== 1 ? 'es' : ''}`;
    } else if (cases > 0) {
      return `${cases} case${cases !== 1 ? 's' : ''}`;
    } else {
      return `${eaches} each${eaches !== 1 ? 'es' : ''}`;
    }
  };

  return (
    <div className="bg-white rounded-xs p-4 sm:p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3">
        {/* Order Items */}
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1">
              <span className="font-medium">{item.description}</span>
              <span className="text-gray-500 text-sm">
                ({getFormattedQuantity(item)})
              </span>
            </div>

            <div className="text-right">
              {item.discount && item.discount > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-400 text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="font-medium">
                    ${getFinalPrice(item)}
                  </span>
                </div>
              ) : (
                <span className="font-medium">${getFinalPrice(item)}</span>
              )}
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="flex justify-between items-center font-bold border-t border-gray-200 pt-4 mt-2">
          <span>Total</span>
          <span className="text-lg">${totalWithDiscount.toFixed(2)}</span>
        </div>
        {/* Special Offers Link */}
        <div className="text-center mt-2">
          <Link
            to="/offers" 
            className="text-blue-500 hover:text-blue-600 text-sm font-bold"
          >
            Don't forget to check out our special offers!
          </Link>
        </div>

        {/* Place Order Button - Only show on desktop or when explicitly requested */}
        {showMobileButton && (
          <button
            onClick={onPlaceOrder}
            disabled={isProcessing}
            className="w-full bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600 transition font-medium cursor-pointer md:block disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Place Order"}
          </button>
        )}

        {/* Desktop Place Order Button - Always show on desktop */}
        <button
          onClick={onPlaceOrder}
          disabled={isProcessing}
          className="hidden md:block w-full bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600 transition font-medium cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;