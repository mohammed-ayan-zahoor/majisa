import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Clock, CheckCircle, Truck, XCircle, User, Store, Trash2 } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminOrders = () => {
    const { orders, loading, refreshOrders } = useOrder();
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this order?')) {
            try {
                await api.delete(`/orders/${id}`);
                toast.success('Order deleted');
                refreshOrders();
            } catch (error) {
                console.error(error);
                toast.error('Failed to delete order');
            }
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
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl font-serif font-bold text-gray-900">Orders</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Manage and track vendor orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Order ID..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {['All', 'Pending', 'In Process', 'Completed', 'Cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filterStatus === status
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-medium">
                            <tr>
                                <th className="px-4 py-2">Order ID</th>
                                <th className="px-4 py-2">Vendor</th>
                                <th className="px-4 py-2">Items</th>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-primary-600 text-xs">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-gray-100 p-1.5 rounded-full">
                                                <Store size={14} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{order.user?.businessName || 'Unknown'}</p>
                                                <p className="text-[10px] text-gray-500">{order.user?.name}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">
                                        {order.orderItems?.length || 0} items
                                    </td>

                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                            className={`px-2 py-1 rounded-lg text-[10px] font-medium border-0 cursor-pointer focus:ring-1 focus:ring-primary-500 ${getStatusColor(order.status)}`}
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="In Process">In Process</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link
                                                to={`/admin/orders/${order._id}`}
                                                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(order._id)}
                                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete Order"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

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
