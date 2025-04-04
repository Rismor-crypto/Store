import React from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    getTotalPrice
  } = useCartContext();

  const { totalWithoutDiscount, totalWithDiscount } = getTotalPrice();

  const handleIncreaseQuantity = (productId) => {
    const currentItem = cartItems.find(item => item.id === productId);
    updateQuantity(productId, (currentItem.quantity || 1) + 1);
  };

  const handleDecreaseQuantity = (productId) => {
    const currentItem = cartItems.find(item => item.id === productId);
    if (currentItem.quantity > 1) {
      updateQuantity(productId, (currentItem.quantity || 1) - 1);
    }
  };

  // Calculate discounted price for a product
  const getDiscountedPrice = (product) => {
    // Check if discount exists and is greater than 0
    if (product.discount && product.discount > 0) {
      const discountAmount = product.price * (product.discount / 100);
      return (product.price - discountAmount).toFixed(2);
    }
    // Return original price if no discount
    return product.price.toFixed(2);
  };

  // Calculate individual product total with potential discount
  const getProductTotal = (product) => {
    const discountedPrice = parseFloat(getDiscountedPrice(product));
    return (discountedPrice * product.quantity).toFixed(2);
  };

  if (cartItems.length === 0) {
    return (
      <>
        <div className="container mx-auto px-4 py-10 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/"
            className="bg-red-500 text-white px-6 py-3 rounded-md hover:bg-red-600 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </>
    );
  }

  return (
    <main className="bg-white">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">Your Cart</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 place-items-start">
          {/* Cart Items */}
          <div className="md:col-span-1 w-full space-y-4">
            {cartItems.map(item => (
              <div
                key={item.id}
                className="rounded-xs p-3 sm:p-4 border border-gray-200"
              >
                <div className="flex flex-row space-x-3 sm:space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                    <img
                      src={item.image_url}
                      alt={item.description}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base sm:text-lg font-semibold truncate pr-2">{item.description}</h3>

                      {/* Remove Item - Top Right on Mobile */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 cursor-pointer mt-1 shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Price Information */}
                    <div className="text-gray-600 text-sm mt-1">
                      {item.discount && item.discount > 0 ? (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="line-through">${item.price.toFixed(2)}</span>
                          <span className="text-blue-600">${getDiscountedPrice(item)}</span>
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-xs text-xs">
                            {item.discount}% OFF
                          </span>
                        </div>
                      ) : (
                        <span>${item.price.toFixed(2)}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity and Total - Bottom Row */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  {/* Quantity Control */}
                  <div className="flex items-center border rounded-xs">
                    <button
                      onClick={() => handleDecreaseQuantity(item.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-l-xs cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-3 py-1">{item.quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(item.id)}
                      className="p-1.5 hover:bg-gray-100 rounded-r-xs cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Product Total */}
                  <div className="font-bold text-base sm:text-lg">
                    ${getProductTotal(item)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="rounded-xs border border-gray-200 p-6 w-full">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.description} <span className="text-gray-500 text-sm">x{item.quantity}</span></span>
                  <div>
                    {/* Show original and discounted prices if applicable */}
                    {item.discount && item.discount > 0 ? (
                      <>
                        <span className="line-through mr-2 text-gray-400">${(item.price * item.quantity).toFixed(2)}</span>
                        <span>${getProductTotal(item)}</span>
                      </>
                    ) : (
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-between font-bold text-lg border-t border-t-gray-200 pt-4">
                <span>Subtotal</span>
                <span>${totalWithDiscount.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full bg-red-500 text-white py-3 rounded-xs mt-6 block text-center hover:bg-red-600 transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;