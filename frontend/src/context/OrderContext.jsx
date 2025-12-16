import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const OrderContext = createContext();

export const useOrder = () => useContext(OrderContext);

export const OrderProvider = ({ children }) => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch orders based on role
    const fetchOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            let endpoint = '/orders';
            if (user.role === 'vendor' || user.role === 'customer' || user.role === 'goldsmith') {
                endpoint = '/orders/myorders';
            }
            // For goldsmith, we might need a specific endpoint or filter on client side if API returns all
            // Assuming /orders returns all for admin/goldsmith for now, or we filter later.
            // Actually, standard practice: Admin gets all, others get theirs.
            // If goldsmith needs to see assigned orders, backend should handle it or we filter.

            const { data } = await api.get(endpoint);
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const addOrder = async (orderData) => {
        try {
            const { data } = await api.post('/orders', orderData);
            setOrders((prev) => [data, ...prev]);
            toast.success('Order placed successfully');
            return data;
        } catch (error) {
            console.error('Error adding order:', error);
            toast.error('Failed to place order');
            throw error;
        }
    };

    const updateOrderStatus = async (orderId, status, goldsmithId = null) => {
        try {
            const { data } = await api.put(`/orders/${orderId}/status`, { status, goldsmithId });
            setOrders((prev) =>
                prev.map((order) => (order._id === orderId ? data : order))
            );
            toast.success('Order status updated');
            return data;
        } catch (error) {
            console.error('Error updating order:', error);
            toast.error('Failed to update order status');
            throw error;
        }
    };

    const getOrderById = async (id) => {
        // Check if we already have it in state
        const existingOrder = orders.find(o => o._id === id);
        if (existingOrder) return existingOrder;

        // If not, fetch it
        try {
            const { data } = await api.get(`/orders/${id}`);
            return data;
        } catch (error) {
            console.error('Error fetching order details:', error);
            return null;
        }
    };

    const reportIssue = async (orderId, issue) => {
        try {
            await api.put(`/orders/${orderId}/report`, { issue });
            toast.success('Issue reported to Admin');
        } catch (error) {
            console.error('Error reporting issue:', error);
            toast.error('Failed to report issue');
            throw error;
        }
    };

    const value = {
        orders,
        loading,
        addOrder,
        updateOrderStatus,
        getOrderById,
        getOrderById,
        refreshOrders: fetchOrders,
        reportIssue
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
