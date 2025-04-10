import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/OrdersPage';
import OrderDetails from './components/orders/OrderDetails';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import AddProductPage from './pages/AddProductPage';
import LoginPage from './pages/Login';
import AuthCallback from './pages/AuthCallBack';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ProductProvider>
                  <OrderProvider>
                    <div className="flex">
                      <Sidebar />
                      <main className="ml-64 p-6 w-full min-h-screen bg-gray-50">
                        <Routes>
                          <Route path="dashboard" element={<Dashboard />} />
                          <Route path="products" element={<Products />} />
                          <Route path="products/add" element={<AddProductPage />} />
                          <Route path="products/edit/:id" element={<AddProductPage />} />
                          <Route path="categories" element={<Categories />} />
                          <Route path="orders" element={<Orders />} />
                          <Route path="orders/:id" element={<OrderDetails />} />
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        </Routes>
                      </main>
                    </div>
                  </OrderProvider>
                </ProductProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;