import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { User, Lock, ArrowRight, Loader, Hexagon, Gem } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Check for role query param
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');

    const [role, setRole] = useState(roleParam || 'admin');
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Update role state if param changes
    useEffect(() => {
        if (roleParam) setRole(roleParam);
    }, [roleParam]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(role, formData.username, formData.password);
            if (role === 'admin') navigate('/admin/dashboard');
            else if (role === 'vendor') navigate('/vendor/dashboard');
            else if (role === 'goldsmith') navigate('/goldsmith/dashboard');
            else navigate('/');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const roleConfig = {
        customer: {
            title: "Welcome Back",
            subtitle: "Discover the finest craftsmanship.",
            accent: "text-primary-600",
            bg: "bg-cream-50",
            button: "bg-primary-600 hover:bg-primary-700",
            icon: Gem
        },
        goldsmith: {
            title: "The Atelier",
            subtitle: "Crafting legacy, one piece at a time.",
            accent: "text-gold-500",
            bg: "bg-charcoal-600",
            button: "bg-gold-500 hover:bg-gold-600 text-charcoal-900",
            icon: Hexagon
        },
        vendor: {
            title: "Partner Portal",
            subtitle: "Connect with excellence.",
            accent: "text-charcoal-500",
            bg: "bg-white",
            button: "bg-charcoal-600 hover:bg-charcoal-700",
            icon: User
        },
        admin: {
            title: "Command Center",
            subtitle: "Orchestrate the vision.",
            accent: "text-primary-800",
            bg: "bg-gray-50",
            button: "bg-charcoal-900 hover:bg-black",
            icon: Lock
        }
    };

    const currentConfig = roleConfig[role] || roleConfig.customer;
    const isDark = role === 'goldsmith';

    return (
        <div className={`min-h-screen flex transition-colors duration-700 ${isDark ? 'bg-charcoal-600' : 'bg-cream-50'}`}>
            {/* Left Panel - Visual & Narrative */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 z-0"
                >
                    {/* Abstract Background Elements */}
                    <div className={`absolute top-0 left-0 w-full h-full ${isDark ? 'opacity-20' : 'opacity-10'}`}>
                        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-primary-200 to-transparent blur-3xl" />
                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tl from-gold-200 to-transparent blur-3xl" />
                    </div>
                </motion.div>

                <div className="relative z-10 max-w-lg text-center">
                    <motion.div
                        key={role}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                        <div className={`mb-8 inline-flex p-4 rounded-full ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white/50 border border-white/60'} backdrop-blur-sm`}>
                            <currentConfig.icon size={32} className={currentConfig.accent} />
                        </div>
                        <h1 className={`text-5xl md:text-6xl font-serif font-bold mb-6 ${isDark ? 'text-white' : 'text-charcoal-600'}`}>
                            MAJISA
                        </h1>
                        <p className={`text-xl font-light tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {currentConfig.subtitle}
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Panel - Interaction */}
            <div className={`w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 relative ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="max-w-md w-full mx-auto">
                    {/* Back to Home - Absolute on Mobile, Relative on Desktop */}
                    <div className="mb-8 pt-6 lg:pt-0">
                        <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowRight className="rotate-180" size={16} />
                            Back to Home
                        </Link>
                    </div>

                    {/* Role Navigation */}
                    {!roleParam && (
                        <div className="flex gap-6 mb-12 overflow-x-auto pb-2 scrollbar-hide">
                            {['admin', 'goldsmith'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setRole(r)}
                                    className={`text-xs font-bold uppercase tracking-widest transition-all duration-300 ${role === r
                                        ? `${isDark ? 'text-gold-400 border-b-2 border-gold-400' : 'text-primary-600 border-b-2 border-primary-600'} pb-1`
                                        : `${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    )}

                    <motion.div
                        key={role + "form"}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className={`text-2xl md:text-3xl font-serif font-bold mb-2 ${isDark ? 'text-white' : 'text-charcoal-600'}`}>
                            {currentConfig.title}
                        </h2>
                        <p className={`mb-8 md:mb-10 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Please enter your details to continue.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <div className="group">
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400 group-focus-within:text-gold-400' : 'text-gray-500 group-focus-within:text-primary-600'} transition-colors`}>
                                        {role === 'customer' ? 'Email or Phone' : 'Username / ID'}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="username"
                                            required
                                            value={formData.username}
                                            onChange={handleChange}
                                            className={`block w-full bg-transparent border-b ${isDark ? 'border-gray-600 text-white focus:border-gold-400 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0D0D0D_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] caret-gold-400' : 'border-gray-300 text-gray-900 focus:border-primary-600 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#FFFCF9_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#000000]'} py-3 focus:outline-none transition-colors placeholder-transparent`}
                                            placeholder="Username"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className={`block text-xs font-medium uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400 group-focus-within:text-gold-400' : 'text-gray-500 group-focus-within:text-primary-600'} transition-colors`}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="password"
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            className={`block w-full bg-transparent border-b ${isDark ? 'border-gray-600 text-white focus:border-gold-400 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#0D0D0D_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff] caret-gold-400' : 'border-gray-300 text-gray-900 focus:border-primary-600 [&:-webkit-autofill]:shadow-[0_0_0_1000px_#FFFCF9_inset] [&:-webkit-autofill]:[-webkit-text-fill-color:#000000]'} py-3 focus:outline-none transition-colors placeholder-transparent`}
                                            placeholder="Password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className={`rounded w-4 h-4 border-gray-300 ${isDark ? 'accent-gold-500 bg-white/10' : 'accent-primary-600'} focus:ring-0`}
                                        style={{ colorScheme: isDark ? 'dark' : 'light' }}
                                    />
                                    <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Remember me</span>
                                </label>
                                <Link to="/forgotpassword" className={`font-medium ${isDark ? 'text-gold-400 hover:text-gold-300' : 'text-primary-600 hover:text-primary-500'}`}>
                                    Forgot password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-4 px-6 rounded-lg shadow-lg text-sm font-bold uppercase tracking-widest transition-all transform hover:-translate-y-0.5 ${currentConfig.button} disabled:opacity-70 disabled:cursor-not-allowed`}
                            >
                                {isLoading ? <Loader className="animate-spin h-5 w-5" /> : (
                                    <span className="flex items-center gap-2">
                                        Sign In <ArrowRight size={16} />
                                    </span>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Login;
