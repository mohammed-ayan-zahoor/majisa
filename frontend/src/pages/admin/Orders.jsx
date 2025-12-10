import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Clock, CheckCircle, Truck, XCircle, User } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

const AdminOrders = () => {
    const { orders, loading } = useOrder();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700';
            case 'Accepted': return 'bg-blue-100 text-blue-700';
            case 'In Process': return 'bg-purple-100 text-purple-700';
            case 'Completed': return 'bg-green-100 text-green-700';
            case 'Dispatched': return 'bg-indigo-100 text-indigo-700';
            case 'Delivered': return 'bg-teal-100 text-teal-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.user && order.user.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center">Loading orders...</div>;

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500">Manage and track all orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Process">In Process</option>
                        <option value="Completed">Completed</option>
                        <option value="Dispatched">Dispatched</option>
                        <option value="Delivered">Delivered</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Goldsmith</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-primary-600">#{order._id.substring(0, 8)}...</td>
                                <td className="px-6 py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        <span className="text-gray-900">{order.user ? order.user.name : 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {order.goldsmith ? 'Assigned' : <span className="text-gray-400 italic">Unassigned</span>}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        to={`/admin/orders/${order._id}`}
                                        className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        No orders found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
