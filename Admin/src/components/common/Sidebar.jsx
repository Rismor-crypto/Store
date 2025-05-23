import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  FolderTree, 
  ChevronRight, 
  LogOut,
  ShoppingCart
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useOrderContext } from '../../context/OrderContext';

const Sidebar = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { activeCounts } = useOrderContext();

  const handleLogout = async () => {
    const { success } = await signOut();
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="h-full bg-white w-64 fixed left-0 top-0 shadow-xl border-r border-gray-100 flex flex-col">
      {/* Logo and Branding Section */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Russelco</h1>
        </div>
      </div>
      
      {/* Navigation Menu */}
      <nav className="flex-grow px-4 py-6 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `
            group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? "bg-blue-50 text-blue-600 font-semibold" 
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center">
            <LayoutDashboard 
              size={20} 
              className="mr-3 transition-transform group-hover:scale-110" 
            />
            <span>Dashboard</span>
          </div>
          <ChevronRight 
            size={16} 
            className="opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </NavLink>
        
        <NavLink
          to="/products"
          className={({ isActive }) => `
            group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? "bg-blue-50 text-blue-600 font-semibold" 
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center">
            <ShoppingBag 
              size={20} 
              className="mr-3 transition-transform group-hover:scale-110" 
            />
            <span>Products</span>
          </div>
          <ChevronRight 
            size={16} 
            className="opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </NavLink>
        
        <NavLink
          to="/categories"
          className={({ isActive }) => `
            group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? "bg-blue-50 text-blue-600 font-semibold" 
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center">
            <FolderTree 
              size={20} 
              className="mr-3 transition-transform group-hover:scale-110" 
            />
            <span>Categories</span>
          </div>
          <ChevronRight 
            size={16} 
            className="opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) => `
            group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
            ${isActive 
              ? "bg-blue-50 text-blue-600 font-semibold" 
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }
          `}
        >
          <div className="flex items-center">
            <ShoppingCart 
              size={20} 
              className="mr-3 transition-transform group-hover:scale-110" 
            />
            <span>Orders</span>
            {activeCounts && activeCounts.pending > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                {activeCounts.pending}
              </span>
            )}
          </div>
          <ChevronRight 
            size={16} 
            className="opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </NavLink>
      </nav>
      
      {/* Logout Button - Added above the footer */}
      <div className="px-4 mb-4">
        <button
          onClick={handleLogout}
          className="w-full group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <div className="flex items-center">
            <LogOut 
              size={20} 
              className="mr-3 transition-transform group-hover:scale-110" 
            />
            <span>Logout</span>
          </div>
          <ChevronRight 
            size={16} 
            className="opacity-0 group-hover:opacity-100 transition-opacity" 
          />
        </button>
      </div>
      
      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Russelco Admin
        </p>
      </div>
    </div>
  );
};

export default Sidebar;