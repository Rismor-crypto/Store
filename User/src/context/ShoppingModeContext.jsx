import React, { createContext, useState, useContext, useEffect } from 'react';

const ShoppingModeContext = createContext();

export const ShoppingModeProvider = ({ children }) => {

  const [isWholesaleMode, setIsWholesaleMode] = useState(() => {
    const savedMode = localStorage.getItem('isWholesaleMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    localStorage.setItem('isWholesaleMode', JSON.stringify(isWholesaleMode));
  }, [isWholesaleMode]);

  const toggleMode = () => {
    setIsWholesaleMode(prevMode => !prevMode);
  };

  return (
    <ShoppingModeContext.Provider value={{ isWholesaleMode, toggleMode }}>
      {children}
    </ShoppingModeContext.Provider>
  );
};

export const useShoppingMode = () => useContext(ShoppingModeContext);