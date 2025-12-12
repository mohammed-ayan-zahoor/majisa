import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user } = useAuth(); // Access user to check role

    // Load cart from local storage
    useEffect(() => {
        const storedCart = localStorage.getItem('majisa_cart');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }
    }, []);

    // Save cart to local storage
    useEffect(() => {
        localStorage.setItem('majisa_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        // Vendor Limit Logic
        if (user?.role === 'vendor') {
            if (cartItems.length > 0) {
                const isSameProduct = cartItems[0]._id === product._id;
                if (!isSameProduct) {
                    // Replace existing
                    setCartItems([{ ...product, quantity }]);
                    toast.success('Cart updated with new item (Single item limit)');
                    return;
                }
            }
        }

        const existingItem = cartItems.find(item => item._id === product._id);

        if (existingItem) {
            toast.success('Updated quantity in cart');
            setCartItems(prev => prev.map(item =>
                item._id === product._id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            // If vendor and cart empty, or normal user
            toast.success('Added to cart');
            setCartItems(prev => [...prev, { ...product, quantity }]);
        }
    };

    const removeFromCart = (productId) => {
        setCartItems(prev => prev.filter(item => item._id !== productId));
        toast.success('Removed from cart');
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                item._id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('majisa_cart');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Mock total calculation (assuming price is available or mocking it)
    const cartTotal = cartItems.reduce((acc, item) => {
        // If price is hidden/not in object, assume a mock price for calculation
        const price = item.price || 45000;
        return acc + (price * item.quantity);
    }, 0);

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
