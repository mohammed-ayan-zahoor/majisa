import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';
import { useQueryClient } from '@tanstack/react-query';
import { useProducts, fetchProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';

// 🔥 Optimized Row Component to prevent re-renders when only search/filters change
const ProductRow = React.memo(({ product, onDelete }) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                        <img
                            src={product.images?.[0] || product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 text-sm truncate">{product.name}</span>
                            {product.isFeatured && <span className="text-amber-500 text-xs" title="Featured">⭐</span>}
                        </div>
                        {product.isNewArrival && (
                            <span className="text-[9px] text-primary-600 font-bold uppercase tracking-tighter">New Arrival</span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 font-mono text-xs text-primary-600 font-bold">{product.productCode}</td>
            <td className="px-4 py-3">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">
                    {product.category}
                </span>
            </td>
            <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                <div className="flex flex-col gap-0.5">
                    <span>W: <span className="text-gray-900">{Array.isArray(product.weight) ? product.weight.join(', ') : product.weight}</span></span>
                    <span>P: <span className="text-gray-900">{Array.isArray(product.purity) ? product.purity.join(', ') : product.purity}</span></span>
                </div>
            </td>
            <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-1">
                    <Link
                        to={`/admin/products/edit/${product._id}`}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product"
                    >
                        <Edit size={16} />
                    </Link>
                    <button
                        onClick={() => onDelete(product._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    );
});

// 🔥 Optimized Search Input to keep local state and prevent parent re-renders on every keystroke
const SearchInput = ({ initialValue, onSearchChange }) => {
    const [localValue, setLocalValue] = useState(initialValue);

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localValue);
        }, 400);
        return () => clearTimeout(timer);
    }, [localValue, onSearchChange]);

    return (
        <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                placeholder="Search products by name or code..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-100 transition-all font-medium"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
            />
        </div>
    );
};

const AdminProducts = () => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const PAGE_LIMIT = 20;

    // Use React Query with pagination params
    const { data: productData, isLoading: productsLoading, isPlaceholderData } = useProducts({
        page,
        limit: PAGE_LIMIT,
        keyword: debouncedSearch,
        category: selectedCategory || undefined
    });

    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    // Reset pagination when search or category changes
    const handleSearchChange = useCallback((val) => {
        setDebouncedSearch(val);
        setPage(1);
    }, []);

    const handleCategoryChange = (val) => {
        setSelectedCategory(val);
        setPage(1);
    };

    // ✨ Ghost Fetch: Prefetch Next Page
    useEffect(() => {
        if (productData?.page < productData?.pages) {
            const nextPage = page + 1;
            queryClient.prefetchQuery({
                queryKey: ['products', { page: nextPage, limit: PAGE_LIMIT, keyword: debouncedSearch, category: selectedCategory || undefined }],
                queryFn: () => fetchProducts({ page: nextPage, limit: PAGE_LIMIT, keyword: debouncedSearch, category: selectedCategory || undefined }),
            });
        }
    }, [productData, page, queryClient, debouncedSearch, selectedCategory]);

    const products = productData?.products || [];
    const loading = productsLoading || categoriesLoading;

    const handleDelete = (id) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <div className="text-sm font-medium text-gray-900">
                    Are you sure you want to delete this product?
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
                            const loadingToast = toast.loading('Deleting product...');
                            try {
                                await api.delete(`/products/${id}`);
                                queryClient.invalidateQueries(['products']);
                                toast.success('Product deleted successfully', { id: loadingToast });
                            } catch (error) {
                                toast.error('Failed to delete product', { id: loadingToast });
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
            style: { minWidth: '300px', border: '1px solid #fee2e2', padding: '12px' }
        });
    };

    const ProductSkeleton = () => (
        <tr className="animate-pulse">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg bg-gray-100" />
                    <div className="space-y-1">
                        <div className="h-4 w-32 bg-gray-100 rounded" />
                        <div className="h-3 w-16 bg-gray-50 rounded" />
                    </div>
                </div>
            </td>
            <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-100 rounded" /></td>
            <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-100 rounded-full" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-100 rounded" /></td>
            <td className="px-4 py-3"><div className="flex justify-end gap-2"><div className="h-8 w-8 bg-gray-50 rounded" /></div></td>
        </tr>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <SEO title="Manage Products" description="Admin Product Management" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Inventory Management</h1>
                    <p className="text-sm text-gray-500">Track and manage your jewellery collection</p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="bg-primary-600 text-white px-4 py-2 text-sm font-bold rounded-lg hover:bg-primary-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 uppercase tracking-wide"
                >
                    <Plus size={18} />
                    <span>New Product</span>
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 mb-6">
                <SearchInput initialValue={debouncedSearch} onSearchChange={handleSearchChange} />

                <div className="w-full md:w-64">
                    <select
                        value={selectedCategory}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 bg-white font-medium cursor-pointer"
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Product Info</th>
                                <th className="px-4 py-3">Code</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">Specifications</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                [...Array(5)].map((_, i) => <ProductSkeleton key={i} />)
                            ) : (
                                products.map((product) => (
                                    <ProductRow
                                        key={product._id}
                                        product={product}
                                        onDelete={handleDelete}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && products.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="text-gray-300 mb-4 flex justify-center">
                            <Search size={48} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            {/* Enhanced Pagination */}
            {!loading && productData?.pages > 1 && (
                <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">{products.length}</span> of <span className="text-gray-900">{productData.total}</span> products
                        <span className="mx-3 text-gray-300">|</span>
                        Page <span className="text-gray-900">{page}</span> of <span className="text-gray-900">{productData.pages}</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isPlaceholderData}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all border ${page === 1 || isPlaceholderData
                                ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500 hover:text-primary-600 active:bg-gray-50 shadow-sm'
                                }`}
                        >
                            Previous
                        </button>

                        <div className="hidden sm:flex gap-1.5">
                            {[...Array(productData.pages)].map((_, i) => {
                                const p = i + 1;
                                if (productData.pages > 5 && Math.abs(p - page) > 1 && p !== 1 && p !== productData.pages) {
                                    if (Math.abs(p - page) === 2) return <span key={p} className="px-1 text-gray-300 flex items-center">...</span>;
                                    return null;
                                }
                                return (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-9 h-9 text-sm font-bold rounded-lg transition-all ${page === p
                                            ? 'bg-primary-600 text-white shadow-md ring-2 ring-primary-50'
                                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-transparent'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(productData.pages, p + 1))}
                            disabled={page === productData.pages || isPlaceholderData}
                            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all border ${page === productData.pages || isPlaceholderData
                                ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500 hover:text-primary-600 active:bg-gray-50 shadow-sm'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default AdminProducts;
