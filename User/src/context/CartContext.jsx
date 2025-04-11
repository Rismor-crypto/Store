import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, options = {}) => {
    const { quantity = 1 } = options;

    setCartItems(prevItems => {
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

  const removeFromCart = (productId) => {
    setCartItems(prevItems => 
      prevItems.filter(item => item.id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  // Get the final price for an item, considering discount as the final price
  const getDiscountedPrice = (item) => {
    if (item.discount && item.discount > 0) {
      return item.discount;
    }
    return item.price;
  };

  const getTotalPrice = () => {
    const totalWithoutDiscount = cartItems.reduce((total, item) => {
      return total + (item.price * (item.quantity || 1));
    }, 0);
  
    const totalWithDiscount = cartItems.reduce((total, item) => {
      // Use discount as the final price if available
      const finalPrice = item.discount && item.discount > 0 ? item.discount : item.price;
      return total + (finalPrice * (item.quantity || 1));
    }, 0);
  
    return {
      totalWithoutDiscount,
      totalWithDiscount
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotalItems,
      getTotalPrice,
      getDiscountedPrice,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCartContext = () => useContext(CartContext);