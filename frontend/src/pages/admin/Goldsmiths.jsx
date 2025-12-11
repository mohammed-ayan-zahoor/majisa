import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, X } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminGoldsmiths = () => {
    const [goldsmiths, setGoldsmiths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });

    useEffect(() => {
        const fetchGoldsmiths = async () => {
            try {
                const { data } = await api.get('/users?role=goldsmith');
                setGoldsmiths(data);
            } catch (error) {
                console.error('Error fetching goldsmiths:', error);
                toast.error('Failed to load goldsmiths');
            } finally {
                setLoading(false);
            }
        };

        fetchGoldsmiths();
    }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        try {
            const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
            await api.put(`/users/${id}/status`, { status: newStatus });
            setGoldsmiths(prev => prev.map(g =>
                g._id === id ? { ...g, status: newStatus } : g
            ));
            toast.success('Goldsmith status updated');
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to remove this goldsmith?')) {
            try {
                await api.delete(`/users/${id}`);
                setGoldsmiths(prev => prev.filter(g => g._id !== id));
                toast.success('Goldsmith removed successfully');
            } catch (error) {
                console.error('Error deleting goldsmith:', error);
                toast.error('Failed to delete goldsmith');
            }
        }
    };

    const handleAddGoldsmith = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users/create', {
                ...formData,
                role: 'goldsmith'
            });
            setGoldsmiths(prev => [...prev, data]);
            toast.success('Goldsmith added successfully');
            setShowModal(false);
            setFormData({ name: '', email: '', password: '', phone: '' });
        } catch (error) {
            console.error('Error adding goldsmith:', error);
            toast.error(error.response?.data || 'Failed to add goldsmith');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Goldsmiths</h1>
                    <p className="text-gray-500 hidden md:block">Manage your manufacturing team</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors whitespace-nowrap"
                >
                    <Plus size={20} />
                    <span className="hidden md:inline">Add Goldsmith</span>
                    <span className="md:hidden">Add</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search goldsmiths..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {goldsmiths.map((goldsmith) => (
                                <tr key={goldsmith._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{goldsmith.name}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div>{goldsmith.email}</div>
                                        <div className="text-xs text-gray-400">{goldsmith.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${goldsmith.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {goldsmith.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(goldsmith._id, goldsmith.status)}
                                                className={`p-2 rounded-lg transition-colors ${goldsmith.status === 'Active'
                                                    ? 'text-orange-500 hover:bg-orange-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={goldsmith.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            >
                                                {goldsmith.status === 'Active' ? <UserX size={18} /> : <UserCheck size={18} />}
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goldsmith._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {goldsmiths.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No goldsmiths found.
                    </div>
                )}
            </div>

            {/* Add Goldsmith Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add New Goldsmith</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddGoldsmith} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
                                >
                                    Create Goldsmith
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGoldsmiths;
