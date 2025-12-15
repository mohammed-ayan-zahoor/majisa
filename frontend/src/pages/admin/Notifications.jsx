import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n._id === id ? { ...n, read: true } : n
            ));
            toast.success('Marked as read');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
            toast.success('Notification removed');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to update all');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Are you sure you want to delete all notifications?')) return;
        try {
            await api.delete('/notifications/clear-all');
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error) {
            console.error('Error clearing notifications:', error);
            toast.error('Failed to clear notifications');
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
            case 'success': return <CheckCircle size={20} className="text-green-500" />;
            case 'error': return <AlertTriangle size={20} className="text-red-500" />;
            default: return <Info size={20} className="text-blue-500" />;
        }
    };

    const getTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (loading) return <div className="p-8 text-center">Loading notifications...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500">Stay updated with latest activities</p>
                </div>
                {notifications.length > 0 && (
                    <div className="flex gap-4">
                        <button
                            onClick={handleMarkAllRead}
                            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                            Mark all as read
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                {notifications.map((notification) => (
                    <div
                        key={notification._id}
                        className={`bg-white p-4 rounded-xl shadow-sm border transition-colors ${notification.read ? 'border-gray-100' : 'border-primary-100 bg-primary-50/30'
                            }`}
                    >
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-full h-fit ${notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
                                }`}>
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                                        {notification.title}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{getTimeAgo(notification.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                {!notification.read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification._id)}
                                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="Mark as read"
                                    >
                                        <Check size={18} />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(notification._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
                        <p className="text-gray-500">You're all caught up!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminNotifications;
