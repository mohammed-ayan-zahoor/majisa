import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import api from '../services/api';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(500000);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const categories = ['All', 'Necklaces', 'Rings', 'Earrings', 'Bangles', 'Anklets'];

    const filteredProducts = products.filter(product => {
        const matchesCategory = filterCategory === 'All' || product.category === filterCategory;
        const matchesPrice = product.price <= priceRange;
        return matchesCategory && matchesPrice;
    });

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <div className="bg-primary-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-serif font-bold mb-4">Our Collection</h1>
                    <p className="text-primary-100">Discover our exquisite range of handcrafted jewellery</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 flex-shrink-0 space-y-8">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 sticky top-24">
                        <div className="flex items-center gap-2 mb-6">
                            <Filter size={20} className="text-primary-600" />
                            <h3 className="font-bold text-gray-900">Filters</h3>
                        </div>

                        {/* Categories */}
                        <div className="mb-8">
                            <h4 className="font-medium text-gray-900 mb-4">Categories</h4>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={filterCategory === category}
                                            onChange={() => setFilterCategory(category)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                        />
                                        <span className={`text-sm group-hover:text-primary-600 transition-colors ${filterCategory === category ? 'text-primary-700 font-medium' : 'text-gray-600'
                                            }`}>
                                            {category}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-4">Price Range</h4>
                            <input
                                type="range"
                                min="0"
                                max="500000"
                                step="1000"
                                value={priceRange}
                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>₹0</span>
                                <span>₹{priceRange.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    {/* Search Bar */}
                    <div className="mb-8 relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for jewellery..."
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        />
                    </div>

                    {loading ? (
                        <div className="text-center py-12">Loading products...</div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">No products found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;
