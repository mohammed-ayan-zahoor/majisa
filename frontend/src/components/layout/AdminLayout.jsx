import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Hammer, ShoppingBag, Bell, Settings, LogOut, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const isActive = (path) => location.pathname.includes(path);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Products', path: '/admin/products', icon: Package },
        { name: 'Categories', path: '/admin/categories', icon: Layers },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Vendors', path: '/admin/vendors', icon: Users },
        { name: 'Customer Visits', path: '/admin/visits', icon: Users },
        { name: 'Goldsmiths', path: '/admin/goldsmiths', icon: Hammer },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full print:hidden">
                <div className="p-6 border-b border-gray-800">
                    <h1 className="text-xl font-serif font-bold">MAJISA ADMIN</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-primary-600 text-white'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white w-full transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 print:ml-0 print:p-0">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
