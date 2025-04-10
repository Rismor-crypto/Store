import React, { useState, useEffect, Profiler } from 'react';
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

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
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
              className="max-w-full h-auto max-h-[500px] object-contain"
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
                  Save ${((product.discount * product.price)/100).toFixed(2)}
                </div>
              )}
            </div>

            {/* Product details */}
            <div className="mb-6 text-gray-600">
              <p className="mb-2">
                <strong>UPC:</strong> {product.upc}
              </p>
              <p>
                <strong>Case Pack:</strong> {product.case_pack}
              </p>
            </div>

            {/* Quantity selector */}
            <div className="mb-6">
              <div className="flex items-center border border-gray-300 rounded w-fit">
                <button
                  onClick={() => handleQuantityChange('decrease')}
                  className="p-2 rounded-l-xs cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <Minus size={18} />
                </button>
                <input
                  value={quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setQuantity(isNaN(value) ? 1 : value);
                  }}
                  min="1"
                  aria-label="Quantity"
                  className="w-16 text-lg text-center border-x border-gray-300 outline-none appearance-none bg-transparent p-2"
                />
                <button
                  onClick={() => handleQuantityChange('increase')}
                  className="p-2 rounded-r-xs cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              className="w-52 flex items-center justify-center py-6 border
      relative overflow-hidden bg-red-500 text-white hover:bg-red-600 border-red-500
      transition-all duration-300 rounded-xs cursor-pointer"
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
                <span>Added {quantity} to Cart</span>
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
              <div className=" relative border border-gray-200 p-2 md:p-4 cursor-pointer rounded-xs"
                  onClick={() => navigate(`/products/${product.id}`)}
                  key={product.id}
                  >
                            {product.discount > 0 && (
                        <div className="absolute top-0 right-0 bg-blue-700 text-white text-xs px-2 py-1 z-50">
                          Save {product.discount}%
                        </div>
                      )}
                    <div className="relative mb-4">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-48 object-cover"
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
                            <span>Add</span>
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
                            <span>Added</span>
                          </div>
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