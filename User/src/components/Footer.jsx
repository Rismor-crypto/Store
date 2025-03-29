import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-8 px-4">
            <div className="container mx-auto">
                {/* Brand Section */}
                <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold">
                        <span className="text-red-500">Russel</span>co
                    </h3>
                </div>

                {/* Quick Links Section */}
                <div className="flex flex-wrap justify-center items-center mb-6 gap-4 md:space-x-4">
                    <Link to="/" className="hover:text-red-500 transition-colors">Home</Link>
                    <Link to="/products" className="hover:text-red-500 transition-colors">All Products</Link>
                    <Link to="/cart" className="hover:text-red-500 transition-colors">Cart</Link>
                    <Link to="/offers" className="hover:text-red-500 transition-colors">Special Offers</Link>
                </div>

                {/* Contact Info Section */}
                <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 mb-6 text-center">
                    <div className="flex items-center">
                        <Phone size={20} className="mr-2 text-red-500" />
                        <span>1 (732) 860-3187</span>
                    </div>
                    <div className="flex items-center">
                        <Mail size={20} className="mr-2 text-red-500" />
                        <span>Russelcoinc@aol.com</span>
                    </div>
                    <div className="flex items-center">
                        <MapPin size={20} className="mr-2 text-red-500" />
                        <span>106 Melrich Rd , Cranbury NJ , 08512</span>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="text-center pt-4 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Russelco. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;