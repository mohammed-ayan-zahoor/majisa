import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import SEO from '../components/common/SEO';
import { getOptimizedImage } from '../utils/urlUtils';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';

const Home = () => {
    // 1. Fetch Categories using shared hook (cached)
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();

    // 2. Fetch Featured Products using shared hook (cached)
    const { data: featuredData, isLoading: featuredLoading } = useProducts({
        newArrival: true,
        limit: 8,
        discovery: true
    });

    const featuredProducts = featuredData?.products || [];

    return (
        <div className="bg-cream-100 min-h-screen">
            <SEO
                title="Majisa Jewellers KGF | Home"
                description="Welcome to Majisa Jewellers, KGF (Kolar Gold Fields). Discover our timeless collection of handcrafted gold, diamond, and antique jewelry. Tradition meets elegance since 1995."
            />
            {/* Hero Section - Full Height & Cinematic */}
            <section className="relative h-[85vh] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&q=80&w=1920"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" /> {/* Subtle overlay */}
                </div>

                <div className="relative h-full flex flex-col justify-center items-center text-center text-white px-4 mt-10">
                    <span className="text-sm md:text-base tracking-[0.2em] uppercase mb-4 opacity-90">Est. 1995</span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium mb-8 tracking-tight leading-tight">
                        Majisa <br /> Jewellers
                    </h1>
                    <p className="text-lg md:text-xl text-cream-100 mb-10 max-w-xl font-light leading-relaxed">
                        Where tradition meets timeless elegance. Discover our exclusive collection of handcrafted gold jewellery.
                    </p>
                    <Link
                        to="/products"
                        className="group flex items-center gap-3 bg-white text-charcoal-500 px-8 py-4 rounded-none hover:bg-cream-50 transition-all duration-300"
                    >
                        <span className="uppercase tracking-widest text-sm font-medium">Explore Collection</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </section>

            {/* Categories - Instagram Stories Style */}
            <section className="container mx-auto px-4 py-12 relative group">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-serif text-charcoal-500 mb-2">Shop by Category</h2>
                    <div className="w-16 h-0.5 bg-gold-400 mx-auto" />
                </div>

                <div className="relative max-w-6xl mx-auto">
                    {/* Mobile View: Instagram Stories Style */}
                    <div className="md:hidden relative">
                        {/* Left Fade & Button */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-cream-100 to-transparent z-10 pointer-events-none" />

                        {/* Scrollable Container */}
                        <div
                            className="flex justify-start gap-6 overflow-x-auto pb-4 scrollbar-hide px-6 snap-x"
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {categoriesLoading ? (
                                <div className="flex gap-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
                                            <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                categories.map((cat) => (
                                    <Link key={cat._id} to={`/products?category=${cat.name}`} className="group/item flex flex-col items-center flex-shrink-0 snap-center">
                                        <div className="relative w-20 h-20 rounded-full p-0.5 bg-gradient-to-tr from-gold-300 to-gold-600 group-hover/item:from-primary-400 group-hover/item:to-primary-600 transition-all duration-300">
                                            <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden bg-gray-100 flex items-center justify-center">
                                                {cat.image ? (
                                                    <img
                                                        src={getOptimizedImage(cat.image, 200)}
                                                        alt={cat.name}
                                                        loading="lazy"
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400 font-medium">{cat.name.charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="mt-2 text-xs font-medium text-charcoal-500 uppercase tracking-wide group-hover/item:text-primary-600 transition-colors">
                                            {cat.name}
                                        </span>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Right Fade */}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-cream-100 to-transparent z-10 pointer-events-none" />
                    </div>

                    {/* Desktop View: Elegant Grid Cards */}
                    <div className="hidden md:grid grid-cols-4 lg:grid-cols-5 gap-8">
                        {categoriesLoading ? (
                            [...Array(5)].map((_, i) => (
                                <div key={i} className="aspect-[4/5] bg-gray-200 rounded-2xl animate-pulse" />
                            ))
                        ) : (
                            categories.map((cat) => (
                                <Link key={cat._id} to={`/products?category=${cat.name}`} className="group block" style={{ willChange: 'transform' }}>
                                    <div className="relative overflow-hidden rounded-2xl aspect-[4/5] mb-4 shadow-md group-hover:shadow-xl transition-all duration-500 transform group-hover:-translate-y-2 bg-gray-100">
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                        {cat.image ? (
                                            <img
                                                src={getOptimizedImage(cat.image, 600)}
                                                alt={cat.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <span className="text-4xl font-serif">{cat.name.charAt(0)}</span>
                                            </div>
                                        )}
                                        {/* Unique Design Element: Border appearing on hover */}
                                        <div className="absolute inset-4 border border-white/0 group-hover:border-white/80 scale-95 group-hover:scale-100 transition-all duration-500 z-20 rounded-xl" />
                                    </div>
                                    <h3 className="text-center font-serif text-lg font-medium text-charcoal-600 uppercase tracking-widest group-hover:text-primary-700 transition-colors">
                                        {cat.name}
                                    </h3>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Products - Clean & Spacious */}
            <section className="bg-white py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <span className="text-gold-600 uppercase tracking-widest text-xs font-bold mb-2 block">New Arrivals</span>
                            <h2 className="text-3xl md:text-4xl font-serif text-charcoal-500">Featured Collection</h2>
                        </div>
                        <Link to="/products" className="group flex items-center gap-2 text-charcoal-400 hover:text-primary-600 transition-colors pb-1 border-b border-transparent hover:border-primary-600">
                            <span className="uppercase tracking-wide text-sm">View All Products</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        {featuredLoading ? (
                            <div className="col-span-full text-center py-12">Loading collection...</div>
                        ) : featuredProducts.length > 0 ? (
                            featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-500">Collection coming soon.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Trust/About Section - Minimalist */}
            <section className="container mx-auto px-4 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <div className="px-4 pt-8 md:pt-0">
                        <ShieldCheck size={32} className="text-gold-600 mx-auto mb-6" strokeWidth={1.5} />
                        <h3 className="text-lg font-serif font-bold text-charcoal-500 mb-3">100% Certified</h3>
                        <p className="text-charcoal-100 text-sm leading-relaxed max-w-xs mx-auto">
                            Every piece comes with a certificate of authenticity and hallmark guarantee.
                        </p>
                    </div>
                    <div className="px-4 pt-8 md:pt-0">
                        <RefreshCw size={32} className="text-gold-600 mx-auto mb-6" strokeWidth={1.5} />
                        <h3 className="text-lg font-serif font-bold text-charcoal-500 mb-3">Lifetime Exchange</h3>
                        <p className="text-charcoal-100 text-sm leading-relaxed max-w-xs mx-auto">
                            We offer transparent exchange policies to give you the best value for your investment.
                        </p>
                    </div>
                    <div className="px-4 pt-8 md:pt-0">
                        <Truck size={32} className="text-gold-600 mx-auto mb-6" strokeWidth={1.5} />
                        <h3 className="text-lg font-serif font-bold text-charcoal-500 mb-3">Secure Shipping</h3>
                        <p className="text-charcoal-100 text-sm leading-relaxed max-w-xs mx-auto">
                            Fully insured and secure shipping partners to ensure your jewellery reaches you safely.
                        </p>
                    </div>
                </div>
            </section>



        </div>
    );
};

export default Home;
