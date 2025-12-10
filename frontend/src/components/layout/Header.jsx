import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === '/';

    const { cartCount } = useCart();
    const { user, logout } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Header style based on scroll and page
    const headerClass = `fixed w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md text-charcoal-500 shadow-sm py-4'
        : `bg-transparent py-6 ${isHome ? 'text-white' : 'text-transparent opacity-0 pointer-events-none'}`
        }`;

    return (
        <header className={headerClass}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between">

                    {/* Left: Mobile Menu & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <button className="hidden lg:flex items-center gap-2 hover:text-gold-500 transition-colors">
                            <Search size={20} />
                            <span className="text-xs uppercase tracking-widest font-medium">Search</span>
                        </button>
                    </div>

                    {/* Center: Logo */}
                    <div className="flex-1 text-center">
                        <Link to="/" className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
                            MAJISA
                        </Link>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-6 flex-1">
                        {/* Vendor Login Icon */}
                        <Link to="/login?role=vendor" className="hidden lg:block hover:text-gold-500 transition-colors" title="Vendor Login">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 512 512">
                                <path d="M35.42 188.21l207.75 269.46a16.17 16.17 0 0025.66 0l207.75-269.46a16.52 16.52 0 00.95-18.75L407.06 55.71A16.22 16.22 0 00393.27 48H118.73a16.22 16.22 0 00-13.79 7.71L34.47 169.46a16.52 16.52 0 00.95 18.75zM48 176h416" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M400 64l-48 112-96-128M112 64l48 112 96-128M256 448l-96-272M256 448l96-272" />
                            </svg>
                        </Link>

                        {user ? (
                            <button onClick={logout} className="hidden lg:block hover:text-gold-500 transition-colors text-xs uppercase font-bold">
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="hidden lg:block hover:text-gold-500 transition-colors">
                                <User size={22} />
                            </Link>
                        )}
                        {user?.role === 'vendor' && (
                            <Link to="/cart" className="relative hover:text-gold-500 transition-colors">
                                <ShoppingBag size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-gold-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className={`hidden lg:flex justify-center mt-4 space-x-8 text-xs font-medium uppercase tracking-widest ${isScrolled ? 'text-charcoal-400' : 'text-white/90'}`}>
                    <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
                    <Link to="/products" className="hover:text-gold-500 transition-colors">Jewellery</Link>
                    <Link to="/products?category=rings" className="hover:text-gold-500 transition-colors">Rings</Link>
                    <Link to="/products?category=necklaces" className="hover:text-gold-500 transition-colors">Necklaces</Link>
                    <Link to="/about" className="hover:text-gold-500 transition-colors">Our Story</Link>
                    <Link to="/contact" className="hover:text-gold-500 transition-colors">Contact</Link>
                    {(user?.role === 'admin' || user?.role === 'vendor') && (
                        <Link to={user.role === 'admin' ? "/admin/dashboard" : "/vendor/dashboard"} className="hover:text-gold-500 transition-colors font-bold">Dashboard</Link>
                    )}
                </nav>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 bg-white z-50 lg:hidden flex flex-col pt-20 px-6 text-charcoal-500">
                    <button
                        className="absolute top-6 right-6"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <X size={24} />
                    </button>
                    <nav className="flex flex-col space-y-6 text-lg font-serif">
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/products" onClick={() => setIsMenuOpen(false)}>All Jewellery</Link>
                        <Link to="/products?category=rings" onClick={() => setIsMenuOpen(false)}>Rings</Link>
                        <Link to="/products?category=necklaces" onClick={() => setIsMenuOpen(false)}>Necklaces</Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link>
                        <Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                        {(user?.role === 'admin' || user?.role === 'vendor') && (
                            <Link to={user.role === 'admin' ? "/admin/dashboard" : "/vendor/dashboard"} onClick={() => setIsMenuOpen(false)} className="font-bold hover:text-gold-500 transition-colors">
                                {user.role === 'admin' ? 'Admin Dashboard' : 'Vendor Dashboard'}
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
