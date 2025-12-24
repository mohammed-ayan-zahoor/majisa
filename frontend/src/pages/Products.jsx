import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Loader } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import api from '../services/api';
import SEO from '../components/common/SEO';
import { getOptimizedImage } from '../utils/urlUtils';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    const observer = useRef();
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);
    const lastProductElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await api.get('/categories');
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Products
    useEffect(() => {
        const controller = new AbortController();

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/products', {
                    params: {
                        page,
                        limit: 12,
                        category: activeCategory !== 'All' ? activeCategory : undefined,
                        keyword: searchTerm
                    },
                    signal: controller.signal
                });

                setProducts(prev => page === 1 ? data.products : [...prev, ...data.products]);
                setHasMore(data.page < data.pages);
            } catch (error) {
                if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
                    console.error('Error fetching products:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300); // 300ms debounce for search

        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [page, activeCategory, searchTerm]);

    // Reset when Filters Change
    useEffect(() => {
        setProducts([]);
        setPage(1);
        setHasMore(true);
    }, [activeCategory, searchTerm]);

    const handleCategoryClick = (catName) => {
        if (hasDragged) return; // Don't trigger click if we were dragging
        setActiveCategory(catName);
        setSearchParams({ category: catName });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Drag to Scroll Handlers
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setHasDragged(false);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed
        if (Math.abs(walk) > 5) {
            setHasDragged(true);
        }
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            <SEO
                title={activeCategory !== 'All' ? `${activeCategory} Collection` : "Our Collection"}
                description="Browse our extensive collection of gold and diamond jewelry."
            />
            {/* Header */}
            <div className="bg-primary-900 text-white py-12 pt-24 mb-0">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl font-serif font-bold mb-3">Our Collection</h1>
                    <p className="text-primary-100 max-w-2xl mx-auto">Discover our exquisite range of handcrafted jewellery, designed to celebrate every special moment.</p>
                </div>
            </div>

            {/* Sticky Categories & Search Bar */}
            <div className="sticky top-[72px] lg:top-[88px] z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-4 transition-all duration-300">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 justify-between">

                        {/* Categories List */}
                        <div
                            ref={scrollRef}
                            onMouseDown={handleMouseDown}
                            onMouseLeave={handleMouseLeave}
                            onMouseUp={handleMouseUp}
                            onMouseMove={handleMouseMove}
                            className={`flex items-center gap-6 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 scrollbar-hide snap-x px-2 cursor-grab active:cursor-grabbing select-none`}
                        >
                            <button
                                onClick={() => handleCategoryClick('All')}
                                className={`flex flex-col items-center gap-3 flex-shrink-0 snap-center group min-w-[80px] ${activeCategory === 'All' ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                            >
                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-2 transition-all ${activeCategory === 'All' ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 bg-gray-50 text-gray-400 group-hover:border-primary-300'}`}>
                                    <span className="text-sm md:text-base font-bold">ALL</span>
                                </div>
                                <span className={`text-xs uppercase tracking-wider font-semibold ${activeCategory === 'All' ? 'text-primary-700' : 'text-gray-500'}`}>All</span>
                            </button>

                            {!categoriesLoading && categories.map((cat) => (
                                <button
                                    key={cat._id}
                                    onClick={() => handleCategoryClick(cat.name)}
                                    className={`flex flex-col items-center gap-3 flex-shrink-0 snap-center group min-w-[80px] ${activeCategory === cat.name ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full p-1 border-2 transition-all ${activeCategory === cat.name ? 'border-primary-600' : 'border-transparent group-hover:border-primary-300'}`}>
                                        <img
                                            src={getOptimizedImage(cat.image, 160)}
                                            alt={cat.name}
                                            loading="lazy"
                                            className="w-full h-full rounded-full object-cover bg-gray-100"
                                        />
                                    </div>
                                    <span className={`text-xs uppercase tracking-wider font-semibold ${activeCategory === cat.name ? 'text-primary-700' : 'text-gray-500'}`}>{cat.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full md:w-64 flex-shrink-0">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-primary-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-8">
                    {products.map((product, index) => {
                        if (products.length === index + 1) {
                            return (
                                <div ref={lastProductElementRef} key={product._id}>
                                    <ProductCard product={product} />
                                </div>
                            );
                        } else {
                            return <ProductCard key={product._id} product={product} />;
                        }
                    })}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader className="animate-spin text-primary-600" size={32} />
                    </div>
                )}

                {/* No Results */}
                {!loading && products.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-lg mx-4">
                        <p className="text-gray-500 font-medium">No products found matching your criteria.</p>
                        <button
                            onClick={() => { setActiveCategory('All'); setSearchTerm(''); }}
                            className="mt-4 text-primary-600 underline text-sm hover:text-primary-700"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* End of results */}
                {!hasMore && products.length > 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs uppercase tracking-widest">
                        End of Collection
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
