import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { Loader, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Wishlist = () => {
    const { customer, wishlist } = useWishlist();
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWishlist = async () => {
            // Priority 1: Vendor (User)
            if (user && user.role === 'vendor') {
                try {
                    const { data } = await api.get('/users/wishlist');
                    setProducts(data);
                } catch (error) {
                    console.error('Failed to fetch vendor wishlist', error);
                } finally {
                    setLoading(false);
                }
            }
            // Priority 2: Customer (Guest)
            else if (customer?._id) {
                try {
                    const { data } = await api.get(`/customers/${customer._id}/wishlist`);
                    setProducts(data);
                } catch (error) {
                    console.error('Failed to fetch wishlist', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [customer, wishlist]); // Refetch when wishlist changes (toggle)

    return (
        <div className="bg-white min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4">
                <div className="flex items-center gap-3 mb-8">
                    <Heart className="text-red-500 fill-current" size={28} />
                    <h1 className="text-3xl font-serif font-bold text-gray-900">My Wishlist</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="animate-spin text-primary-600" size={32} />
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        {products.filter(p => p && p._id).map(product => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl">
                        <Heart className="mx-auto text-gray-300 mb-4" size={48} />
                        <h2 className="text-xl font-medium text-gray-800 mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 mb-6">Save items you love to view them here later.</p>
                        <Link to="/products" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-primary-700 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wishlist;
