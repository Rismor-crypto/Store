import React from 'react';
import { useShoppingMode } from '../context/ShoppingModeContext';
import { Store, User } from 'lucide-react';

const ModeToggle = () => {
  const { isWholesaleMode, toggleMode } = useShoppingMode();

  return (
    <div className="flex items-center bg-gray-900 rounded-lg overflow-hidden">
      <button
        className={`flex items-center justify-center px-3 py-2 cursor-pointer ${
          !isWholesaleMode ? 'bg-red-500 text-white' : 'bg-transparent text-gray-400'
        } transition-all duration-200`}
        onClick={() => !isWholesaleMode || toggleMode()}
      >
        <Store size={16} className="mr-1" />
        <span className="text-xs font-medium">Retail</span>
      </button>
      
      <button
        className={`flex items-center justify-center px-3 py-2 cursor-pointer ${
          isWholesaleMode ? 'bg-red-500 text-white' : 'bg-transparent text-gray-400'
        } transition-all duration-200`}
        onClick={() => isWholesaleMode || toggleMode()}
      >
        <User size={16} className="mr-1" />
        <span className="text-xs font-medium">Wholesale</span>
      </button>
    </div>
  );
};

export default ModeToggle;