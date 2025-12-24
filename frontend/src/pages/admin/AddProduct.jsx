import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

import { useQueryClient } from '@tanstack/react-query';

const AddProduct = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        productCode: '',
        description: '',
        category: '',
        metal: 'Gold',
        purity: '22k',
        weight: [], // Array of weight options
        wastage: '',
        images: [], // Array of image URLs
        isNewArrival: false,
        isFeatured: false
    });

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
            // Set default category if creating new and categories exist
            if (!isEditMode && data.length > 0) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            setFormData({
                name: data.name,
                productCode: data.productCode || '',
                description: data.description,
                category: data.category,
                metal: data.metal,
                purity: data.purity,
                weight: Array.isArray(data.weight) ? data.weight : (data.weight ? [data.weight] : []),
                wastage: data.wastage || '',
                images: data.images && data.images.length > 0 ? data.images : (data.image ? [data.image] : []),
                isNewArrival: data.isNewArrival,
                isFeatured: data.isFeatured || false
            });
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product details');
            navigate('/admin/products');
        }
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const uploadedUrls = [];

        try {
            // Upload each file sequentially (or parallel if preferred)
            for (const file of files) {
                const uploadData = new FormData();
                uploadData.append('image', file);

                const { data } = await api.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                uploadedUrls.push(data);
            }

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...uploadedUrls]
            }));
            toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.images.length === 0) {
            return toast.error('Please upload at least one image');
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                image: formData.images[0] // Set main image as the first one for backward compatibility
            };

            if (isEditMode) {
                await api.put(`/products/${id}`, payload);
                toast.success('Product updated successfully');
            } else {
                await api.post('/products', payload);
                toast.success('Product created successfully');
            }
            queryClient.invalidateQueries(['products']);
            navigate('/admin/products');
        } catch (error) {
            console.error('Save product error:', error);
            toast.error(isEditMode ? 'Failed to update product' : 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <SEO title={isEditMode ? 'Edit Product' : 'Add New Product'} description={isEditMode ? 'Update existing product' : 'Create new product'} />
            <button
                onClick={() => navigate('/admin/products')}
                className="flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Products
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
                <p className="text-gray-500">{isEditMode ? 'Update existing product details' : 'Create a new item for your collection'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Image Upload */}
                    <div className="lg:col-span-1 space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Product Images</label>

                        {/* Main Image / Upload Area */}
                        <div className="space-y-4">
                            <div className={`relative aspect-square rounded-xl border-2 border-dashed ${formData.images.length > 0 ? 'border-gray-300' : 'border-primary-500'} flex flex-col items-center justify-center bg-gray-50 overflow-hidden group`}>
                                <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-gray-100 transition-colors">
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                                    ) : (
                                        <>
                                            <Upload className="text-gray-400 mb-2" size={32} />
                                            <span className="text-sm text-gray-500 text-center px-4">Click to upload images</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>

                            {/* Image Grid */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {formData.images.map((img, index) => (
                                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                                            <img src={img} alt={`Product ${index + 1}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveImage(index)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                            {index === 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-[10px] text-center py-0.5">
                                                    Main
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.productCode}
                                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Wastage (%)</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.wastage}
                                    onChange={(e) => setFormData({ ...formData, wastage: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Weight Options</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        id="newWeight"
                                        placeholder="e.g. 15.5g"
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.target.value.trim();
                                                if (val && !formData.weight.includes(val)) {
                                                    setFormData({ ...formData, weight: [...formData.weight, val] });
                                                    e.target.value = '';
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('newWeight');
                                            const val = input.value.trim();
                                            if (val && !formData.weight.includes(val)) {
                                                setFormData({ ...formData, weight: [...formData.weight, val] });
                                                input.value = '';
                                            }
                                        }}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-bold"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-gray-50 rounded-lg border border-gray-200">
                                    {formData.weight.length === 0 && <span className="text-xs text-gray-400 italic">No weights added yet</span>}
                                    {formData.weight.map((w, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200 text-xs font-medium text-gray-700">
                                            {w}
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, weight: formData.weight.filter((_, i) => i !== idx) })}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                                >
                                    <option value="" disabled>Select Category</option>
                                    {categories.map(cat => (
                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                {categories.length === 0 && (
                                    <p className="text-xs text-red-500 mt-1">No categories found. Please create one first.</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Metal</label>
                                <select
                                    value={formData.metal}
                                    onChange={(e) => setFormData({ ...formData, metal: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option>Gold</option>
                                    <option>Silver</option>
                                    <option>Platinum</option>
                                    <option>Rose Gold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Purity</label>
                                <select
                                    value={formData.purity}
                                    onChange={(e) => setFormData({ ...formData, purity: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option>24k</option>
                                    <option>22k</option>
                                    <option>18k</option>
                                    <option>14k</option>
                                    <option>92.5 (Silver)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isNewArrival"
                                    checked={formData.isNewArrival}
                                    onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <label htmlFor="isNewArrival" className="text-sm font-medium text-gray-700">Mark as New Arrival</label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                                    className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                                />
                                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 font-bold text-amber-600">⭐ Feature this Product (Catalog Discovery)</label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                                rows="4"
                                required
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/products')}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Product' : 'Create Product')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;
