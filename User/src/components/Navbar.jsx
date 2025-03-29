// src/components/Navbar.jsx
import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCartContext } from '../context/CartContext';
import { useProductContext } from '../context/ProductContext';

const Navbar = () => {
  const { getTotalItems } = useCartContext();

  return (
    <nav className="bg-black text-white py-4 md:py-10 px-4 md:px-8">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="text-2xl font-bold">
            <span className="text-red-500">Russel</span>
            <span className="text-red-500">co</span>
          </div>
        </Link>
        
        {/* Search Bar */}
        <div className="flex-grow mx-4 max-w-3xl">
          <SearchBar />
        </div>
        
        {/* Cart */}
        <Link 
          to="/cart" 
          className="relative cursor-pointer hover:text-red-500 transition"
        >
          <ShoppingCart size={28} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
            {getTotalItems()}
          </span>
        </Link>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mt-4">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-red-500">Russel</span>
            <span className="text-white">co</span>
          </Link>
          
          <Link 
            to="/cart"
            className="relative cursor-pointer hover:text-red-500 transition"
          >
            <ShoppingCart size={28} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
              {getTotalItems()}
            </span>
          </Link>
        </div>
        
        <div className="mt-4">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;