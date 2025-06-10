import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
  const prevPathnameRef = useRef();

  useEffect(() => {
    const prevPathname = prevPathnameRef.current;
    
    // Define paths that should not trigger scroll to top when navigating between them
    const isProductsPage = pathname.includes('/products') || pathname === '/offers';
    const wasPreviouslyProductsPage = prevPathname && (prevPathname.includes('/products') || prevPathname === '/offers');
    
    // Check if we're switching between categories or search/offers
    const isCategoryChange = isProductsPage && wasPreviouslyProductsPage;
    
    if (isCategoryChange) {
      // For category changes, don't scroll at all - let the HomePage handle it
      // This prevents the category container from moving
      return;
    } else {
      // For other page changes, scroll to top normally
      window.scrollTo(0, 0);
    }
    
    // Update the previous pathname
    prevPathnameRef.current = pathname;
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
              <Route path="/" element={<Navigate to="/offers" replace />} />
              <Route path="/products" element={<HomePage />} />
              <Route path="/products/category/:categoryId" element={<HomePage />} />
              <Route path="/offers" element={<HomePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/items/:id" element={<ProductDetailPage />} />
            </Routes>
            {pathname !== '/checkout' && <Footer />}
          </CartProvider>
        </ProductProvider>
      </ShoppingModeProvider>
    </>
  );
}

export default App;