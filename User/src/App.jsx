import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductDetailPage from './pages/ProductDetailPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ShoppingModeProvider } from './context/ShoppingModeContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

function App() {
  const { pathname } = useLocation();

  return (
    <>
      <ScrollToTop />
      <ShoppingModeProvider>
        <ProductProvider>
          <CartProvider>
            {pathname !== '/checkout' && <Navbar />}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<HomePage />} />
              <Route path="/products/category/:categoryId" element={<HomePage />} />
              <Route path="/offers" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
            </Routes>
            {pathname !== '/checkout' && <Footer />}
          </CartProvider>
        </ProductProvider>
      </ShoppingModeProvider>
    </>
  );
}

export default App;