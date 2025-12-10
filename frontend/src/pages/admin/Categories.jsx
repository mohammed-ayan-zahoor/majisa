import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, Layers, Upload } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        customFields: []
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            toast.error('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                image: category.image || '',
                customFields: category.customFields || []
            });
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                description: '',
                image: '',
                customFields: []
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    const handleAddField = () => {
        setFormData({
            ...formData,
            customFields: [
                ...formData.customFields,
                { name: '', type: 'text', options: [], required: false }
            ]
        });
    };

    const handleRemoveField = (index) => {
        const newFields = [...formData.customFields];
        newFields.splice(index, 1);
        setFormData({ ...formData, customFields: newFields });
    };

    const handleFieldChange = (index, key, value) => {
        const newFields = [...formData.customFields];
        newFields[index][key] = value;
        setFormData({ ...formData, customFields: newFields });
    };

    const handleOptionChange = (index, value) => {
        const newFields = [...formData.customFields];
        // Split by comma and trim
        newFields[index].options = value.split(',').map(opt => opt.trim());
        setFormData({ ...formData, customFields: newFields });
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);

        try {
            const { data } = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setFormData({ ...formData, image: data });
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory._id}`, formData);
                toast.success('Category updated successfully');
            } else {
                await api.post('/categories', formData);
                toast.success('Category created successfully');
            }
            fetchCategories();
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? This might affect products using this category.')) {
            try {
                await api.delete(`/categories/${id}`);
                toast.success('Category deleted');
                fetchCategories();
            } catch (error) {
                toast.error('Failed to delete category');
            }
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Categories</h1>
                    <p className="text-gray-500">Manage product categories and custom fields</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                    <div key={category._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary-50 p-3 rounded-lg text-primary-600 overflow-hidden w-12 h-12 flex items-center justify-center">
                                    {category.image ? (
                                        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Layers size={24} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                                    <p className="text-sm text-gray-500">{category.customFields?.length || 0} Custom Fields</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleOpenModal(category)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Edit size={18} />
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        {category.description && (
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{category.description}</p>
                        )}

                        <div className="space-y-2">
                            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fields</h4>
                            <div className="flex flex-wrap gap-2">
                                {category.customFields?.slice(0, 3).map((field, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md border border-gray-200">
                                        {field.name}
                                    </span>
                                ))}
                                {(category.customFields?.length > 3) && (
                                    <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-md">
                                        +{category.customFields.length - 3} more
                                    </span>
                                )}
                                {(!category.customFields || category.customFields.length === 0) && (
                                    <span className="text-xs text-gray-400 italic">No custom fields</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                                <div className="flex items-center gap-4">
                                    {formData.image && (
                                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                                            <img src={formData.image} alt="Category" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                        {uploading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                        ) : (
                                            <Upload size={18} />
                                        )}
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="e.g., Couple Rings"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    rows="3"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Custom Fields</label>
                                    <button
                                        type="button"
                                        onClick={handleAddField}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                                    >
                                        <Plus size={16} /> Add Field
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {formData.customFields.map((field, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveField(index)}
                                                className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} />
                                            </button>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Field Name</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={field.name}
                                                        onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="e.g., Boy Name"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                                                    <select
                                                        value={field.type}
                                                        onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
                                                    >
                                                        <option value="text">Text</option>
                                                        <option value="number">Number</option>
                                                        <option value="dropdown">Dropdown</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {field.type === 'dropdown' && (
                                                <div className="mb-3">
                                                    <label className="block text-xs text-gray-500 mb-1">Options (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={field.options?.join(', ')}
                                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                                        placeholder="Option 1, Option 2, Option 3"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id={`req-${index}`}
                                                    checked={field.required}
                                                    onChange={(e) => handleFieldChange(index, 'required', e.target.checked)}
                                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor={`req-${index}`} className="ml-2 block text-sm text-gray-600">
                                                    Required Field
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                    {formData.customFields.length === 0 && (
                                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            No custom fields added yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Save Category
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
