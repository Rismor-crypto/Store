import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProductContext } from '../context/ProductContext';
import { Package, Layers, PlusCircle, FolderTree, RefreshCw, Loader } from 'lucide-react';
import supabase from '../utils/supabase';

function Dashboard() {
  const { 
    products, 
    loading: productsLoading, 
    fetchProducts,
    totalProducts,
  } = useProductContext();
  
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [stats, setStats] = useState({
    mainCategories: 0,
    subCategories: 0,
    totalCategories: 0,
    recentlyAdded: []
  });

  // Determine if anything is loading
  const isLoading = productsLoading || categoriesLoading;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*');
        
        if (error) throw error;
        
        setCategories(data || []);
        
        // Count main categories (those with null parent_id)
        const mainCategoriesCount = data ? data.filter(category => category.parent_id === null).length : 0;
        
        // Count subcategories (those with non-null parent_id)
        const subCategoriesCount = data ? data.filter(category => category.parent_id !== null).length : 0;
        
        setStats(prev => ({
          ...prev,
          totalCategories: data?.length || 0,
          mainCategories: mainCategoriesCount,
          subCategories: subCategoriesCount
        }));
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Calculate stats when products update
  useEffect(() => {
    if (products) {
      // Get recently added products (up to 5)
      const recentlyAdded = [...products]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setStats(prev => ({
        ...prev,
        recentlyAdded
      }));
    }
  }, [products]);

  const refreshData = () => {
    fetchProducts();
  };

  // Overall loading screen
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 font-medium">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <button 
            onClick={refreshData} 
            className="flex items-center px-3 py-2 bg-white rounded border border-gray-300 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Refresh</span>
          </button>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Package className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <Layers className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Main Categories</p>
            <p className="text-2xl font-bold text-gray-800">{stats.mainCategories}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <FolderTree className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sub Categories</p>
            <p className="text-2xl font-bold text-gray-800">{stats.subCategories}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/products/add" 
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <PlusCircle className="h-5 w-5 text-blue-600 mr-3" />
            <span className="font-medium text-blue-700">Add New Product</span>
          </Link>
          
          <Link 
            to="/products" 
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Package className="h-5 w-5 text-green-600 mr-3" />
            <span className="font-medium text-green-700">Manage Products</span>
          </Link>
          
          <Link 
            to="/categories" 
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Layers className="h-5 w-5 text-purple-600 mr-3" />
            <span className="font-medium text-purple-700">Manage Categories</span>
          </Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Recently Added Products</h2>
        {stats.recentlyAdded && stats.recentlyAdded.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentlyAdded.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url && (
                          <img className="h-10 w-10 rounded-full mr-3 object-cover" src={product.image_url} alt={product.description} />
                        )}
                        <div className="text-sm font-medium text-gray-900">{product.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.upc}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${parseFloat(product.price).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        !product.status ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.status ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 text-right">
              <Link to="/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all products →
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
}

export default Dashboard;