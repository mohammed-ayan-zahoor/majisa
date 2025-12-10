import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import { PRODUCTS } from '../../services/mockData';
import toast from 'react-hot-toast';

const ProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        category: 'Rings',
        metal: 'Gold',
        purity: '22k',
        weight: '',
        price: '',
        description: '',
        image: '',
        isNew: false
    });

    useEffect(() => {
        if (isEditMode) {
            const product = PRODUCTS.find(p => p.id === parseInt(id));
            if (product) {
                setFormData(product);
            } else {
                toast.error('Product not found');
                navigate('/admin/products');
            }
        }
    }, [id, isEditMode, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        toast.success(isEditMode ? 'Product updated successfully' : 'Product created successfully');
        navigate('/admin/products');
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/admin/products')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">
                        {isEditMode ? 'Edit Product' : 'Add New Product'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    name="category"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option>Rings</option>
                                    <option>Necklaces</option>
                                    <option>Earrings</option>
                                    <option>Bangles</option>
                                    <option>Anklets</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Metal</label>
                                <select
                                    name="metal"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.metal}
                                    onChange={handleChange}
                                >
                                    <option>Gold</option>
                                    <option>Silver</option>
                                    <option>Platinum</option>
                                    <option>Rose Gold</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purity</label>
                                <input
                                    type="text"
                                    name="purity"
                                    placeholder="e.g. 22k"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.purity}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
                                <input
                                    type="text"
                                    name="weight"
                                    placeholder="e.g. 10g"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    value={formData.weight}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="4"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Image & Extras */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="image"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="https://..."
                                    value={formData.image}
                                    onChange={handleChange}
                                />
                                <button type="button" className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                                    <Upload size={20} className="text-gray-500" />
                                </button>
                            </div>
                            {formData.image && (
                                <div className="mt-4 aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isNew"
                                name="isNew"
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                checked={formData.isNew}
                                onChange={handleChange}
                            />
                            <label htmlFor="isNew" className="text-sm text-gray-700">Mark as New Arrival</label>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium flex items-center gap-2"
                    >
                        <Save size={20} />
                        Save Product
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
