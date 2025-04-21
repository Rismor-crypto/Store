import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      ...product,
      isWholesale: isWholesaleMode && product.wholesale_price > 0
    });
    setIsAddedToCart(true);
    setTimeout(() => {
      setIsAddedToCart(false);
    }, 2000);
  };

  // Calculate discount percentage
  const discountPercentage = product.discount 
    ? Math.round((product.discount * product.price) / 100) 
    : 0;

  // Determine which price to show based on mode
  const displayPrice = isWholesaleMode && product.wholesale_price > 0 
    ? product.wholesale_price 
    : product.price;

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjwvc3ZnPg==';

  // List view
  if (viewMode === 'list') {
    return (
      <div className="flex items-center border border-gray-200 p-2 md:p-4 cursor-pointer"
      onClick={() => navigate(`/products/${product.id}`)}
      title={product.description}
      >
        <div className="w-24 h-24 mr-6 relative">
          <LazyLoadImage
            src={product.image_url}
            alt={product.description}
            effect="blur"
            placeholderSrc={placeholderImage}
            className="w-full h-full object-contain"
            wrapperClassName="w-full h-full"
          />
          {product.discount > 0 && (
            <div className="absolute top-0 left-0 bg-blue-700 text-white text-xs px-2 py-1">
              Save {product.discount !== 0 ? ((displayPrice - product.discount) / displayPrice * 100).toFixed(2) : "0"} %
            </div>
          )}
        </div>

        <div className="flex-grow">
          <div className='flex justify-between items-center'>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                {product.description}
              </h3>
              <div className="flex items-center flex-wrap">
                {product.discount ? (
                  <>
                    <span className="text-red-600 font-bold text-xl mr-2">
                      ${product.discount.toFixed(2)}
                    </span>
                    <span className="text-gray-400 line-through text-sm mr-2">
                      ${displayPrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-red-600 font-bold text-xl mr-2">
                    ${displayPrice.toFixed(2)}
                  </span>
                )}
                
                {/* Show wholesale price for reference when in retail mode */}
                {!isWholesaleMode && product.wholesale_price > 0 && (
                  <span className="text-gray-500 text-xs">
                    Wholesale: ${product.wholesale_price.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            <button 
              type="button"
              title="Add to Cart"
              onClick={(e) => handleAddToCart(e)}
              className="relative bg-red-500 text-white px-5 py-5 flex items-center hover:bg-red-600 overflow-hidden"
            >
              {/* Main Add to Cart Content */}
              <div 
                className={`
                  flex items-center space-x-2 transition-all duration-300
                  ${isAddedToCart ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}
                  absolute inset-0 flex justify-center items-center
                `}
              >
                <ShoppingCart size={16} />
              </div>

              {/* Added to Cart Notification */}
              <div 
                className={`
                  flex items-center space-x-2 transition-all duration-300
                  ${isAddedToCart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
                  absolute inset-0 flex justify-center items-center
                `}
              >
                <Check size={16} />
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="relative border border-gray-200 p-2 md:p-4 cursor-pointer rounded-xs"
      onClick={() => navigate(`/products/${product.id}`)}
      title={product.description}
    >
      {product.discount > 0 && (
        <div className="absolute top-0 right-0 bg-blue-700 text-white text-xs px-2 py-1 z-50">
          Save {product.discount !== 0 ? ((displayPrice - product.discount) / displayPrice * 100).toFixed(2) : "0"}%
        </div>
      )}
      <div className="relative mb-4">
        <LazyLoadImage
          src={product.image_url}
          alt={product.description}
          effect="blur"
          placeholderSrc={placeholderImage}
          className="w-full h-48 object-contain"
          wrapperClassName="w-full h-48"
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-2 truncate">
          {product.description}
        </h3>
        <div className="flex justify-between items-center mt-2">
          <div>
            {product.discount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-red-600 font-bold">
                  ${product.discount.toFixed(2)}
                </span>
                <span className="text-gray-600 line-through text-xs">
                  ${displayPrice.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-red-600 font-bold">
                ${displayPrice.toFixed(2)}
              </span>
            )}
            
            {/* Show wholesale price for reference when in retail mode */}
            {!isWholesaleMode && product.wholesale_price > 0 && (
              <div className="text-gray-500 text-xs mt-1">
                Wholesale: ${product.wholesale_price.toFixed(2)}
              </div>
            )}
            {isWholesaleMode &&  (
              <div className="text-gray-500 text-xs mt-1">
                Retail: ${product.price.toFixed(2)}
              </div>
            )}
          </div>
          <button 
            type="button"
            title="Add to Cart"
            onClick={(e) => handleAddToCart(e)}
            className="relative bg-red-500 text-white px-8 py-4 text-xs flex items-center space-x-1 hover:bg-red-600 cursor-pointer overflow-hidden rounded-xs"
          >
            {/* Main Add to Cart Content */}
            <div 
              className={`
                flex items-center space-x-1 transition-all duration-300
                ${isAddedToCart ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}
                absolute inset-0 flex justify-center items-center
              `}
            >
              <ShoppingCart size={12} />
              <span className='font-semibold'>Add</span>
            </div>

            {/* Added to Cart Notification */}
            <div 
              className={`
                flex items-center space-x-1 transition-all duration-300
                ${isAddedToCart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
                absolute inset-0 flex justify-center items-center
              `}
            >
              <Check size={12} />
              <span className='font-semibold'>Added</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;