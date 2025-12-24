import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import SEO from '../components/common/SEO';
import { getOptimizedImage } from '../utils/urlUtils';
import { useInfiniteProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialCategory = searchParams.get('category') || 'All';

    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [searchTerm, setSearchTerm] = useState('');

    const observer = useRef();
    const scrollRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [hasDragged, setHasDragged] = useState(false);

    // 1. Fetch Categories using shared hook (cached)
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    // 2. Fetch Products using infinite query hook (cached + infinite scroll)
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: productsLoading,
        isFetching
    } = useInfiniteProducts(activeCategory, searchTerm);

    const products = useMemo(() => {
        return data?.pages.flatMap(page => page.products) || [];
    }, [data]);

    const lastProductElementRef = useCallback(node => {
        if (productsLoading || isFetchingNextPage) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchNextPage();
            }
        });
        if (node) observer.current.observe(node);
    }, [productsLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

    const handleCategoryClick = (catName) => {
        if (hasDragged) return;
        setActiveCategory(catName);
        setSearchParams({ category: catName });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Drag to Scroll Handlers (kept exactly as is for UX)
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
        const walk = (x - startX) * 2;
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

                {/* Loading State & Skeleton Grid */}
                {productsLoading && products.length === 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse space-y-4">
                                <div className="aspect-[4/5] bg-gray-100 rounded-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer -translate-x-full" />
                                </div>
                                <div className="space-y-2 px-1">
                                    <div className="h-4 w-3/4 bg-gray-100 rounded" />
                                    <div className="h-3 w-1/2 bg-gray-50 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : isFetchingNextPage && (
                    <div className="flex justify-center py-12">
                        <div className="h-10 w-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                )}

                {/* Background Refresh Indicator */}
                {isFetching && !productsLoading && !isFetchingNextPage && (
                    <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur shadow-sm border border-gray-100 px-3 py-1.5 rounded-full z-50 flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Updating Collection...</span>
                    </div>
                )}

                {/* No Results */}
                {!productsLoading && products.length === 0 && (
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
                {!hasNextPage && products.length > 0 && (
                    <div className="text-center py-8 text-gray-400 text-xs uppercase tracking-widest">
                        End of Collection
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
