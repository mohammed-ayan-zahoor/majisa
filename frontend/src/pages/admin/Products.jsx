import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (error) {
            toast.error('Failed to fetch products');
        } finally {
            setLoading(false);
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

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Products</h1>
                    <p className="text-gray-500">Manage your jewellery collection</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus size={20} />
                    Add Product
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Weight</th>
                            <th className="px-6 py-4">Wastage</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                        <span className="font-medium text-gray-900">{product.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600 font-mono text-sm">{product.productCode || '-'}</td>
                                <td className="px-6 py-4 text-gray-600">{product.category}</td>
                                <td className="px-6 py-4 text-gray-600">{product.weight}</td>
                                <td className="px-6 py-4 text-gray-600">{product.wastage || '-'}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link to={`/product/${product._id}`} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                                            <Eye size={18} />
                                        </Link>
                                        <Link to={`/admin/products/edit/${product._id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                            <Edit size={18} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(product._id)}
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

                {filteredProducts.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;
