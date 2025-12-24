import { LayoutDashboard, Hammer, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CustomCursor from '../common/CustomCursor';
import SEO from '../common/SEO';

const navItems = [
    { name: 'Dashboard', path: '/goldsmith/dashboard', icon: LayoutDashboard },
    { name: 'My Jobs', path: '/goldsmith/jobs', icon: Hammer },
];

const GoldsmithLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-primary-900 lg:bg-transparent">
                <div className="text-white lg:text-primary-900">
                    <h1 className="text-xl font-serif font-bold">MAJISA GOLDSMITH</h1>
                    <p className="text-xs text-primary-200 lg:text-gray-500 mt-1">Ramesh Soni (GLD001)</p>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-white">
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsSidebarOpen(false)}
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
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <SEO title="Goldsmith Atelier" description="Majisa Goldsmith Workshop" />
            <CustomCursor variant="vector" />
            {/* Mobile Header */}
            <div className="lg:hidden bg-primary-900 text-white p-4 fixed top-0 w-full z-40 flex justify-between items-center shadow-md">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    aria-label="Open Menu"
                    aria-expanded={isSidebarOpen}
                >
                    <Menu size={24} />
                </button>
                <span className="font-serif font-bold text-lg">MAJISA GOLDSMITH</span>
                <div className="w-6"></div> {/* Spacer for centering */}
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className={`transition-all duration-300 min-h-screen pt-20 lg:pt-8 p-4 lg:p-8 lg:ml-64`}>
                <Outlet />
            </main>
        </div>
    );
};

export default GoldsmithLayout;
