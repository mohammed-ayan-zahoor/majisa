import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Clock, CheckCircle, TrendingUp, Copy } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }) => (
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
    </div>
);

const VendorDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pending: 0,
        completed: 0,
        thisMonth: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [profileRes, ordersRes] = await Promise.all([
                api.get('/users/profile'),
                api.get('/orders/myorders')
            ]);

            setProfile(profileRes.data);
            const orders = ordersRes.data;
            setRecentOrders(orders.slice(0, 5));

            const total = orders.length;
            const pending = orders.filter(o => o.status === 'Pending').length;
            const completed = orders.filter(o => o.status === 'Delivered').length;
            // Mocking "This Month" for now or calculate real logic
            const thisMonth = orders.filter(o => new Date(o.createdAt).getMonth() === new Date().getMonth()).length;

            setStats({ totalOrders: total, pending, completed, thisMonth });

        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = () => {
        if (profile?.referralCode) {
            navigator.clipboard.writeText(profile.referralCode);
            toast.success('Referral code copied!');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
                        <Link to="/" className="text-sm text-primary-600 hover:text-primary-700 underline">Back to Home</Link>
                    </div>
                    <p className="text-gray-500">Welcome back, {profile?.name}</p>
                </div>
                {profile?.referralCode && (
                    <div className="bg-primary-50 px-4 py-2 rounded-lg border border-primary-100 flex items-center gap-3">
                        <div>
                            <p className="text-xs text-primary-600 font-medium uppercase tracking-wider">Referral Code</p>
                            <p className="font-mono font-bold text-primary-900">{profile.referralCode}</p>
                        </div>
                        <button
                            onClick={copyReferralCode}
                            className="p-2 hover:bg-white rounded-md transition-colors text-primary-600"
                            title="Copy Code"
                        >
                            <Copy size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending"
                    value={stats.pending}
                    icon={Clock}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Completed"
                    value={stats.completed}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
                <StatCard
                    title="This Month"
                    value={stats.thisMonth}
                    icon={TrendingUp}
                    color="bg-purple-500"
                />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[600px]">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Date</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">#{order._id.substring(0, 8)}</td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">₹{order.totalPrice.toLocaleString()}</td>
                                </tr>
                            ))}
                            {recentOrders.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
