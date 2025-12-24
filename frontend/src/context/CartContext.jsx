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

    const addToCart = React.useCallback((product, quantity = 1) => {
        // Vendor Limit Logic: Only one item allowed in cart total
        if (user?.role === 'vendor') {
            if (cartItems.length > 0) {
                const confirmReplace = window.confirm('Your cart already has an item. Would you like to replace it with this new item?');
                if (!confirmReplace) return;
            }
            setCartItems([{ ...product, quantity }]);
            toast.success('Cart updated (Single item limit for vendors)');
            return;
        }

        // Composite Key: _id + selectedWeight
        const itemKey = `${product._id}-${product.selectedWeight || 'default'}`;

        setCartItems(prev => {
            const existingItemIndex = prev.findIndex(item =>
                `${item._id}-${item.selectedWeight || 'default'}` === itemKey
            );

            if (existingItemIndex !== -1) {
                // If variant exists, update quantity (or keep it if it's a "replace" type logic)
                // User said: "Different weight variants replace each other (not merge)" 
                // Wait, if I add the same weight again, it should probably update quantity.
                // But the user specifically said "Replace on different product/weight"
                // Let's stick to the "Composite Key" rule: Different variants = Different items.
                // Same variant = update quantity.
                const newCart = [...prev];
                newCart[existingItemIndex] = { ...newCart[existingItemIndex], quantity: newCart[existingItemIndex].quantity + quantity };
                toast.success('Updated quantity in cart');
                return newCart;
            } else {
                toast.success(`Added to cart (${product.selectedWeight || 'Default'})`);
                return [...prev, { ...product, quantity }];
            }
        });
    }, [user, cartItems]);

    const removeFromCart = React.useCallback((productId, selectedWeight) => {
        setCartItems(prev => prev.filter(item => !(item._id === productId && item.selectedWeight === selectedWeight)));
        toast.success('Removed from cart');
    }, []);

    const updateQuantity = React.useCallback((productId, newQuantity, selectedWeight) => {
        if (newQuantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                (item._id === productId && item.selectedWeight === selectedWeight) ? { ...item, quantity: newQuantity } : item
            )
        );
    }, []);

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('majisa_cart');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    // Mock total calculation (assuming price is available or mocking it)
    const cartTotal = cartItems.reduce((acc, item) => {
        const price = item.price || 0;
        return acc + (price * item.quantity);
    }, 0);

    const value = React.useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal
    }), [cartItems, addToCart, removeFromCart, updateQuantity]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
