import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { useShoppingMode } from '../context/ShoppingModeContext';
import CategoryContainer from '../components/CategoryContainer';
import FilterModal from '../components/FilterModal';
import { ShoppingCart, Minus, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import supabase from '../utils/supabase';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const { addToCart } = useCartContext();
  const { isWholesaleMode } = useShoppingMode();

  const getSavingsPercentage = (product) => {
    const basePrice = getDisplayPrice(product);
    if (product.discount && product.discount > 0) {
      return ((basePrice - product.discount) / basePrice * 100).toFixed(1);
    }
    return "0";
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      setIsLoading(true);
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*, categories(name)')
          .eq('id', id)
          .single();
  
        if (productError) throw productError;
  
        setProduct(productData);
  
        if (productData?.category) {
          let query = supabase
            .from('products')
            .select('*')
            .eq('category', productData.category)
            .neq('id', id);
          
          if (isWholesaleMode) {
            query = query.gt('wholesale_price', 0);
          }
          
          const { data: relatedData, error: relatedError } = await query.limit(5);
  
          if (relatedError) throw relatedError;
          setRelatedProducts(relatedData || []);
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (id) fetchProductDetails();
  }, [id, isWholesaleMode]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart({
        ...product,
        isWholesale: isWholesaleMode && product.wholesale_price > 0
      }, { quantity });

      setIsAddedToCart(true);
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);
    }
  };

  const getCaseCount = () => {
    if (!product) return 0;
    return Math.floor(quantity / product.case_pack);
  };

  const getEachesCount = () => {
    if (!product) return quantity;
    return quantity % product.case_pack;
  };

  const getFormattedQuantity = () => {
    if (!product) return `${quantity} each${quantity !== 1 ? 'es' : ''}`;

    const cases = getCaseCount();
    const eaches = getEachesCount();

    if (cases > 0 && eaches > 0) {
      return `${cases} case${cases !== 1 ? 's' : ''} + ${eaches} each${eaches !== 1 ? 'es' : ''}`;
    } else if (cases > 0) {
      return `${cases} case${cases !== 1 ? 's' : ''}`;
    } else {
      return `${eaches} each${eaches !== 1 ? 'es' : ''}`;
    }
  };

  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleEachesChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const eachesValue = value === '' ? 0 : parseInt(value, 10);
      const cases = getCaseCount();
      const newQuantity = (cases * (product?.case_pack || 1)) + eachesValue;
      setQuantity(newQuantity > 0 ? newQuantity : 1);
    }
  };

  const handleEachesBlur = (event) => {
    const value = event.target.value;
    if (value === '' || parseInt(value, 10) < 1 && getCaseCount() === 0) {
      const cases = getCaseCount();
      setQuantity((cases * (product?.case_pack || 1)) + 1);
    }
  };

  const handleIncreaseCases = () => {
    if (!product) return;
    const currentCases = getCaseCount();

    if (currentCases === 0) {
      setQuantity(product.case_pack);
    } else {
      setQuantity(quantity + product.case_pack);
    }
  };

  const handleDecreaseCases = () => {
    if (!product) return;
    const newQuantity = quantity - product.case_pack;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    } else {
      setQuantity(1);
    }
  };

const handleCasesChange = (event) => {
  if (!product) return;
  const value = event.target.value;
  if (value === '' || /^\d+$/.test(value)) {
    const caseValue = value === '' ? 0 : parseInt(value, 10);
    const currentCases = getCaseCount();
    const currentEaches = getEachesCount();

    // If we're going from 0 cases to any number of cases and we have eaches, reset eaches to 0
    if (currentCases === 0 && caseValue > 0 && currentEaches > 0) {
      setQuantity(caseValue * product.case_pack);
    } else {
      // Normal behavior - keep eaches and adjust cases
      const eaches = getEachesCount();
      const newQuantity = (caseValue * product.case_pack) + eaches;
      setQuantity(newQuantity > 0 ? newQuantity : 1);
    }
  }
};

  const handleCasesBlur = (event) => {
    if (!product) return;
    const value = event.target.value;
    if (value === '') {
      const eaches = getEachesCount();
      setQuantity(eaches > 0 ? eaches : 1);
    }
  };

  const getDisplayPrice = (product) => {
    if (!product) return 0;
    return isWholesaleMode && product.wholesale_price > 0 
      ? product.wholesale_price 
      : product.price;
  };

  const placeholderImage = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzIDIiPjwvc3ZnPg==';

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen -mt-20">
        <Loader2 className="animate-spin text-red-500" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen text-2xl">
        Product not found
      </div>
    );
  }

  const displayPrice = getDisplayPrice(product);
  
  return (
    <main className='font-noto min-h-screen bg-white'>
      <div className="mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 w-full">
          {/* Left Sidebar - Category Container */}
          <div className="hidden md:block w-full md:w-1/4">
            <CategoryContainer />
          </div>
          
          {/* Main Content Area */}
          <div className="w-full md:w-3/4">
            {/* Filter Modal */}
            <FilterModal />
            
            {/* Product Details Section */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Product Image */}
              <div className="border border-gray-200 p-4 lg:p-6 flex items-center justify-center rounded-xs">
                <img
                  src={product.image_url || '/placeholder-image.png'}
                  alt={product.description}
                  className="max-w-full h-auto max-h-80 lg:max-h-96 object-contain"
                  loading='eager'
                />
              </div>

              {/* Product Information */}
              <div className="border border-gray-200 p-4 lg:p-6 rounded-xs">
                {/* Product title */}
                <h1 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-800 mb-4">
                  {product.description}
                </h1>

                {/* Mode indicator */}
                {/* {isWholesaleMode && product.wholesale_price > 0 && (
                  <div className="inline-block bg-blue-600 text-white text-xs px-2 py-1 mb-4 rounded">
                    Wholesale Price
                  </div>
                )} */}

                {/* Price and discount section */}
                <div className="flex items-center flex-wrap gap-2 mb-4">
                  <span className="text-lg lg:text-xl xl:text-2xl font-semibold text-red-500">
                    ${product.discount > 0 ? product.discount.toFixed(2) : displayPrice.toFixed(2)}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-gray-600 line-through text-sm">
                      ${displayPrice.toFixed(2)}
                    </span>
                  )}

                  {product.discount > 0 && (
                    <div className="bg-blue-700 text-white text-xs px-2 py-1 rounded">
                      Save {getSavingsPercentage(product)}%
                    </div>
                  )}
                </div>

                {/* Show wholesale price for reference when in retail mode */}
                {/* {!isWholesaleMode && product.wholesale_price > 0 && (
                  <div className="mb-4 text-gray-500 text-sm">
                    Wholesale: ${product.wholesale_price.toFixed(2)}
                  </div>
                )} */}

                {/* Product details */}
                <div className="mb-6 text-gray-600 text-sm">
                  <p className="mb-2">
                    <strong>UPC:</strong> {product.upc}
                  </p>
                  <p className="mb-2">
                    <strong>Case Pack:</strong> {product.case_pack}
                  </p>
                  <p>
                    <strong>Selected Quantity:</strong> {getFormattedQuantity()}
                  </p>
                </div>

                {/* Quantity selector with cases and eaches */}
                <div className="mb-6 space-y-3">
                  {/* Eaches Quantity Control */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-16">Eaches:</span>
                    <div className="flex items-center border rounded-xs">
                      <button
                        type='button'
                        onClick={handleDecreaseQuantity}
                        className="p-1.5 hover:bg-gray-100 rounded-l-xs cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="text"
                        value={getEachesCount()}
                        onChange={handleEachesChange}
                        onBlur={handleEachesBlur}
                        className="w-12 text-center py-1 border-0 focus:ring-0 focus:outline-none"
                        aria-label="Eaches"
                      />
                      <button
                        type='button'
                        onClick={handleIncreaseQuantity}
                        className="p-1.5 hover:bg-gray-100 rounded-r-xs cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Cases Quantity Control */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-16">Cases:</span>
                    <div className="flex items-center border rounded-xs">
                      <button
                        type='button'
                        onClick={handleDecreaseCases}
                        className="p-1.5 hover:bg-gray-100 rounded-l-xs cursor-pointer"
                        aria-label="Decrease cases"
                      >
                        <Minus size={16} />
                      </button>
                      <input
                        type="text"
                        value={getCaseCount()}
                        onChange={handleCasesChange}
                        onBlur={handleCasesBlur}
                        className="w-12 text-center py-1 border-0 focus:ring-0 focus:outline-none"
                        aria-label="Cases"
                      />
                      <button
                        type='button'
                        onClick={handleIncreaseCases}
                        className="p-1.5 hover:bg-gray-100 rounded-r-xs cursor-pointer"
                        aria-label="Increase cases"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Low quantity warning */}
                {product.status === 2 && (
                  <div className="flex items-center p-2 mb-4 bg-amber-50 border border-amber-200 rounded-xs text-amber-700">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span className="font-medium text-sm">Low Quantity Available</span>
                  </div>
                )}
                
                {/* Add to cart button */}
                <button
                  type='button'
                  title="Add to Cart"
                  onClick={handleAddToCart}
                  className={`w-full max-w-xs flex items-center justify-center py-4 border relative overflow-hidden transition-all duration-300 rounded-xs cursor-pointer 
                  ${isWholesaleMode && product.wholesale_price <= 0 
                    ? 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed' 
                    : 'bg-red-500 text-white hover:bg-red-600 border-red-500'}`}
                  disabled={isWholesaleMode && product.wholesale_price <= 0}
                >
                  {/* Main Content */}
                  <div
                  className={`
                    flex items-center space-x-2 transition-all duration-300
                    ${isAddedToCart ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}
                    absolute inset-0 flex justify-center items-center
                  `}
                  >
                  <ShoppingCart size={18} />
                  <span>Add to Cart</span>
                  </div>

                  {/* Added to Cart Notification */}
                  <div
                  className={`
                    flex items-center space-x-2 transition-all duration-300
                    ${isAddedToCart ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}
                    absolute inset-0 flex justify-center items-center
                  `}
                  >
                  <Check size={18} />
                  <span className="text-sm">Added {getFormattedQuantity()}</span>
                  </div>
                </button>

                {/* Disabled Button Message */}
                {isWholesaleMode && product.wholesale_price <= 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                  This product is not available for wholesale.
                  </p>
                )}
              </div>
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-6">
                  You may also like
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {relatedProducts.map(product => {
                    const relatedDisplayPrice = isWholesaleMode && product.wholesale_price > 0 
                      ? product.wholesale_price 
                      : product.price;
                    
                    return (
                      <div
                        className="relative border border-gray-200 p-2 lg:p-4 cursor-pointer rounded-xs hover:shadow-md transition-shadow"
                        key={product.id}
                        onClick={() => {
                          window.location.href = `/items/${product.id}`;
                        }}
                        >
                        {product.discount > 0 && (
                          <div className="absolute top-0 right-0 bg-blue-700 text-white text-xs px-2 py-1 z-10 rounded-bl">
                            Save {getSavingsPercentage(product)}%
                          </div>
                        )}
                        {/* {!isWholesaleMode && product.wholesale_price > 0 && (
                          <div className="absolute top-0 left-0 bg-blue-600 text-white text-xs px-2 py-1 z-10 rounded-br">
                            Wholesale
                          </div>
                        )} */}
                        <div className="relative mb-3">
                          <LazyLoadImage
                            src={product.image_url}
                            alt={product.description}
                            effect="blur"
                            placeholderSrc={placeholderImage}
                            className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded"
                            wrapperClassName="w-full h-full"
                          />
                        </div>

                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-2 line-clamp-2">
                            {product.description}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                            <div className="flex-1">
                              {product.discount ? (
                                <div className="flex items-baseline gap-1 flex-wrap">
                                  <span className="text-red-600 font-bold text-sm">
                                    ${product.discount.toFixed(2)}
                                  </span>
                                  <span className="text-gray-600 line-through text-xs">
                                    ${relatedDisplayPrice.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-red-600 font-bold text-sm">
                                  ${relatedDisplayPrice.toFixed(2)}
                                </span>
                              )}
                              
                              {/* {!isWholesaleMode && product.wholesale_price > 0 && (
                                <div className="text-gray-500 text-xs mt-1">
                                  Wholesale: ${product.wholesale_price.toFixed(2)}
                                </div>
                              )} */}
                            </div>
                            <button
                              type='button'
                              title="Add to Cart"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart({
                                  ...product,
                                  isWholesale: isWholesaleMode && product.wholesale_price > 0
                                }, { quantity: 1 });
                              }}
                              className="bg-red-500 text-white px-2 py-1.5 text-xs flex items-center justify-center gap-1 hover:bg-red-600 cursor-pointer rounded-xs flex-shrink-0"
                            >
                              <ShoppingCart size={12} />
                              <span className="inline">Add</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;