import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth(); // Access AuthContext via hook

    // Load customer from local storage on mount
    useEffect(() => {
        const loadCustomer = async () => {
            const savedCustomer = localStorage.getItem('majisa_customer_v2');
            if (savedCustomer) {
                const parsed = JSON.parse(savedCustomer);
                setCustomer(parsed);
                // Fetch fresh wishlist for customer
                if (parsed._id) {
                    try {
                        const { data } = await api.get(`/customers/${parsed._id}/wishlist`);
                        setWishlist(data.map(p => p._id));
                    } catch (error) {
                        console.error('Failed to sync customer wishlist');
                        // Fix for Stale Session (404 Not Found)
                        if (error.response && error.response.status === 404) {
                            console.warn('Customer not found (404). Clearing stale session.');
                            localStorage.removeItem('majisa_customer_v2');
                            localStorage.removeItem('majisa_customer');
                            setCustomer(null);
                        }
                    }
                }
            }
            setLoading(false);
        };
        loadCustomer();
    }, []);

    // Load Vendor Wishlist when user logs in
    useEffect(() => {
        const fetchUserWishlist = async () => {
            if (user && user.role === 'vendor') {
                try {
                    const { data } = await api.get('/users/wishlist');
                    setWishlist(data.map(p => p._id));
                } catch (error) {
                    console.error('Failed to sync vendor wishlist', error);
                }
            }
        };
        fetchUserWishlist();
    }, [user]);


    const loginCustomer = async (phone, name, referralCode) => {
        try {
            const { data } = await api.post('/customers/login', { phone, name, referralCode });

            const customerData = {
                _id: data._id,
                name: data.name,
                phone: data.phone,
                referralCode: referralCode,
                vendorName: data.vendorName
            };

            setCustomer(customerData);
            setWishlist(data.wishlist.map(p => p._id));

            localStorage.setItem('majisa_customer_v2', JSON.stringify(customerData));
            localStorage.setItem('majisa_customer', JSON.stringify(customerData));

            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const toggleWishlist = async (productId) => {
        // Allow if Customer OR Vendor
        if (!customer && (!user || user.role !== 'vendor')) {
            toast.error('Please login to save items');
            return;
        }

        // Optimistic update
        const isInWishlist = wishlist.includes(productId);
        let newWishlist;

        if (isInWishlist) {
            newWishlist = wishlist.filter(id => id !== productId);
            toast.success('Removed from wishlist');
        } else {
            newWishlist = [...wishlist, productId];
            toast.success('Added to wishlist');
        }

        setWishlist(newWishlist);

        try {
            let data;
            if (user && user.role === 'vendor') {
                // Vendor Toggle
                const res = await api.post('/users/wishlist/toggle', { productId });
                data = res.data;
            } else {
                // Customer Toggle
                const res = await api.post('/customers/wishlist/toggle', {
                    customerId: customer._id,
                    productId
                });
                data = res.data;
            }

            // Server returns updated populated wishlist, but handle strings just in case
            setWishlist(data.map(p => typeof p === 'object' ? p._id : p));
        } catch (error) {
            // Revert on error
            setWishlist(wishlist);
            toast.error('Failed to update wishlist');
        }
    };

    const checkIsWishlisted = (productId) => {
        return wishlist.includes(productId);
    };

    const value = React.useMemo(() => ({
        wishlist,
        customer,
        loading,
        loginCustomer,
        toggleWishlist,
        checkIsWishlisted
    }), [wishlist, customer, loading]);

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
