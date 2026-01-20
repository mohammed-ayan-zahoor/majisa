import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, BookOpen, LogOut, Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CustomCursor from '../common/CustomCursor';
import SEO from '../common/SEO';

const navItems = [
    { name: 'Dashboard', path: '/admin/accounts', icon: LayoutDashboard },
    { name: 'Masters', path: '/admin/accounts/masters', icon: Users },
    { name: 'Vouchers', path: '/admin/accounts/vouchers', icon: FileText },
    { name: 'Ledger', path: '/admin/accounts/ledger', icon: BookOpen },
    { name: 'Stock Report', path: '/admin/accounts/stock', icon: Package },
];

const AccountsLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Exact match for dashboard, includes check for others
    const isActive = (path) => {
        if (path === '/admin/accounts') {
            return location.pathname === '/admin/accounts';
        }
        return location.pathname.startsWith(path);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans text-gray-900">
            <SEO title="Accounts Module" description="Majisa Accounts Management" />
            <CustomCursor variant="vector" />

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 w-full bg-gray-900 text-white z-[60] px-4 py-3 flex items-center justify-between shadow-md">
                <span className="font-serif font-bold text-lg tracking-wide">ACCOUNTS</span>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-1 focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    {isSidebarOpen ? <LogOut className="rotate-180" size={24} /> : (
                        <div className="space-y-1.5 w-6">
                            <span className="block h-0.5 bg-white w-full"></span>
                            <span className="block h-0.5 bg-white w-full"></span>
                            <span className="block h-0.5 bg-white w-full"></span>
                        </div>
                    )}
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
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center gap-3 mb-4">
                        <ArrowLeft
                            className="cursor-pointer hover:text-primary-400 transition-colors"
                            size={20}
                            onClick={() => navigate('/admin/dashboard')}
                            title="Back to Admin Dashboard"
                        />
                        <h1 className="text-xl font-serif font-bold tracking-wide">ACCOUNTS</h1>
                    </div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Management Console</div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-14 lg:mt-0">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${isActive(item.path)
                                ? 'bg-primary-600 text-white shadow-lg'
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
                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white w-full transition-colors rounded-lg hover:bg-gray-800"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 lg:p-8 mt-14 lg:mt-0 print:ml-0 print:p-0 w-full overflow-x-hidden bg-gray-100">
                <Outlet />
            </main>
        </div>
    );
};

export default AccountsLayout;
