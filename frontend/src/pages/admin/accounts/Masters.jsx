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
    const [itemSubTab, setItemSubTab] = useState('inventory');
    const [partySubTab, setPartySubTab] = useState('general');

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
                    <div className="space-y-4">
                        {/* Header Fields */}
                        <div className="flex gap-6 items-center border-b pb-4">
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-gray-700">Item Type</span>
                                <div className="flex gap-3">
                                    {['Goods', 'Service'].map(type => (
                                        <label key={type} className="flex items-center gap-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="itemType"
                                                value={type}
                                                checked={(formData.itemType || 'Goods') === type}
                                                onChange={handleInputChange}
                                                className="text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    name="name"
                                    placeholder="Enter item name"
                                    value={formData.name || ''}
                                    onChange={handleInputChange}
                                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                                <div className="flex gap-3">
                                    <select
                                        required
                                        name="category"
                                        value={formData.category || ''}
                                        onChange={handleInputChange}
                                        className="flex-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    >
                                        <option value="">Select Category</option>
                                    </select>
                                    <button type="button" className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm font-bold transition-colors">+ Add</button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b pt-2">
                            {['Inventory', 'Hisab', 'GST'].map(tab => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setItemSubTab(tab.toLowerCase())}
                                    className={`px-8 py-2.5 text-sm font-bold border-b-2 transition-all ${itemSubTab === tab.toLowerCase() ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[250px] py-2">
                            {itemSubTab === 'inventory' && (
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between group">
                                            <span className="text-sm font-medium text-gray-700">Tag Number Mode</span>
                                            <div className="flex gap-6">
                                                {['Random Generate', 'With Prefix'].map(mode => (
                                                    <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="tagNumberMode"
                                                            value={mode.includes('Random') ? 'Random' : 'Prefix'}
                                                            checked={(formData.tagNumberMode || 'Random') === (mode.includes('Random') ? 'Random' : 'Prefix')}
                                                            onChange={handleInputChange}
                                                            className="text-primary-600 w-4 h-4"
                                                        />
                                                        <span className="text-xs text-gray-600">{mode}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between group border-b border-gray-50 pb-2">
                                            <span className="text-sm font-medium text-gray-700">Is MRP Item?</span>
                                            <div className="flex gap-8">
                                                {[true, false].map(val => (
                                                    <label key={val.toString()} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="isMRPItem"
                                                            value={val}
                                                            checked={!!formData.isMRPItem === val}
                                                            onChange={() => setFormData(prev => ({ ...prev, isMRPItem: val }))}
                                                            className="text-primary-600 w-4 h-4"
                                                        />
                                                        <span className="text-xs text-gray-600">{val ? 'Yes' : 'No'}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Unit (UoM)</label>
                                                <select name="unit" value={formData.unit || 'Piece'} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                                                    <option value="Piece">Piece</option>
                                                    <option value="Gram">Gram</option>
                                                    <option value="Carat">Carat</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Metal Type</label>
                                                <select name="metal" value={formData.metal || 'Gold'} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                                                    <option value="Gold">Gold</option>
                                                    <option value="Silver">Silver</option>
                                                    <option value="Platinum">Platinum</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Min. Touch</label>
                                                <input type="number" name="minTouch" placeholder="0.00" value={formData.minTouch || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max. Touch</label>
                                                <input type="number" name="maxTouch" placeholder="0.00" value={formData.maxTouch || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between py-1 group border-b border-gray-50 pb-3">
                                            <span className="text-sm font-medium text-gray-700">Unit in Reports?</span>
                                            <div className="flex gap-8">
                                                {['Yes', 'No'].map(val => (
                                                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name="unitInReports"
                                                            checked={(formData.unitInReports !== false && val === 'Yes') || (formData.unitInReports === false && val === 'No')}
                                                            onChange={() => setFormData(prev => ({ ...prev, unitInReports: val === 'Yes' }))}
                                                            className="text-primary-600 w-4 h-4"
                                                        />
                                                        <span className="text-xs text-gray-600">{val}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Maintain Stock?</label>
                                            <select name="maintainStock" value={formData.maintainStock || 'Grams'} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                                                <option value="Grams">Grams</option>
                                                <option value="Pieces">Pieces</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Min. Stock Level</label>
                                                <input type="number" name="minStockLevel" placeholder="0" value={formData.minStockLevel || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Max. Stock Level</label>
                                                <input type="number" name="maxStockLevel" placeholder="1000" value={formData.maxStockLevel || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Preferred Vendor</label>
                                            <input name="preferredVendor" placeholder="Search vendor..." value={formData.preferredVendor || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Default Salesman</label>
                                            <select name="defaultSalesman" value={formData.defaultSalesman || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                                                <option value="">Select Salesman</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {itemSubTab === 'hisab' && (
                                <div className="text-center py-12 text-gray-400">Settings for Hisab calculations will appear here.</div>
                            )}

                            {itemSubTab === 'gst' && (
                                <div className="text-center py-12 text-gray-400">GST and Tax settings for this item.</div>
                            )}
                        </div>

                        <div className="pt-4 border-t">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                            <textarea
                                name="remarks"
                                value={formData.remarks || ''}
                                onChange={handleInputChange}
                                rows={2}
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Enter any additional notes..."
                            />
                        </div>
                    </div>
                );
            case 'parties':
                return <PartyForm
                    formData={formData}
                    setFormData={setFormData}
                    handleInputChange={handleInputChange}
                    handleNestedInputChange={handleNestedInputChange}
                    partySubTab={partySubTab}
                    setPartySubTab={setPartySubTab}
                />;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold font-serif text-gray-900">Masters Management</h1>
                <button
                    onClick={() => {
                        setFormData(activeTab === 'items' ? { metal: 'Gold' } : {});
                        setItemSubTab('inventory');
                        setPartySubTab('general');
                        setShowModal(true);
                    }}
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
                    <div className={`bg-white rounded-xl shadow-xl ${['items', 'parties'].includes(activeTab) ? 'max-w-4xl' : 'max-w-lg'} w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto`}>
                        <h2 className="text-xl font-bold font-serif mb-4 pb-2 border-b">Add New {singularizeActiveTab(activeTab)}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {renderFormInfo()}
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
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
const PartyForm = ({ formData, setFormData, handleInputChange, handleNestedInputChange, partySubTab, setPartySubTab }) => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        api.get('/accounts/groups')
            .then(res => setGroups(res.data))
            .catch(err => {
                console.error("Failed to load groups", err);
                toast.error("Failed to load account groups");
            });
    }, []);

    const tabs = [
        { id: 'general', label: 'General' },
        { id: 'gst', label: 'GST & Taxes' },
        { id: 'contact', label: 'Contact & Address' },
        { id: 'bank', label: 'Bank Details' }
    ];

    return (
        <div className="space-y-6">
            {/* Header section */}
            <div className="grid grid-cols-3 gap-6 pb-6 border-b">
                <div className="col-span-2 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Display Name & Code <span className="text-red-500">*</span></label>
                            <div className="flex gap-2">
                                <input required name="name" placeholder="Company / Full Name" value={formData.name || ''} onChange={handleInputChange} className="flex-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none" />
                                <input name="partyCode" placeholder="0000" value={formData.partyCode || ''} onChange={handleInputChange} className="w-24 border rounded-lg p-2.5 bg-gray-50 text-gray-500 outline-none" readOnly />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Unique Name <span className="text-red-500">*</span></label>
                        <input required name="uniqueName" placeholder="Unique Name" value={formData.uniqueName || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Group <span className="text-red-500">*</span></label>
                        <div className="flex gap-3">
                            <select required name="group" value={formData.group || ''} onChange={handleInputChange} className="flex-1 border rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none">
                                <option value="">Select Group</option>
                                {(Array.isArray(groups) ? groups : []).map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                            </select>
                            <button type="button" className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg font-bold">+ Add</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex border-b">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setPartySubTab(tab.id)}
                        className={`px-6 py-2.5 text-sm font-bold border-b-2 transition-all ${partySubTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-8 min-h-[300px]">
                {/* Main Tab Content */}
                <div className="col-span-7">
                    {partySubTab === 'general' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Address</label>
                                <textarea name="address" rows={3} value={formData.address || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none" />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-[2]">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">City & PIN</label>
                                    <div className="flex gap-2">
                                        <input name="city" placeholder="City" value={formData.city || ''} onChange={handleInputChange} className="flex-[2] border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                                        <input name="pin" placeholder="PIN" value={formData.pin || ''} onChange={handleInputChange} className="w-20 border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">State <span className="text-red-500">*</span></label>
                                    <select name="state" value={formData.state || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500">
                                        <option value="">Select State</option>
                                        <option value="Maharashtra">Maharashtra</option>
                                        <option value="Gujarat">Gujarat</option>
                                        <option value="Rajasthan">Rajasthan</option>
                                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-[2]">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Contact No.</label>
                                    <div className="flex gap-2">
                                        <input name="whatsappNumber" placeholder="WhatsApp" value={formData.whatsappNumber || ''} onChange={handleInputChange} className="flex-1 border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                                        <input name="otherNumber" placeholder="Other No." value={formData.otherNumber || ''} onChange={handleInputChange} className="flex-1 border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                                    <input type="email" name="email" placeholder="Email Address" value={formData.email || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Cash Limit</label>
                                    <input type="number" name="cashLimit" value={formData.cashLimit || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Bill-by-bill ref?</span>
                                    <div className="flex gap-4">
                                        {[true, false].map(val => (
                                            <label key={val.toString()} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="billByBillRef" checked={!!formData.billByBillRef === val} onChange={() => setFormData(p => ({ ...p, billByBillRef: val }))} className="text-primary-600 focus:ring-primary-500" />
                                                <span className="text-sm">{val ? 'Yes' : 'No'}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Due Days</label>
                                    <input type="number" name="dueDays" placeholder="0" value={formData.dueDays || ''} onChange={handleInputChange} className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-500" />
                                </div>
                            </div>
                        </div>
                    )}
                    {partySubTab !== 'general' && (
                        <div className="flex items-center justify-center h-full text-gray-400 italic">
                            {(tabs.find(t => t.id === partySubTab)?.label || 'Selected tab')} fields will be added in the next update.
                        </div>
                    )}
                </div>

                {/* Sidebar - Opening Balances */}
                <div className="col-span-5 bg-blue-50/50 rounded-xl p-6 border border-blue-100">
                    <h3 className="text-sm font-bold text-blue-900 mb-4 border-b border-blue-100 pb-2">Opening Balances</h3>
                    <div className="space-y-4">
                        {['Gold', 'Silver', 'Cash'].map(type => {
                            const field = type.toLowerCase();
                            const isCash = field === 'cash';
                            return (
                                <div key={type} className="space-y-1">
                                    <label className="block text-xs font-bold text-blue-700/60 uppercase tracking-wider">{type}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder={isCash ? '0.00' : '0.000'}
                                            value={isCash ? (formData.openingBalance?.cash?.value || '') : (formData.openingBalance?.[field]?.weight || '')}
                                            onChange={(e) => handleNestedInputChange('openingBalance', field, {
                                                ...(formData.openingBalance?.[field] || {}),
                                                [isCash ? 'value' : 'weight']: e.target.value
                                            })}
                                            className="flex-1 border-blue-200 rounded-lg p-2 text-sm focus:ring-blue-500 outline-none"
                                        />
                                        <select
                                            value={formData.openingBalance?.[field]?.type || 'Cr'}
                                            onChange={(e) => handleNestedInputChange('openingBalance', field, {
                                                ...(formData.openingBalance?.[field] || {}),
                                                type: e.target.value
                                            })}
                                            className="w-24 border-blue-200 rounded-lg p-2 text-xs font-bold bg-white"
                                        >
                                            <option value="Cr">Credit</option>
                                            <option value="Dr">Debit</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                        <div className="pt-4 mt-4 border-t border-blue-100">
                            <label className="block text-xs font-bold text-blue-700/60 uppercase tracking-wider mb-1.5">W.e.f. Date</label>
                            <input
                                type="date"
                                value={formData.wefDate || ''}
                                onChange={handleInputChange}
                                name="wefDate"
                                className="w-full border-blue-200 rounded-lg p-2 text-sm focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Remarks section */}
            <div className="pt-6 border-t">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Remarks (Notes)</label>
                <textarea
                    name="remarks"
                    rows={2}
                    value={formData.remarks || ''}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Enter any additional notes about this party..."
                />
            </div>
        </div>
    );
};

export default Masters;
