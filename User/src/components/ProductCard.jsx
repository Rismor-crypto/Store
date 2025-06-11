import React, { useState } from 'react';
import { ShoppingCart, Check, Minus, Plus } from 'lucide-react';
import { useCartContext } from '../context/CartContext';
import { useShoppingMode } from '../context/ShoppingModeContext';
import { useNavigate } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCartContext();
  const { isWholesaleMode } = useShoppingMode();
  const navigate = useNavigate();
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(0); // Initialize to 0

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't add to cart if quantity is 0
    if (quantity === 0) {
      return;
    }
    
    addToCart({
      ...product,
      isWholesale: isWholesaleMode && product.wholesale_price > 0
    }, { quantity });
    setIsAddedToCart(true);
    setTimeout(() => {
      setIsAddedToCart(false);
    }, 2000);
  };

  // Calculate case count for the current quantity
  const getCaseCount = () => {
    if (!product || quantity === 0) return 0;
    return Math.floor(quantity / product.case_pack);
  };

  // Calculate eaches count (remainder after cases)
  const getEachesCount = () => {
    if (!product) return quantity;
    if (quantity === 0) return 0;
    return quantity % product.case_pack;
  };

  // Format quantity as "X case(s) + Y each(es)"
  const getFormattedQuantity = () => {
    if (!product || quantity === 0) return '0 items';

    const cases = getCaseCount();
    const eaches = getEachesCount();

    if (cases > 0 && eaches > 0) {
      return `${cases}c + ${eaches}e`;
    } else if (cases > 0) {
      return `${cases} case${cases !== 1 ? 's' : ''}`;
    } else {
      return `${eaches} each${eaches !== 1 ? 'es' : ''}`;
    }
  };

  // Handle increasing quantity by 1
  const handleIncreaseQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  // Handle decreasing quantity by 1
  const handleDecreaseQuantity = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle direct input for eaches
  const handleEachesChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newEaches = parseInt(e.target.value) || 0;
    if (newEaches >= 0) {
      const cases = getCaseCount();
      const newQuantity = (cases * product.case_pack) + newEaches;
      setQuantity(Math.max(0, newQuantity));
    }
  };

  // Handle increasing cases by 1
  const handleIncreaseCases = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    const currentCases = getCaseCount();

    // If we're going from 0 cases to 1 case, set to exactly 1 case (reset eaches to 0)
    if (currentCases === 0) {
      setQuantity(product.case_pack);
    } else {
      setQuantity(quantity + product.case_pack);
    }
  };

  // Handle decreasing cases by 1
  const handleDecreaseCases = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product) return;
    const newQuantity = quantity - product.case_pack;
    if (newQuantity >= 0) {
      setQuantity(newQuantity);
    } else {
      setQuantity(0);
    }
  };

// Handle direct input for cases
const handleCasesChange = (e) => {
  e.preventDefault();
  e.stopPropagation();
  const newCases = parseInt(e.target.value) || 0;
  if (newCases >= 0) {
    const currentCases = getCaseCount();
    const currentEaches = getEachesCount();
    
    // If we're going from 0 cases to any number of cases and we have eaches, reset eaches to 0
    if (currentCases === 0 && newCases > 0 && currentEaches > 0) {
      const newQuantity = newCases * product.case_pack;
      setQuantity(Math.max(0, newQuantity));
    } else {
      // Normal behavior - keep eaches and adjust cases
      const eaches = getEachesCount();
      const newQuantity = (newCases * product.case_pack) + eaches;
      setQuantity(Math.max(0, newQuantity));
    }
  }
};

  // Determine which price to show based on mode
  const displayPrice = isWholesaleMode && product.wholesale_price > 0 
    ? product.wholesale_price 
    : product.price;

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjwvc3ZnPg==';

  // Check if add to cart should be disabled
  const isAddToCartDisabled = quantity === 0;

  // List view
  if (viewMode === 'list') {
    return (
      <div className="flex items-center border border-gray-200 p-2 md:p-4 cursor-pointer"
        onClick={() => navigate(`/items/${product.id}`)}
        title={product.description}
      >
        <div className="w-20 sm:w-24 h-20 sm:h-24 mr-3 sm:mr-6 relative flex-shrink-0">
          <LazyLoadImage
            src={product.image_url}
            alt={product.description}
            effect="blur"
            placeholderSrc={placeholderImage}
            className="w-full h-full object-contain"
            wrapperClassName="w-full h-full"
          />
          {product.discount > 0 && (
            <div className="absolute top-0 left-0 bg-blue-700 text-white text-xs px-1 py-0.5 sm:px-2 sm:py-1">
              Save {product.discount !== 0 ? ((displayPrice - product.discount) / displayPrice * 100).toFixed(0) : "0"}%
            </div>
          )}
        </div>

        <div className="flex-grow min-w-0">
          <div className='flex flex-col space-y-2'>
            <div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base line-clamp-2">
                {product.description}
              </h3>
              <div className="flex items-center flex-wrap mt-1">
                {product.discount ? (
                  <>
                    <span className="text-red-600 font-bold text-lg sm:text-xl mr-2">
                      ${product.discount.toFixed(2)}
                    </span>
                    <span className="text-gray-400 line-through text-xs sm:text-sm mr-2">
                      ${displayPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-bold text-lg sm:text-xl mr-2">
                    ${displayPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-gray-500 text-xs">
                    Case Pack: {product.case_pack}
                </span>
              </div>
            </div>
            
            {/* Quantity Controls and Add to Cart for List View */}
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Quantity Controls */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Eaches Control */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 hidden sm:inline">Each:</span>
                  <div className="flex items-center border rounded-xs">
                    <button
                      type='button'
                      onClick={handleDecreaseQuantity}
                      className="p-1 hover:bg-gray-100 disabled:opacity-50"
                      aria-label="Decrease quantity"
                      disabled={quantity === 0}
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={getEachesCount()}
                      onChange={handleEachesChange}
                      onClick={(e) => e.stopPropagation()}
                      className="px-1 py-1 text-xs w-8 text-center border-0 focus:outline-none focus:ring-0"
                      min="0"
                    />
                    <button
                      type='button'
                      onClick={handleIncreaseQuantity}
                      className="p-1 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Cases Control */}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-600 hidden sm:inline">Case:</span>
                  <div className="flex items-center border rounded-xs">
                    <button
                      type='button'
                      onClick={handleDecreaseCases}
                      className="p-1 hover:bg-gray-100 disabled:opacity-50"
                      aria-label="Decrease cases"
                      disabled={getCaseCount() === 0}
                    >
                      <Minus size={12} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={getCaseCount()}
                      onChange={handleCasesChange}
                      onClick={(e) => e.stopPropagation()}
                      className="px-1 py-1 text-xs w-8 text-center border-0 focus:outline-none focus:ring-0"
                      min="0"
                    />
                    <button
                      type='button'
                      onClick={handleIncreaseCases}
                      className="p-1 hover:bg-gray-100"
                      aria-label="Increase cases"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button 
                type="button"
                title={isAddToCartDisabled ? "Select quantity to add to cart" : "Add to Cart"}
                onClick={handleAddToCart}
                disabled={isAddToCartDisabled}
                className={`
                  relative p-4 sm:p-5 flex items-center overflow-hidden rounded-xs text-xs sm:text-sm flex-shrink-0
                  ${isAddToCartDisabled 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
                  }
                `}
              >
                {/* Main Add to Cart Content */}
                <div 
                  className={`
                    flex items-center space-x-1 transition-all duration-300
                    ${isAddedToCart ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}
                    absolute inset-0 flex justify-center items-center
                  `}
                >
                  <ShoppingCart size={14} />
                  <span className="hidden xs:inline">Add</span>
                </div>

                {/* Added to Cart Notification */}
                <div 
                  className={`
                    flex items-center space-x-1 transition-all duration-300
                    ${isAddedToCart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
                    absolute inset-0 flex justify-center items-center
                  `}
                >
                  <Check size={14} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="relative border border-gray-200 p-2 md:p-4 cursor-pointer rounded-xs"
      onClick={() => navigate(`/items/${product.id}`)}
      title={product.description}
    >
      {product.discount > 0 && (
        <div className="absolute top-0 right-0 bg-blue-700 text-white text-xs px-1 sm:px-2 py-1 z-50 rounded-bl-xs">
          Save {product.discount !== 0 ? ((displayPrice - product.discount) / displayPrice * 100).toFixed(0) : "0"}%
        </div>
      )}
      <div className="relative mb-3">
        <LazyLoadImage
          src={product.image_url}
          alt={product.description}
          effect="blur"
          placeholderSrc={placeholderImage}
          className="w-full h-32 sm:h-40 md:h-48 object-contain"
          wrapperClassName="w-full h-32 sm:h-40 md:h-48"
        />
      </div>

      <div>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </h3>
        
        {/* Price Section */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1 flex-wrap">
            {product.discount ? (
              <>
                <span className="text-red-600 font-bold text-sm sm:text-base">
                  ${product.discount.toFixed(2)}
                </span>
                <span className="text-gray-600 line-through text-xs">
                  ${displayPrice.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="text-red-600 font-bold text-sm sm:text-base">
                ${displayPrice.toFixed(2)}
              </span>
            )}
          </div>
          <div className="text-gray-500 text-xs mt-1">
              Case Pack: {product.case_pack}
          </div>
        </div>

        {/* Quantity Controls for Grid View */}
        <div className="mb-3 space-y-2">
          {/* Eaches Control */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Each:</span>
            <div className="flex items-center border rounded-xs">
              <button
                type='button'
                onClick={handleDecreaseQuantity}
                className="p-1 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Decrease quantity"
                disabled={quantity === 0}
              >
                <Minus size={12} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={getEachesCount()}
                onChange={handleEachesChange}
                onClick={(e) => e.stopPropagation()}
                className="px-1 py-1 text-xs w-10 text-center border-0 focus:outline-none focus:ring-0"
                min="0"
              />
              <button
                type='button'
                onClick={handleIncreaseQuantity}
                className="p-1 hover:bg-gray-100"
                aria-label="Increase quantity"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>

          {/* Cases Control */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Case:</span>
            <div className="flex items-center border rounded-xs">
              <button
                type='button'
                onClick={handleDecreaseCases}
                className="p-1 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Decrease cases"
                disabled={getCaseCount() === 0}
              >
                <Minus size={12} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={getCaseCount()}
                onChange={handleCasesChange}
                onClick={(e) => e.stopPropagation()}
                className="px-1 py-1 text-xs w-10 text-center border-0 focus:outline-none focus:ring-0"
                min="0"
              />
              <button
                type='button'
                onClick={handleIncreaseCases}
                className="p-1 hover:bg-gray-100"
                aria-label="Increase cases"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Add to Cart Button for Grid View */}
        <button 
          type="button"
          title={isAddToCartDisabled ? "Select quantity to add to cart" : "Add to Cart"}
          onClick={handleAddToCart}
          disabled={isAddToCartDisabled}
          className={`
            relative w-full py-4 sm:py-4 text-xs sm:text-sm flex items-center justify-center overflow-hidden rounded-xs
            ${isAddToCartDisabled 
              ? 'bg-gray-400 text-white cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600 cursor-pointer'
            }
          `}
        >
          {/* Main Add to Cart Content */}
          <div 
            className={`
              flex items-center space-x-1 transition-all duration-300
              ${isAddedToCart ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}
              absolute inset-0 flex justify-center items-center
            `}
          >
            <ShoppingCart size={14} />
            <span className='font-semibold'>
              {isAddToCartDisabled ? 'Select Quantity' : 'Add to Cart'}
            </span>
          </div>

          {/* Added to Cart Notification */}
          <div 
            className={`
              flex items-center space-x-1 transition-all duration-300
              ${isAddedToCart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
              absolute inset-0 flex justify-center items-center
            `}
          >
            <Check size={14} />
            <span className='font-semibold text-xs'>{getFormattedQuantity()}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;