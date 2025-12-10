import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

const MyOrders = () => {
    const { orders, loading } = useOrder();
    const [filterStatus, setFilterStatus] = useState('All');

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Accepted': return 'bg-blue-100 text-blue-800';
            case 'In Process': return 'bg-purple-100 text-purple-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Dispatched': return 'bg-indigo-100 text-indigo-800';
            case 'Delivered': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredOrders = filterStatus === 'All'
        ? orders
        : orders.filter(o => o.status === filterStatus);

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-500">Track your order history and status</p>
                </div>
                <Link
                    to="/vendor/place-order"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                    Place New Order
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Pending', 'In Process', 'Completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Order ID</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Items</th>
                            <th className="px-6 py-4">Total Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-primary-600">#{order._id.slice(-6).toUpperCase()}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {order.orderItems?.length || 0} items
                                </td>
                                <td className="px-6 py-4 font-medium">₹{order.totalPrice?.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredOrders.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;
