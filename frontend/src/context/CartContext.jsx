import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const storedCart = localStorage.getItem('majisa_cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });
    const { user } = useAuth(); // Access user to check role

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('majisa_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = React.useCallback((product, quantity = 1) => {
        // Vendor Limit Logic: Only one item allowed in cart total
        if (user?.role === 'vendor') {
            if (cartItems.length > 0) {
                toast((t) => (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm font-medium text-gray-900">
                            Your cart already has an item. Replace it with this new selection?
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setCartItems([{ ...product, quantity }]);
                                    toast.dismiss(t.id);
                                    toast.success('Cart updated (Single item limit)');
                                }}
                                className="px-3 py-1.5 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                Replace Item
                            </button>
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ), {
                    duration: 6000,
                    position: 'top-center',
                    style: {
                        minWidth: '300px',
                        padding: '16px',
                        borderRadius: '12px',
                        background: '#fff',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    },
                });
                return;
            }
            setCartItems([{ ...product, quantity }]);
            toast.success('Added to cart');
            return;
        }

        // Composite Key: _id + selectedWeight + selectedPurity
        const itemKey = `${product._id}-${product.selectedWeight || 'default'}-${product.selectedPurity || 'default'}`;

        setCartItems(prev => {
            const existingItemIndex = prev.findIndex(item =>
                `${item._id}-${item.selectedWeight || 'default'}-${item.selectedPurity || 'default'}` === itemKey
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

    const removeFromCart = React.useCallback((productId, selectedWeight, selectedPurity) => {
        setCartItems(prev => prev.filter(item => !(
            item._id === productId &&
            item.selectedWeight === selectedWeight &&
            item.selectedPurity === selectedPurity
        )));
        toast.success('Removed from cart');
    }, []);

    const updateQuantity = React.useCallback((productId, newQuantity, selectedWeight, selectedPurity) => {
        if (newQuantity < 1) return;
        setCartItems(prev =>
            prev.map(item =>
                (item._id === productId &&
                    item.selectedWeight === selectedWeight &&
                    item.selectedPurity === selectedPurity)
                    ? { ...item, quantity: newQuantity }
                    : item
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
