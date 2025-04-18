import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCartContext } from '../context/CartContext';
import { useProductContext } from '../context/ProductContext';

const Navbar = () => {
  const { getTotalItems } = useCartContext();
  const navigate = useNavigate();
  const { setSearchQuery } = useProductContext();

  return (
    <nav className="bg-black text-white py-4 md:py-10 px-4 md:px-8">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        {/* Logo */}
        <div onClick={() => { 
          setSearchQuery('');
          navigate('/')
           }} className="flex items-center cursor-pointer">
          <div className="text-2xl font-bold">
            <span className="text-red-500">Russel</span>
            <span className="text-red-500">co</span>
          </div>
        </div>
        
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
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 flex items-center justify-center px-1">
            {getTotalItems()}
          </span>
        </Link>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mt-4">
        <div onClick={() => { 
          setSearchQuery('');
          navigate('/')
           }} className="flex items-center cursor-pointer">
          <div className="text-2xl font-bold">
            <span className="text-red-500">Russel</span>
            <span className="text-red-500">co</span>
          </div>
        </div>          
          <Link 
            to="/cart"
            className="relative cursor-pointer hover:text-red-500 transition"
          >
            <ShoppingCart size={28} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 flex items-center justify-center px-1">
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