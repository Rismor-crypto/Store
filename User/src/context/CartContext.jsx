import React, { createContext, useState, useContext, useEffect } from 'react';
import { useShoppingMode } from './ShoppingModeContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isWholesaleMode } = useShoppingMode();
  
  // Maintain separate carts for retail and wholesale
  const [retailCartItems, setRetailCartItems] = useState(() => {
    const savedRetailCart = localStorage.getItem('retailCart');
    return savedRetailCart ? JSON.parse(savedRetailCart) : [];
  });
  
  const [wholesaleCartItems, setWholesaleCartItems] = useState(() => {
    const savedWholesaleCart = localStorage.getItem('wholesaleCart');
    return savedWholesaleCart ? JSON.parse(savedWholesaleCart) : [];
  });

  // Save carts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('retailCart', JSON.stringify(retailCartItems));
  }, [retailCartItems]);

  useEffect(() => {
    localStorage.setItem('wholesaleCart', JSON.stringify(wholesaleCartItems));
  }, [wholesaleCartItems]);

  // Helper function to get the current cart and setter based on mode
  const getCurrentCart = () => {
    return isWholesaleMode ? wholesaleCartItems : retailCartItems;
  };

  const getCurrentCartSetter = () => {
    return isWholesaleMode ? setWholesaleCartItems : setRetailCartItems;
  };

  // Add item to the appropriate cart based on mode
  const addToCart = (product, options = {}) => {
    const { quantity = 1 } = options;
    const currentCartSetter = getCurrentCartSetter();
    
    currentCartSetter(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: (newItems[existingItemIndex].quantity || 1) + quantity
        };
        return newItems;
      }
      
      return [
        ...prevItems,
        {
          ...product,
          quantity
        }
      ];
    });
  };

  // Remove item from the current mode's cart
  const removeFromCart = (productId) => {
    getCurrentCartSetter()(prevItems =>
      prevItems.filter(item => item.id !== productId)
    );
  };

  // Update quantity in the current mode's cart
  const updateQuantity = (productId, quantity) => {
    getCurrentCartSetter()(prevItems =>
      prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  // Clear the current mode's cart
  const clearCart = () => {
    getCurrentCartSetter()([]);
  };

  // Get total items in the current mode's cart
  const getTotalItems = () => {
    return getCurrentCart().reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Get the final price for an item, considering discount as the final price
  const getDiscountedPrice = (item) => {
    if (item.discount && item.discount > 0) {
      return item.discount;
    }
    return isWholesaleMode && item.wholesale_price > 0 ? item.wholesale_price : item.price;
  };

  // Get total price calculations for the current mode's cart
  const getTotalPrice = () => {
    const currentCart = getCurrentCart();
    
    const totalWithoutDiscount = currentCart.reduce((total, item) => {
      // Use wholesale_price in wholesale mode if available
      const basePrice = isWholesaleMode && item.wholesale_price > 0 ? item.wholesale_price : item.price;
      return total + (basePrice * (item.quantity || 1));
    }, 0);
    
    const totalWithDiscount = currentCart.reduce((total, item) => {
      // Use discounted price if available, otherwise use base price based on mode
      let finalPrice;
      if (item.discount && item.discount > 0) {
        finalPrice = item.discount;
      } else {
        finalPrice = isWholesaleMode && item.wholesale_price > 0 ? item.wholesale_price : item.price;
      }
      return total + (finalPrice * (item.quantity || 1));
    }, 0);
    
    return {
      totalWithoutDiscount,
      totalWithDiscount
    };
  };

  // Get minimum order amount based on current mode
  const getMinimumOrderAmount = () => {
    return isWholesaleMode ? 10000 : 1500;
  };

  // Expose cart items for both modes for debugging or admin purposes
  const getAllCarts = () => {
    return {
      retailCartItems,
      wholesaleCartItems
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems: getCurrentCart(),
      retailCartItems,
      wholesaleCartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotalItems,
      getTotalPrice,
      getDiscountedPrice,
      clearCart,
      getMinimumOrderAmount,
      getAllCarts
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);