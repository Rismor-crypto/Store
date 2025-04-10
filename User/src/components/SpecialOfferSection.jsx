import React from 'react';
import { useProductContext } from '../context/ProductContext';
import { Link } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { ArrowRight } from 'lucide-react';


const SpecialOffersSection = () => {
    const { products } = useProductContext();
    const specialOffers = products.filter(product => product.discount > 0);
  
    return (
      <div className="bg-red-400 text-white py-6 md:py-8 shadow-lg mb-8 rounded-xs">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Left Section with Icon and Title */}
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <Tag className="text-white" size={32} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  Exclusive Special Offers
                </h2>
                <p className="text-sm md:text-base text-white/80 mt-1">
                  Limited time deals you won't want to miss!
                </p>
              </div>
            </div>
  
            {/* Right Section with CTA and Countdown */}
            <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-6">
  
  
              <Link 
                to="/offers" 
                className="flex items-center justify-center space-x-2 
                           bg-white text-red-600 px-6 py-3 
                           rounded-full font-semibold 
                           hover:bg-gray-100 transition 
                           transform hover:-translate-y-1 
                           shadow-lg hover:shadow-xl"
              >
                <span>View All Offers</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default SpecialOffersSection;