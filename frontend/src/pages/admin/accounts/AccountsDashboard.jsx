import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Direct use for now, or use api service
import { Users, FileText, Package, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-xs font-medium text-gray-500">{title}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{value}</h3>
            </div>
            <div className={`p-2 rounded-lg ${color} shadow-sm`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
    </div>
);

const AccountsDashboard = () => {
    const [stats, setStats] = useState({
        groups: 0,
        items: 0,
        parties: 0,
        vouchers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Determine base URL dynamically or import from config
                // Assuming api service is configured with base URL
                const [groupsRes, itemsRes, partiesRes, vouchersRes] = await Promise.all([
                    api.get('/accounts/groups'),
                    api.get('/accounts/items'),
                    api.get('/accounts/parties'),
                    api.get('/accounts/vouchers')
                ]);

                setStats({
                    groups: groupsRes.data.length,
                    items: itemsRes.data.length,
                    parties: partiesRes.data.length,
                    vouchers: vouchersRes.data.length
                });
            } catch (error) {
                console.error("Error fetching account stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Accounts Data...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Accounts Overview</h1>
                    <p className="text-xs text-gray-500">Manage your financial and metal accounting here.</p>
                </div>
                <Link to="/admin/accounts/vouchers" className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm flex items-center gap-2">
                    <FileText size={16} />
                    New Voucher
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Account Groups"
                    value={stats.groups}
                    icon={Package}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Account Items"
                    value={stats.items}
                    icon={Package}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Parties"
                    value={stats.parties}
                    icon={Users}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Vouchers"
                    value={stats.vouchers}
                    icon={FileText}
                    color="bg-blue-500"
                />
            </div>

            {/* Quick Actions / Recent Activity could go here */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="text-center py-8 text-gray-400 text-sm">
                    Transaction list will appear here
                </div>
            </div>
        </div>
    );
};

export default AccountsDashboard;
