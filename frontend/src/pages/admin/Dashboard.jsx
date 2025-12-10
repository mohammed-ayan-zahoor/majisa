import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, Users, ShoppingBag, AlertCircle } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm">
                <span className="text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp size={14} /> {trend}
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
            </div>
        )}
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingVendors: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [pendingVendorsList, setPendingVendorsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch orders
                const { data: orders } = await api.get('/orders');
                const totalOrders = orders.length;
                const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

                // Fetch users for pending vendors
                const { data: vendors } = await api.get('/users?role=vendor');
                const pending = vendors.filter(v => v.status === 'Pending');

                setStats({
                    totalOrders,
                    totalRevenue,
                    pendingVendors: pending.length
                });

                setRecentOrders(orders.slice(0, 5)); // Get last 5 orders
                setPendingVendorsList(pending.slice(0, 3)); // Get first 3 pending vendors
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back, Admin</p>
                </div>
                <a href="/" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2">
                    Back to Home
                    <TrendingUp size={16} className="rotate-45" />
                </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending Vendors"
                    value={stats.pendingVendors}
                    icon={Users}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
                    <div className="space-y-4">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-sm">No recent orders.</p>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                                            #{order._id.slice(-4)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order #{order._id.slice(-6)}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4">Pending Vendor Requests</h3>
                    <div className="space-y-4">
                        {pendingVendorsList.length === 0 ? (
                            <p className="text-gray-500 text-sm">No pending requests.</p>
                        ) : (
                            pendingVendorsList.map((vendor) => (
                                <div key={vendor._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                                            {vendor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{vendor.businessName || vendor.name}</p>
                                            <p className="text-xs text-gray-500">{vendor.city || 'Unknown City'}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-primary-600 font-medium">Review</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
