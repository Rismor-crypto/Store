import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { ShoppingCart, Minus, Plus, Check, Loader2 } from 'lucide-react';
import supabase from '../utils/supabase';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const { addToCart } = useCartContext();

  const getSavingsPercentage = (product) => {
    if (product.discount && product.discount > 0) {
      return ((product.price - product.discount) / product.price * 100).toFixed(1);
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
          const { data: relatedData, error: relatedError } = await supabase
            .from('products')
            .select('*')
            .eq('category', productData.category)
            .neq('id', id)
            .limit(5);

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
  }, [id]);

  const handleAddToCart = () => {
    if (product && quantity > 0) {
      addToCart(product, { quantity });

      // Show added to cart notification
      setIsAddedToCart(true);

      // Remove notification after 2 seconds
      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);
    }
  };

  // Calculate case count for the current quantity
  const getCaseCount = () => {
    if (!product) return 0;
    return Math.floor(quantity / product.case_pack);
  };

  // Calculate eaches count (remainder after cases)
  const getEachesCount = () => {
    if (!product) return quantity;
    return quantity % product.case_pack;
  };

  // Format quantity as "X case(s) + Y each(es)"
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

  // Handle increasing quantity by 1
  const handleIncreaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  // Handle decreasing quantity by 1
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  // Handle changing eaches input directly
  const handleEachesChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const eachesValue = value === '' ? 0 : parseInt(value, 10);
      const cases = getCaseCount();
      const newQuantity = (cases * (product?.case_pack || 1)) + eachesValue;
      setQuantity(newQuantity > 0 ? newQuantity : 1);
    }
  };

  // Handle eaches input blur
  const handleEachesBlur = (event) => {
    const value = event.target.value;
    if (value === '' || parseInt(value, 10) < 1 && getCaseCount() === 0) {
      const cases = getCaseCount();
      setQuantity((cases * (product?.case_pack || 1)) + 1);
    }
  };

  // Handle increasing cases by 1
  const handleIncreaseCases = () => {
    if (!product) return;
    const currentCases = getCaseCount();
    
    // If we're going from 0 cases to 1 case, reset eaches to 0
    if (currentCases === 0) {
      // Set quantity to exactly one case with no eaches
      setQuantity(product.case_pack);
    } else {
      // Normal case: just add one more case to the current quantity
      setQuantity(quantity + product.case_pack);
    }
  };

  // Handle decreasing cases by 1
  const handleDecreaseCases = () => {
    if (!product) return;
    const newQuantity = quantity - product.case_pack;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    } else {
      setQuantity(1);
    }
  };

  // Handle changing cases input directly
  const handleCasesChange = (event) => {
    if (!product) return;
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      const caseValue = value === '' ? 0 : parseInt(value, 10);
      const eaches = getEachesCount();
      
      // If going from 0 to a positive number of cases, reset eaches
      const currentCases = getCaseCount();
      if (currentCases === 0 && caseValue > 0) {
        setQuantity(caseValue * product.case_pack);
      } else {
        const newQuantity = (caseValue * product.case_pack) + eaches;
        setQuantity(newQuantity > 0 ? newQuantity : 1);
      }
    }
  };

  // Handle cases input blur
  const handleCasesBlur = (event) => {
    if (!product) return;
    const value = event.target.value;
    if (value === '') {
      const eaches = getEachesCount();
      setQuantity(eaches > 0 ? eaches : 1);
    }
  };

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

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Product Details Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="border border-gray-200 p-6 flex items-center justify-center rounded-xs">
            <img
              src={product.image_url || '/placeholder-image.png'}
              alt={product.description}
              className="max-w-full h-auto max-h-96 object-contain"
              loading='eager'
            />
          </div>

          {/* Product Information */}
          <div className="border border-gray-200 p-4 md:p-6 rounded-xs">
            {/* Product title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              {product.description}
            </h1>

            {/* Price and discount section */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              <span className="text-xl md:text-2xl font-semibold text-red-500">
                ${(product.price - ((product.discount * product.price) / 100)).toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span className="text-gray-600 line-through text-sm">
                  ${product.price.toFixed(2)}
                </span>
              )}

              {product.discount > 0 && (
                <div className="bg-blue-700 text-white text-xs px-2 py-1 rounded">
                  Save {getSavingsPercentage(product)}%
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="mb-6 text-gray-600">
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

            {/* Quantity selector with cases and eaches - like cart page */}
            <div className="mb-6 space-y-3">
              {/* Eaches Quantity Control */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Eaches:</span>
                <div className="flex items-center border rounded-xs">
                  <button
                    onClick={handleDecreaseQuantity}
                    className="p-1.5 rounded-l-xs cursor-pointer"
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
                    onClick={handleIncreaseQuantity}
                    className="p-1.5 rounded-r-xs cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Cases Quantity Control */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium pr-2">Cases:</span>
                <div className="flex items-center border rounded-xs">
                  <button
                    onClick={handleDecreaseCases}
                    className="p-1.5 rounded-l-xs cursor-pointer"
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
                    onClick={handleIncreaseCases}
                    className="p-1.5 rounded-r-xs cursor-pointer"
                    aria-label="Increase cases"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              className="w-52 flex items-center justify-center py-6 border relative overflow-hidden bg-red-500 text-white hover:bg-red-600 border-red-500 transition-all duration-300 rounded-xs cursor-pointer"
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
                <span>Added {getFormattedQuantity()}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map(product => (
              <div 
                className="relative border border-gray-200 p-2 md:p-4 cursor-pointer rounded-xs"
                key={product.id}
              >
                {product.discount > 0 && (
                  <div className="absolute top-0 right-0 bg-blue-700 text-white text-xs px-2 py-1 z-50">
                    Save {getSavingsPercentage(product)}%
                  </div>
                )}
                <div className="relative mb-4">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    loading='lazy'
                  />
                </div>
          
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2 truncate">
                    {product.description}
                  </h3>
                  <div className="flex justify-between items-center mt-2">
                    {product.discount ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-red-600 font-bold">
                          ${(product.price - ((product.discount * product.price)/100)).toFixed(2)}
                        </span>
                        <span className="text-gray-600 line-through text-xs">
                          ${product.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-red-600 font-bold">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add related product to cart with quantity 1
                        addToCart(product, { quantity: 1 });
                      }}
                      className="relative bg-red-500 text-white px-2 py-2 text-xs flex items-center space-x-1 hover:bg-red-600 cursor-pointer overflow-hidden rounded-xs"
                    >
                      <ShoppingCart size={12} />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProductDetailPage;