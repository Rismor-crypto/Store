import React from 'react';
import { ShoppingCart, Store, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';
import { useCartContext } from '../context/CartContext';
import { useProductContext } from '../context/ProductContext';
import { useShoppingMode } from '../context/ShoppingModeContext';
import ModeToggle from './ModeToggle';

const Navbar = () => {
  const { getTotalItems } = useCartContext();
  const navigate = useNavigate();
  const { setSearchQuery } = useProductContext();
  const { isWholesaleMode } = useShoppingMode();

  return (
    <nav className="relative bg-black text-white py-4 md:py-6 px-4 md:px-8">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => {
            setSearchQuery('');
            navigate('/')
          }} 
          className="flex items-center cursor-pointer"
        >
          <div className="text-2xl font-bold">
            <span className="text-red-500">Russel</span>
            <span className="text-red-500">co Inc</span>
          </div>
        </div>

        
        {/* Search Bar */}
        <div className="flex-grow mx-4 max-w-3xl">
          <SearchBar />
        </div>
        
        {/* Toogle & Cart */}
        <div className='flex items-center'>
        {/* <div>
          <ModeToggle />
        </div> */}
        <Link
          to="/cart"
          className="relative cursor-pointer hover:text-red-500 transition-colors ml-4"
        >
          <ShoppingCart size={28} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 flex items-center justify-center px-1">
            {getTotalItems()}
          </span>
        </Link>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="flex justify-between items-center">
          <div 
            onClick={() => {
              setSearchQuery('');
              navigate('/')
            }} 
            className="flex items-center cursor-pointer"
          >
            <div className="text-xl font-bold">
              <span className="text-red-500">Russel</span>
              <span className="text-red-500">co Inc</span>
            </div>
          </div>
          
          <Link
            to="/cart"
            className="relative cursor-pointer hover:text-red-500 transition-colors"
          >
            <ShoppingCart size={24} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs min-w-5 h-5 flex items-center justify-center px-1">
              {getTotalItems()}
            </span>
          </Link>
        </div>
        
        {/* Mode Toggle Switch - Mobile (Centered) */}
        {/* <div className="flex justify-center my-4">
          <ModeToggle />
        </div> */}
        
        {/* Search Bar */}
        <div className="mt-2">
          <SearchBar />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;