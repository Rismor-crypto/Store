import React from "react";

const OrderSummary = ({ cartItems, totalWithDiscount, onPlaceOrder, getDiscountedPrice }) => {
  return (
    <div className="bg-white rounded-xs p-4 sm:p-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="space-y-3">
        {/* Order Items */}
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-8">
            <div className="flex flex-wrap items-center gap-1 mb-2 sm:mb-0">
              <span className="font-medium">{item.description}</span>
              <span className="text-gray-500 text-sm">x{item.quantity}</span>
            </div>

            <div className="text-right">
              {item.discount && item.discount > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="line-through text-gray-400 text-sm">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <span className="font-medium">
                    ${(getDiscountedPrice(item) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              )}
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="flex justify-between items-center font-bold border-t border-gray-200 pt-4 mt-2">
          <span>Total</span>
          <span className="text-lg">${totalWithDiscount.toFixed(2)}</span>
        </div>

        {/* Place Order Button */}
        <button
          onClick={onPlaceOrder}
          className="w-full bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600 transition font-medium cursor-pointer"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;