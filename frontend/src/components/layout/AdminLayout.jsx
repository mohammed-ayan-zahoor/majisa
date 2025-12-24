import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Hammer, ShoppingBag, Bell, Settings, LogOut, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomCursor from '../common/CustomCursor';
import SEO from '../common/SEO';

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

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const isActive = (path) => location.pathname.includes(path);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Prevent body scroll when mobile sidebar is open
    React.useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <SEO title="Admin Console" description="Majisa Admin Dashboard" />
            <CustomCursor variant="vector" />
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full bg-gray-900 text-white z-[60] px-4 py-3 flex items-center justify-between">
                <span className="font-serif font-bold">MAJISA ADMIN</span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label={isSidebarOpen ? 'Close Menu' : 'Open Menu'}
                    aria-expanded={isSidebarOpen}
                >
                    {isSidebarOpen ? <LogOut className="rotate-180" size={24} /> : <div className="space-y-1.5" aria-hidden="true">
                        <span className="block w-6 h-0.5 bg-white"></span>
                        <span className="block w-6 h-0.5 bg-white"></span>
                        <span className="block w-6 h-0.5 bg-white"></span>
                    </div>}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`w-64 bg-gray-900 text-white flex flex-col fixed h-full z-50 transition-transform duration-300 transform lg:translate-x-0 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 border-b border-gray-800 hidden lg:block">
                    <h1 className="text-xl font-serif font-bold">MAJISA ADMIN</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-14 lg:mt-0">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
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
            <main className="flex-1 lg:ml-64 p-4 lg:p-8 mt-14 lg:mt-0 print:ml-0 print:p-0 w-full overflow-x-hidden">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
