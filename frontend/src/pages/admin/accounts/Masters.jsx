import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2 } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const TabButton = ({ active, children, onClick }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${active
            ? 'border-primary-600 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
    >
        {children}
    </button>
);

const Masters = () => {
    const [activeTab, setActiveTab] = useState('groups');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form States
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = `/accounts/${activeTab}`; // groups, items, parties
            const response = await api.get(endpoint);
            setData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedInputChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const singularizeActiveTab = (tab) => {
        const irregulars = { 'parties': 'Party', 'categories': 'Category' };
        if (irregulars[tab]) return irregulars[tab];
        let singular = tab;
        if (tab.endsWith('ies')) singular = tab.slice(0, -3) + 'y';
        else if (tab.endsWith('s')) singular = tab.slice(0, -1);
        return singular.charAt(0).toUpperCase() + singular.slice(1);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = `/accounts/${activeTab}`;
            await api.post(endpoint, formData);
            toast.success("Created successfully");
            setShowModal(false);
            setFormData({});
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to create");
        }
    };

    const headers = {
        groups: ['Name', 'Type', 'Description'],
        items: ['Name', 'Metal', 'Purity', 'Opening Stock'],
        parties: ['Name', 'Group', 'City', 'Phone', 'Op. Metal', 'Op. Amount']
    };

    const renderFormInfo = () => {
        switch (activeTab) {
            case 'groups':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            <input
                                required
                                name="name"
                                value={formData.name || ''}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                required
                                name="type"
                                value={formData.type || ''}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                <option value="">Select Type</option>
                                <option value="Asset">Asset</option>
                                <option value="Liability">Liability</option>
                                <option value="Income">Income</option>
                                <option value="Expense">Expense</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleInputChange}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </>
                );
            case 'items':
                return (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                            <input required name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Metal</label>
                                <select required name="metal" value={formData.metal || 'Gold'} onChange={handleInputChange} className="w-full border rounded-lg p-2">
                                    <option value="Gold">Gold</option>
                                    <option value="Silver">Silver</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purity (Touch)</label>
                                <input required type="number" step="0.01" name="purity" value={formData.purity || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                            </div>
                        </div>
                    </>
                );
            case 'parties':
                // We need to fetch groups to select from
                return <PartyForm formData={formData} setFormData={setFormData} handleInputChange={handleInputChange} handleNestedInputChange={handleNestedInputChange} />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold font-serif text-gray-900">Masters Management</h1>
                <button
                    onClick={() => { setFormData(activeTab === 'items' ? { metal: 'Gold' } : {}); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                    <Plus size={20} />
                    Add New
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <TabButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')}>Groups</TabButton>
                    <TabButton active={activeTab === 'items'} onClick={() => setActiveTab('items')}>Items</TabButton>
                    <TabButton active={activeTab === 'parties'} onClick={() => setActiveTab('parties')}>Parties</TabButton>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">Loading data...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-700 font-bold font-serif">
                                    <tr>
                                        {headers[activeTab].map(h => <th key={h} className="px-4 py-3">{h}</th>)}
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {(Array.isArray(data) ? data : []).map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            {activeTab === 'groups' && (
                                                <>
                                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${item.type === 'Asset' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.type}</span></td>
                                                    <td className="px-4 py-3 text-gray-500">{item.description}</td>
                                                </>
                                            )}
                                            {activeTab === 'items' && (
                                                <>
                                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                                    <td className="px-4 py-3">{item.metal}</td>
                                                    <td className="px-4 py-3">{item.purity}</td>
                                                    <td className="px-4 py-3">{item.openingStock?.weight || 0}</td>
                                                </>
                                            )}
                                            {activeTab === 'parties' && (
                                                <>
                                                    <td className="px-4 py-3 font-medium">{item.name}</td>
                                                    <td className="px-4 py-3 text-primary-600">{item.group?.name}</td>
                                                    <td className="px-4 py-3">{item.city}</td>
                                                    <td className="px-4 py-3">{item.phone}</td>
                                                    <td className="px-4 py-3">{item.openingBalance?.metal?.weight || 0}</td>
                                                    <td className="px-4 py-3">{item.openingBalance?.amount?.value || 0}</td>
                                                </>
                                            )}
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <button className="p-1 text-gray-400 hover:text-primary-600"><Edit2 size={16} /></button>
                                                <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {data.length === 0 && (
                                        <tr>
                                            <td colSpan={headers[activeTab]?.length + 1 || 6} className="px-4 py-8 text-center text-gray-400">
                                                No data found. Add new record.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
                        <h2 className="text-xl font-bold font-serif mb-4">Add New {singularizeActiveTab(activeTab)}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {renderFormInfo()}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-component for Party Form to handle group fetching
const PartyForm = ({ formData, handleInputChange, handleNestedInputChange }) => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        api.get('/accounts/groups')
            .then(res => setGroups(res.data))
            .catch(err => {
                console.error("Failed to load groups", err);
                toast.error("Failed to load account groups");
            });
    }, []);

    return (
        <div className="space-y-3">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Party Name</label>
                <input required name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Group</label>
                <select required name="group" value={formData.group || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2">
                    <option value="">Select Group</option>
                    {(Array.isArray(groups) ? groups : []).map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input name="city" value={formData.city || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2" />
                </div>
            </div>
            {/* Opening Balances */}
            <div className="border-t pt-2 mt-2">
                <p className="text-sm font-bold text-gray-900 mb-2">Opening Balances</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500">Metal Wt</label>
                        <input
                            type="number"
                            value={formData.openingBalance?.metal?.weight || 0}
                            onChange={(e) => handleNestedInputChange('openingBalance', 'metal', { ...formData.openingBalance?.metal, weight: e.target.value })}
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500">Amount</label>
                        <input
                            type="number"
                            value={formData.openingBalance?.amount?.value || 0}
                            onChange={(e) => handleNestedInputChange('openingBalance', 'amount', { ...formData.openingBalance?.amount, value: e.target.value })}
                            className="w-full border rounded-lg p-2 text-sm"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Masters;
