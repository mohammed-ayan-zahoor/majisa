import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Brand Info */}
                    <div>
                        <h3 className="text-2xl font-serif font-bold text-white mb-4">MAJISA JEWELLERS</h3>
                        <p className="text-sm leading-relaxed mb-6">
                            Crafting timeless elegance since 1995. We offer the finest gold and silver jewellery,
                            blending traditional artistry with modern designs.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary-400 transition-colors"><Facebook size={20} /></a>
                            <a href="#" className="hover:text-primary-400 transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="hover:text-primary-400 transition-colors"><Twitter size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/about" className="hover:text-primary-400 transition-colors">About Us</Link></li>
                            <li><Link to="/products" className="hover:text-primary-400 transition-colors">New Arrivals</Link></li>
                            <li><Link to="/vendor-register" className="hover:text-primary-400 transition-colors">Vendor Registration</Link></li>
                            <li><Link to="/login" className="hover:text-primary-400 transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Customer Care</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Shipping Policy</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Returns & Exchanges</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Jewellery Care</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">Size Guide</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition-colors">FAQ</a></li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Majisa Jewellers. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
