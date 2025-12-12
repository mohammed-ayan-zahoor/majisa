import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]); // Array of Product IDs or Objects? Let's verify.
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load customer from local storage on mount
    useEffect(() => {
        const loadCustomer = async () => {
            const savedCustomer = localStorage.getItem('majisa_customer_v2'); // Use v2 to force fresh login if needed or migrate
            if (savedCustomer) {
                const parsed = JSON.parse(savedCustomer);
                setCustomer(parsed);
                // Fetch fresh wishlist
                if (parsed._id) {
                    try {
                        const { data } = await api.get(`/customers/${parsed._id}/wishlist`);
                        setWishlist(data.map(p => p._id)); // Store IDs for easy checking
                    } catch (error) {
                        console.error('Failed to sync wishlist');
                    }
                }
            }
            setLoading(false);
        };
        loadCustomer();
    }, []);

    const loginCustomer = async (phone, name, referralCode) => {
        try {
            const { data } = await api.post('/customers/login', { phone, name, referralCode });

            const customerData = {
                _id: data._id,
                name: data.name,
                phone: data.phone,
                referralCode: referralCode, // Keep ref code
                vendorName: data.vendorName
            };

            setCustomer(customerData);
            setWishlist(data.wishlist.map(p => p._id));

            localStorage.setItem('majisa_customer_v2', JSON.stringify(customerData));
            // Also set old key for compatibility if needed, but ReferralGate checks majisa_customer
            localStorage.setItem('majisa_customer', JSON.stringify(customerData));

            return data;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const toggleWishlist = async (productId) => {
        if (!customer) {
            toast.error('Please enter your details first');
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
            // Sync with server
            const { data } = await api.post('/customers/wishlist/toggle', {
                customerId: customer._id,
                productId
            });
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

    return (
        <WishlistContext.Provider value={{
            wishlist,
            customer,
            loading,
            loginCustomer,
            toggleWishlist,
            checkIsWishlisted
        }}>
            {children}
        </WishlistContext.Provider>
    );
};
