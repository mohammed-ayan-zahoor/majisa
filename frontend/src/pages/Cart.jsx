import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

import { useOrder } from '../context/OrderContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const { addOrder } = useOrder();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }

        // Special flow for Vendors
        if (user.role === 'vendor') {
            if (cartItems.length > 1) {
                toast.error('Vendors can only order one item at a time via this flow. Please remove other items.');
                return;
            }
            if (cartItems.length === 0) return; // Should be handled by early return in render, but safe check

            const item = cartItems[0];
            // We do NOT clear cart here because if they cancel, they might want to come back.
            // Or we clear it because they are "moving" to the order page?
            // User requirement isn't explicit, but "limit cart with only one product" implies tight coupling.
            // Let's NOT clear it yet. VendorOrder is just a form filler.
            // Actually, if we clear it, and they don't place order, they lose it.
            // Better to keep it until order is placed.
            // Navigate to vendor order page with code
            navigate(`/vendor/place-order?code=${item.productCode}`);
            return;
        }

        // Normal flow for other users (if any exist in future, currently only vendors place orders technically via this app? Or Customers?)
        // If Customers exist, they use this normal flow.
        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    image: item.image,
                    price: item.price || 0,
                    product: item._id,
                    productCode: item.productCode,
                    // size: item.size, // Add if available in cart item
                    purity: item.purity,
                    wastage: item.wastage
                })),
                shippingAddress: { address: 'Vendor Address', city: 'Vendor City', postalCode: '000000', country: 'India' },
                paymentMethod: 'Credit',
                itemsPrice: cartTotal,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: cartTotal,
            };

            await addOrder(orderData);
            clearCart();

            navigate('/');
        } catch (error) {
            console.error('Checkout error:', error);
            // toast handled by addOrder
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-cream-50 pt-24">
                <div className="bg-white p-6 rounded-full shadow-sm mb-6">
                    <ShoppingBag size={48} className="text-gray-300" />
                </div>
                <h2 className="text-2xl font-serif text-charcoal-500 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added any items yet.</p>
                <Link
                    to="/products"
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                >
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-cream-50 min-h-screen pt-24 pb-16">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-serif text-charcoal-500 mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items */}
                    <div className="flex-1 bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="p-6 space-y-6">
                            {cartItems.map((item) => (
                                <div key={item._id} className="flex gap-6 py-6 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-serif text-lg text-charcoal-500">{item.name}</h3>
                                                <p className="text-sm text-gray-500">{item.category} • {item.purity}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item._id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>

                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex items-center border border-gray-200 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                                                    className="px-3 py-1 hover:text-primary-600"
                                                >
                                                    -
                                                </button>
                                                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                                    className="px-3 py-1 hover:text-primary-600"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Price only for authorized roles */}
                                            {/* Price removed as per requirement */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:w-96">
                        <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                            <h3 className="font-serif text-lg font-bold text-charcoal-500 mb-6">Order Summary</h3>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>--</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                                <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-lg text-charcoal-500">
                                    <span>Total</span>
                                    <span>--</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout
                                <ArrowRight size={18} />
                            </button>

                            {!user && (
                                <p className="text-xs text-center text-gray-500 mt-4">
                                    Please login to view prices and checkout.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
