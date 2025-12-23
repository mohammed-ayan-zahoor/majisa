import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, MapPin, Calendar, Printer, CheckCircle } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

const VendorOrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load details');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handlePrintInvoice = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center">Loading details...</div>;
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    return (
        <div className="p-8 max-w-5xl mx-auto print:p-0">
            <SEO title={`Order #${order?._id?.substring(0, 8)}`} description="Order Details" />
            {/* Standard Dashboard UI - Hide on Print */}
            <div className="print:hidden">
                <div>
                    <button
                        onClick={() => navigate('/vendor/orders')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Orders
                    </button>
                </div>

                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Order #{order._id.substring(0, 8)}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar size={16} />
                                {new Date(order.createdAt).toLocaleString()}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrintInvoice}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Printer size={18} />
                            Print Invoice
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Order Items */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="font-bold text-gray-900">Order Items</h3>
                            </div>
                            <div className="divide-y divide-gray-100">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="p-6 flex items-center gap-4">
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                            <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            {item.productCode && <p className="text-xs text-gray-400">Code: {item.productCode}</p>}
                                            {item.selectedWeight && <p className="text-xs font-bold text-primary-600 mt-1">Weight: {item.selectedWeight}</p>}
                                            {item.customFieldValues && item.customFieldValues.length > 0 && (
                                                <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100">
                                                    {item.customFieldValues.map((field, idx) => (
                                                        <div key={idx} className="flex gap-1">
                                                            <span className="font-medium">{field.fieldName}:</span>
                                                            <span>{field.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline/Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-6">Order Status</h3>
                            <div className="flex flex-col gap-4">
                                {['Pending', 'Accepted', 'In Process', 'Completed', 'Dispatched', 'Delivered'].map((step, idx) => {
                                    const isCompleted = ['Pending', 'Accepted', 'In Process', 'Completed', 'Dispatched', 'Delivered'].indexOf(order.status) >= idx;
                                    return (
                                        <div key={step} className="flex items-center gap-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                <CheckCircle size={16} />
                                            </div>
                                            <span className={isCompleted ? 'text-gray-900 font-medium' : 'text-gray-400'}>{step}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-900 mb-4">Customer Details</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
                                    <p className="text-sm text-gray-500">{order.user?.email || 'No email'}</p>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex gap-3">
                                    <MapPin size={18} className="text-gray-400 flex-shrink-0" />
                                    <p className="text-sm text-gray-600">
                                        {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
                                        {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Invoice Layout - Show only on Print */}
            <div className="hidden print:block p-8 bg-white">
                {/* Header */}
                <div className="flex justify-between items-start mb-8 border-b pb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-gray-900">MAJISA</h1>
                        <p className="text-gray-500 mt-2">Premium Jewellery</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                        <p className="text-gray-500">#{order._id.substring(0, 8).toUpperCase()}</p>
                        <p className="text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {/* Bill To / Ship To */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-gray-500 font-medium mb-2">Bill To:</h3>
                        <p className="font-bold text-gray-900">{order.user?.name}</p>
                        <p className="text-gray-600">{order.user?.email}</p>
                    </div>
                    <div>
                        <h3 className="text-gray-500 font-medium mb-2">Ship To:</h3>
                        <p className="text-gray-900">
                            {order.shippingAddress?.address}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}<br />
                            {order.shippingAddress?.country}
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-gray-900">
                            <th className="text-left py-3 font-bold text-gray-900">Item</th>
                            <th className="text-center py-3 font-bold text-gray-900">Qty</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4 text-gray-900">
                                    <p className="font-medium">{item.name}</p>
                                    {item.productCode && <p className="text-xs text-gray-500 inline mr-3">Code: {item.productCode}</p>}
                                    {item.selectedWeight && <p className="text-xs font-bold text-gray-900 inline">Weight: {item.selectedWeight}</p>}
                                    {item.customFieldValues && item.customFieldValues.length > 0 && (
                                        <div className="mt-1 text-xs text-gray-600">
                                            {item.customFieldValues.map((field, idx) => (
                                                <span key={idx} className="mr-3">
                                                    <span className="font-medium">{field.fieldName}:</span> {field.value}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 text-center text-gray-900">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t text-center text-gray-500 text-sm">
                    <p>Thank you for your business!</p>
                    <p className="mt-2">Majisa Jewellers • 123 Gold Market, City • contact@majisa.com</p>
                </div>
            </div>
        </div>
    );
};

export default VendorOrderDetails;
