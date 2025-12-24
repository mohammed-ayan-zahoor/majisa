import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { TrendingUp, Users, ShoppingBag, AlertCircle } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-medium text-gray-500">{title}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
        {trend && (
            <div className="mt-3 flex items-center text-xs">
                <span className="text-green-600 font-medium flex items-center gap-1">
                    <TrendingUp size={12} /> {trend}
                </span>
                <span className="text-gray-400 ml-2">vs last month</span>
            </div>
        )}
    </div>
);

const AdminDashboard = () => {
    const { orders, loading: ordersLoading, refreshOrders } = useOrder();
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pendingVendors: 0
    });
    const [pendingVendorsList, setPendingVendorsList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch users for pending vendors (not currently in context)
                const { data: vendors } = await api.get('/users?role=vendor');
                const pending = vendors.filter(v => v.status === 'Pending');

                setPendingVendorsList(pending.slice(0, 3));
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
        refreshOrders();
    }, [refreshOrders]);

    // Derived State
    const dashboardStats = React.useMemo(() => {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((acc, order) => acc + (order.isPaid ? order.totalPrice : 0), 0);

        return {
            totalOrders,
            totalRevenue,
            pendingVendors: stats.pendingVendors // Keep from local state
        };
    }, [orders, stats.pendingVendors]);

    const recentOrders = orders.slice(0, 5);

    if (loading || ordersLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-xs text-gray-500">Welcome back, Admin</p>
                </div>
                <a href="/" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 text-sm">
                    Home
                    <TrendingUp size={14} className="rotate-45" />
                </a>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Orders"
                    value={dashboardStats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending Vendors"
                    value={pendingVendorsList.length} // Simplified
                    icon={Users}
                    color="bg-orange-500"
                />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Recent Orders</h3>
                    <div className="space-y-3">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-500 text-xs">No recent orders.</p>
                        ) : (
                            recentOrders.map((order) => (
                                <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                                            #{order._id.slice(-4)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">Order #{order._id.slice(-6)}</p>
                                            <p className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm">Pending Vendor Requests</h3>
                    <div className="space-y-3">
                        {pendingVendorsList.length === 0 ? (
                            <p className="text-gray-500 text-xs">No pending requests.</p>
                        ) : (
                            pendingVendorsList.map((vendor) => (
                                <div key={vendor._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold text-sm">
                                            {vendor.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{vendor.businessName || vendor.name}</p>
                                            <p className="text-[10px] text-gray-500">{vendor.city || 'Unknown City'}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-primary-600 font-medium">Review</span>
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
