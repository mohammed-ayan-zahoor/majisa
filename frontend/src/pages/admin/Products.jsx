import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);
                setProducts(productsRes.data.products);
                setCategories(categoriesRes.data);
            } catch (error) {
                toast.error('Failed to fetch data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data.products);
        } catch (error) {
            toast.error('Failed to fetch products');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                toast.success('Product deleted successfully');
                fetchProducts(); // Refresh list
            } catch (error) {
                toast.error('Failed to delete product');
            }
        }
    };

    const filteredProducts = Array.isArray(products) ? products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedCategory === '' || product.category === selectedCategory)
    ) : [];

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl font-serif font-bold text-gray-900">Products</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Manage your product inventory</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="bg-primary-600 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap flex items-center gap-2"
                >
                    <Plus size={16} />
                    <span className="hidden md:inline">Add Product</span>
                    <span className="md:hidden">Add</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
                    >
                        <option value="">All Categories</option>
                        {categories.map(category => (
                            <option key={category._id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-medium">
                            <tr>
                                <th className="px-4 py-2">Product</th>
                                <th className="px-4 py-2">Code</th>
                                <th className="px-4 py-2">Category</th>
                                <th className="px-4 py-2">Details</th>
                                <th className="px-4 py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                <img
                                                    src={product.images?.[0] || product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-primary-600">{product.productCode}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 text-xs">
                                        <div className="flex gap-2">
                                            <span>W: {product.weight}</span>
                                            <span>P: {product.purity}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => openEditModal(product)}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
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

                {filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No products found.
                    </div>
                )}
            </div>
        </div >
    );
};

export default AdminProducts;
