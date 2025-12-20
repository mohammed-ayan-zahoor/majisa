import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, UserCheck, UserX, X, Hammer, Edit2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

const AdminGoldsmiths = () => {
    const [goldsmiths, setGoldsmiths] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedGoldsmith, setSelectedGoldsmith] = useState(null);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form States
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

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="text-sm font-medium text-gray-900">
                    Are you sure you want to remove this goldsmith?
                </div>
                <div className="flex gap-2 justify-end">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            const loadingToast = toast.loading('Removing goldsmith...');
                            try {
                                await api.delete(`/users/${id}`);
                                setGoldsmiths(prev => prev.filter(g => g._id !== id));
                                toast.success('Goldsmith removed successfully', { id: loadingToast });
                            } catch (error) {
                                console.error('Error deleting goldsmith:', error);
                                toast.error('Failed to delete goldsmith', { id: loadingToast });
                            }
                        }}
                        className="px-3 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        ), {
            duration: 5000,
            position: 'top-center',
            style: {
                minWidth: '300px',
                border: '1px solid #fee2e2',
                padding: '12px'
            }
        });
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
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', password: '', phone: '' });
        } catch (error) {
            console.error('Error adding goldsmith:', error);
            toast.error(error.response?.data || 'Failed to add goldsmith');
        }
    };

    const handleEditGoldsmith = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/users/${selectedGoldsmith._id}`, formData);
            setGoldsmiths(prev => prev.map(g => g._id === selectedGoldsmith._id ? { ...g, ...data } : g));
            setIsEditModalOpen(false);
            setSelectedGoldsmith(null);
            setFormData({ name: '', email: '', password: '', phone: '' });
            toast.success('Goldsmith updated successfully');
        } catch (error) {
            console.error('Error updating goldsmith:', error);
            toast.error(error.response?.data || 'Failed to update goldsmith');
        }
    };

    const openEditModal = (goldsmith) => {
        setSelectedGoldsmith(goldsmith);
        setFormData({
            name: goldsmith.name,
            email: goldsmith.email,
            password: '', // Keep empty
            phone: goldsmith.phone || ''
        });
        setIsEditModalOpen(true);
    };

    const filteredGoldsmiths = goldsmiths.filter(goldsmith =>
        goldsmith.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goldsmith.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        goldsmith.phone?.includes(searchTerm)
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <SEO title="Manage Goldsmiths" description="Admin Goldsmith Management" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-xl font-serif font-bold text-gray-900">Goldsmiths</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Manage your manufacturing team</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                    <Plus size={16} />
                    <span className="hidden md:inline">Add Goldsmith</span>
                    <span className="md:hidden">Add</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search goldsmiths..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-medium">
                            <tr>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Contact</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredGoldsmiths.map((goldsmith) => (
                                <tr key={goldsmith._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-primary-50 p-1.5 rounded-full text-primary-600">
                                                <Hammer size={14} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{goldsmith.name}</p>
                                                <p className="text-[10px] text-gray-500">{goldsmith.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <div className="text-xs">{goldsmith.email}</div>
                                        <div className="text-[10px] text-gray-400">{goldsmith.phone}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${goldsmith.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {goldsmith.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleToggleStatus(goldsmith._id, goldsmith.status)}
                                                className={`p-1.5 rounded-lg transition-colors ${goldsmith.status === 'Active'
                                                    ? 'text-orange-500 hover:bg-orange-50'
                                                    : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={goldsmith.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            >
                                                {goldsmith.status === 'Active' ? <UserX size={16} /> : <UserCheck size={16} />}
                                            </button>
                                            <button
                                                onClick={() => openEditModal(goldsmith)}
                                                className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(goldsmith._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                {filteredGoldsmiths.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No goldsmiths found.
                    </div>
                )}
            </div>

            {/* Add Goldsmith Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add New Goldsmith</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
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
                                    onClick={() => setIsAddModalOpen(false)}
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

            {/* Edit Goldsmith Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit Goldsmith</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleEditGoldsmith} className="space-y-4">
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
                                <input
                                    type="password"
                                    placeholder="Leave blank to keep current"
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
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700"
                                >
                                    Update Goldsmith
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
