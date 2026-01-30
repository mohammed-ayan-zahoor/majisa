import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, Layers, Upload, ChevronUp, ChevronsUp, ChevronDown, ChevronsDown } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCategories } from '../../hooks/useCategories';
import { useQueryClient } from '@tanstack/react-query';
import CustomFieldManager from '../../components/admin/CustomFieldManager';

const Categories = () => {
    const queryClient = useQueryClient();
    const { data: categories = [], isLoading: loading, refetch } = useCategories();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        customFields: []
    });
    const [uploading, setUploading] = useState(false);

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
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            handleCloseModal();
        } catch (error) {
            toast.error(error.response?.data || 'Operation failed');
        }
    };

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="text-sm font-medium text-gray-900">
                    Are you sure you want to delete this category?
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
                            const loadingToast = toast.loading('Deleting category...');
                            try {
                                await api.delete(`/categories/${id}`);
                                toast.success('Category deleted', { id: loadingToast });
                                queryClient.invalidateQueries({ queryKey: ['categories'] });
                            } catch (error) {
                                const message = error.response?.data || 'Failed to delete category';
                                toast.error(message, { id: loadingToast });
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

    const handleMove = async (id, direction) => {
        try {
            await api.put(`/categories/${id}/move`, { direction });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        } catch (error) {
            toast.error(error.response?.data || 'Failed to move category');
        }
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const CategorySkeleton = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gray-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer -translate-x-full" />
            </div>
            <div className="p-3 space-y-2">
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
                <div className="flex gap-1">
                    <div className="h-4 w-12 bg-gray-50 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-50 rounded animate-pulse" />
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div className="space-y-2">
                    <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div className="h-12 w-full bg-white rounded-lg border border-gray-100 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <CategorySkeleton key={i} />)}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl font-serif font-bold text-gray-900">Categories</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Manage product categories and custom fields</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 text-white px-3 py-1.5 text-sm rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors whitespace-nowrap"
                >
                    <Plus size={16} />
                    <span className="hidden md:inline">Add Category</span>
                    <span className="md:hidden">Add</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCategories.map((category) => (
                    <div key={category._id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group">
                        <div className="relative h-32 bg-gray-100">
                            <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                <h3 className="text-white font-bold text-md">{category.name}</h3>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-1 group-hover:opacity-100 transition-opacity md:opacity-0 opacity-100">
                                <button
                                    onClick={() => handleOpenModal(category)}
                                    className="p-1.5 bg-white text-blue-600 rounded-lg shadow-sm hover:bg-gray-50"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(category._id)}
                                    className="p-1.5 bg-white text-red-600 rounded-lg shadow-sm hover:bg-gray-50"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
                                <Layers size={14} />
                                <span>Custom Fields ({category.customFields?.length || 0})</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {category.customFields?.slice(0, 3).map((field, idx) => (
                                    <span key={idx} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] rounded border border-gray-100">
                                        {field.name}
                                    </span>
                                ))}
                                {category.customFields?.length > 3 && (
                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] rounded border border-gray-100">
                                        +{category.customFields.length - 3} more
                                    </span>
                                )}
                                {(!category.customFields || category.customFields.length === 0) && (
                                    <span className="text-xs text-gray-400 italic">No custom fields</span>
                                )}
                            </div>

                            {/* Order Controls */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                        Position #{categories.indexOf(category) + 1}
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleMove(category._id, 'top')}
                                            disabled={categories.indexOf(category) === 0}
                                            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                            title="Move to top"
                                        >
                                            <ChevronsUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleMove(category._id, 'up')}
                                            disabled={categories.indexOf(category) === 0}
                                            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                            title="Move up"
                                        >
                                            <ChevronUp size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleMove(category._id, 'down')}
                                            disabled={categories.indexOf(category) === categories.length - 1}
                                            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                            title="Move down"
                                        >
                                            <ChevronDown size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleMove(category._id, 'bottom')}
                                            disabled={categories.indexOf(category) === categories.length - 1}
                                            className="p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400"
                                            title="Move to bottom"
                                        >
                                            <ChevronsDown size={14} />
                                        </button>
                                    </div>
                                </div>
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
                                <CustomFieldManager
                                    fields={formData.customFields}
                                    onChange={(fields) => setFormData({ ...formData, customFields: fields })}
                                />
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
