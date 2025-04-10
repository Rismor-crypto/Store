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

  const handleQuantityChange = (productId, event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const newQuantity = value === '' ? 1 : parseInt(value, 10);
      updateQuantity(productId, newQuantity);
    }
  };

  const handleQuantityBlur = (productId, event) => {
    const value = event.target.value;
    if (value === '' || parseInt(value, 10) < 1) {
      updateQuantity(productId, 1);
    }
  };

  // New case handling functions
  const handleIncreaseCases = (productId) => {
    const currentItem = cartItems.find(item => item.id === productId);
    updateQuantity(productId, currentItem.quantity + currentItem.case_pack);
  };

  const handleDecreaseCases = (productId) => {
    const currentItem = cartItems.find(item => item.id === productId);
    const newQuantity = currentItem.quantity - currentItem.case_pack;
    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity);
    } else {
      updateQuantity(productId, 1);
    }
  };

  const handleCaseChange = (productId, event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const currentItem = cartItems.find(item => item.id === productId);
      const caseQuantity = value === '' ? 0 : parseInt(value, 10);
      const eachesQuantity = currentItem.quantity % currentItem.case_pack;
      const newQuantity = (caseQuantity * currentItem.case_pack) + eachesQuantity;
      updateQuantity(productId, newQuantity > 0 ? newQuantity : 1);
    }
  };

  const handleCaseBlur = (productId, event) => {
    const value = event.target.value;
    if (value === '') {
      const currentItem = cartItems.find(item => item.id === productId);
      const eachesQuantity = currentItem.quantity % currentItem.case_pack;
      updateQuantity(productId, eachesQuantity > 0 ? eachesQuantity : 1);
    }
  };

  const getDiscountedPrice = (product) => {
    if (product.discount && product.discount > 0) {
      const discountAmount = product.price * (product.discount / 100);
      return (product.price - discountAmount).toFixed(2);
    }
    return product.price.toFixed(2);
  };

  const getProductTotal = (product) => {
    const discountedPrice = parseFloat(getDiscountedPrice(product));
    return (discountedPrice * product.quantity).toFixed(2);
  };

  // Calculate case count for an item
  const getCaseCount = (item) => {
    return Math.floor(item.quantity / item.case_pack);
  };

  // Calculate eaches count (remainder after cases)
  const getEachesCount = (item) => {
    return item.quantity % item.case_pack;
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
                            Save ${((item.discount * item.price) / 100).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span>${item.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className='text-gray-600 text-sm'>Case Pack: {item.case_pack}</div>
                  </div>
                </div>

                {/* Quantity Controls - Bottom Row */}
                <div className="flex flex-col mt-3 pt-3 border-t border-gray-100 space-y-3">
                  {/* Eaches Quantity Control */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium">Eaches:</span>
                      <div className="flex items-center border rounded-xs">
                        <button
                          onClick={() => handleDecreaseQuantity(item.id)}
                          className="p-1.5 rounded-l-xs cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="text"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e)}
                          onBlur={(e) => handleQuantityBlur(item.id, e)}
                          className="w-12 text-center py-1 border-0 focus:ring-0 focus:outline-none"
                          aria-label="Quantity"
                        />
                        <button
                          onClick={() => handleIncreaseQuantity(item.id)}
                          className="p-1.5 rounded-r-xs cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cases Quantity Control */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2 text-sm font-medium pr-2">Cases:</span>
                      <div className="flex items-center border rounded-xs">
                        <button
                          onClick={() => handleDecreaseCases(item.id)}
                          className="p-1.5 rounded-l-xs cursor-pointer"
                          aria-label="Decrease cases"
                        >
                          <Minus size={16} />
                        </button>
                        <input
                          type="text"
                          value={getCaseCount(item)}
                          onChange={(e) => handleCaseChange(item.id, e)}
                          onBlur={(e) => handleCaseBlur(item.id, e)}
                          className="w-12 text-center py-1 border-0 focus:ring-0 focus:outline-none"
                          aria-label="Cases"
                        />
                        <button
                          onClick={() => handleIncreaseCases(item.id)}
                          className="p-1.5 rounded-r-xs cursor-pointer"
                          aria-label="Increase cases"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Product Total */}
                    <div className="font-bold text-base sm:text-lg">
                      <span className='text-gray-500 font-normal'>{getCaseCount(item)} case{getCaseCount(item) !== 1 ? 's' : ''}</span> - ${getProductTotal(item)}
                    </div>
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
                <div key={item.id} className="flex justify-between gap-8">
                  <span>
                    {item.description}
                    <span className="text-gray-500 text-sm ml-1">
                      x{item.quantity} ({getCaseCount(item)} case{getCaseCount(item) !== 1 ? 's' : ''} + {getEachesCount(item)})
                    </span>
                  </span>
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
              {/* Free Delivery Message */}
              <div className="flex items-center text-green-600 py-2">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span className="font-medium">Free delivery on all orders</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-t-gray-200 pt-4">
                <span>Subtotal</span>
                <span>${totalWithDiscount.toFixed(2)}</span>
              </div>
            </div>


            {/* If the subtotal is less than 1500 dollars the user is not allowed to proceed because company only deals with large orders */}
            {totalWithDiscount <= 1500 && (
              <div className="text-red-500 text-sm mt-2">
                <p>Note: Minimum order amount is $1500.</p>
                <p>Please add more items to your cart.</p>
              </div>
            )}

            <Link
              to={totalWithDiscount > 1500 ? "/checkout" : "#"}
              className={`w-full py-3 rounded-xs mt-6 block text-center transition ${totalWithDiscount > 1500 ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
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