import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, User, LogOut, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const VendorLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname.includes(path);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
        { name: 'Place Order', path: '/vendor/place-order', icon: PlusCircle },
        { name: 'My Orders', path: '/vendor/orders', icon: ShoppingBag },
        { name: 'Profile', path: '/vendor/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-serif font-bold text-primary-900">MAJISA VENDOR</h1>
                    <p className="text-xs text-gray-500 mt-1">ID: VND024</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                    ? 'bg-primary-50 text-primary-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:text-red-600 w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default VendorLayout;
