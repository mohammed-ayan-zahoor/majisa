import React, { useState, useEffect } from 'react';
import { Search, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

const AdminVendors = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        businessName: '',
        phone: '',
        gst: '',
        referralCode: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const { data } = await api.get('/users?role=vendor');
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error('Failed to load vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/users/${id}/status`, { status: newStatus });
            setVendors(prev => prev.map(v =>
                v._id === id ? { ...v, status: newStatus } : v
            ));
            toast.success(`Vendor ${newStatus === 'Approved' ? 'approved' : 'rejected'} successfully`);
        } catch (error) {
            console.error('Error updating vendor status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="text-sm font-medium text-gray-900">
                    Are you sure you want to delete this vendor?
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
                            const loadingToast = toast.loading('Deleting vendor...');
                            try {
                                await api.delete(`/users/${id}`);
                                setVendors(prev => prev.filter(v => v._id !== id));
                                toast.success('Vendor deleted successfully', { id: loadingToast });
                            } catch (error) {
                                toast.error('Failed to delete vendor', { id: loadingToast });
                            }
                        }}
                        className="px-3 py-1 text-xs font-medium bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors"
                    >
                        Delete
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

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users', { ...formData, role: 'vendor' });
            setVendors([...vendors, { ...data, status: 'Approved' }]); // Admin created are approved
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', password: '', businessName: '', phone: '', gst: '', referralCode: '' });
            toast.success('Vendor created successfully');
        } catch (error) {
            toast.error(error.response?.data || 'Failed to create vendor');
        }
    };

    const handleEditVendor = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put(`/users/${selectedVendor._id}`, formData);
            setVendors(prev => prev.map(v => v._id === selectedVendor._id ? { ...v, ...data } : v));
            setIsEditModalOpen(false);
            setSelectedVendor(null);
            setFormData({ name: '', email: '', password: '', businessName: '', phone: '', gst: '', referralCode: '' });
            toast.success('Vendor updated successfully');
        } catch (error) {
            toast.error(error.response?.data || 'Failed to update vendor');
        }
    };

    const openEditModal = (vendor) => {
        setSelectedVendor(vendor);
        setFormData({
            name: vendor.name,
            email: vendor.email,
            password: '', // Don't show existing password
            businessName: vendor.businessName || '',
            phone: vendor.phone || '',
            gst: vendor.gst || '',
            city: vendor.city || '',
            state: vendor.state || '',
            address: vendor.address || '',
            referralCode: vendor.referralCode || ''
        });
        setIsEditModalOpen(true);
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone?.includes(searchTerm) ||
        vendor.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <SEO title="Manage Vendors" description="Admin Vendor Management" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-xl font-serif font-bold text-gray-900">Vendors</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Manage vendor registrations and approvals</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                    <span>+</span>
                    <span>Add <span className="hidden md:inline">New Vendor</span></span>
                </button>
            </div>

            {/* Search Only - Filters Removed */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-medium">
                            <tr>
                                <th className="px-4 py-2">Vendor Name</th>
                                <th className="px-4 py-2">Business Name</th>
                                <th className="px-4 py-2">Location</th>
                                <th className="px-4 py-2">Contact</th>
                                <th className="px-4 py-2">Ref Code/GST</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVendors.map((vendor) => (
                                <tr key={vendor._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{vendor.name}</td>
                                    <td className="px-4 py-3 text-gray-600 text-sm">{vendor.businessName}</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">
                                        <div>{vendor.city}</div>
                                        <div className="truncate max-w-[150px]">{vendor.address}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <div className="text-sm">{vendor.email}</div>
                                        <div className="text-xs text-gray-400">{vendor.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-primary-600">
                                        <div>{vendor.referralCode}</div>
                                        {vendor.gst && <div className="text-gray-500 text-[10px]">{vendor.gst}</div>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${vendor.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            vendor.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {vendor.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(vendor)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Edit Details"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {vendor.status === 'Pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(vendor._id, 'Approved')}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(vendor._id, 'Rejected')}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleDelete(vendor._id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredVendors.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No vendors found.</div>
                )}
            </div>

            {/* Add Vendor Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Vendor</h2>
                        <form onSubmit={handleAddVendor} className="space-y-4">
                            <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input type="email" placeholder="Email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <input type="password" placeholder="Password" required className="w-full p-2 border rounded" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            <input type="text" placeholder="Business Name" className="w-full p-2 border rounded" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                            <input type="text" placeholder="Phone" className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Create Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Vendor Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit Vendor</h2>
                        <form onSubmit={handleEditVendor} className="space-y-4">
                            <input type="text" placeholder="Full Name" required className="w-full p-2 border rounded" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            <input type="email" placeholder="Email" required className="w-full p-2 border rounded" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            <input type="password" placeholder="New Password (leave blank to keep current)" className="w-full p-2 border rounded" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            <input type="text" placeholder="Business Name" className="w-full p-2 border rounded" value={formData.businessName} onChange={e => setFormData({ ...formData, businessName: e.target.value })} />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Phone" className="w-full p-2 border rounded" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                <input type="text" placeholder="GST" className="w-full p-2 border rounded" value={formData.gst} onChange={e => setFormData({ ...formData, gst: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="City" className="w-full p-2 border rounded" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                <div className="relative"> {/* State is not in formData initial state, adding safely */}
                                    <input type="text" placeholder="State" className="w-full p-2 border rounded" value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                                </div>
                            </div>
                            <textarea placeholder="Address" rows="2" className="w-full p-2 border rounded" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })}></textarea>
                            <input type="text" placeholder="Referral Code" className="w-full p-2 border rounded font-mono" value={formData.referralCode} onChange={e => setFormData({ ...formData, referralCode: e.target.value })} />
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">Update Vendor</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVendors;
