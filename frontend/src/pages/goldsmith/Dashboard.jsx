import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer, Clock, CheckCircle } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const GoldsmithDashboard = () => {
    const { user } = useAuth();
    const { orders, loading } = useOrder();

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    // Orders are already filtered by the backend for the logged-in goldsmith
    const jobs = orders;
    const activeJobs = jobs.filter(j => j.status === 'In Process' || j.status === 'Accepted');
    const completedJobs = jobs.filter(j => j.status === 'Completed');

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Goldsmith Dashboard</h1>
                <p className="text-gray-500">Welcome back, {user?.name || 'Goldsmith'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Active Jobs"
                    value={activeJobs.length}
                    icon={Hammer}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Pending Acceptance"
                    value={jobs.filter(j => j.status === 'Pending').length}
                    icon={Clock}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Completed This Month"
                    value={completedJobs.length}
                    icon={CheckCircle}
                    color="bg-green-500"
                />
            </div>

            {/* Active Jobs List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Assigned Jobs</h3>
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Job ID</th>
                            <th className="px-6 py-4">Product</th>
                            <th className="px-6 py-4">Assigned Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {jobs.map((job) => (
                            <tr key={job._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-primary-600">#{job._id.substring(0, 8)}...</td>
                                <td className="px-6 py-4">{job.orderItems?.[0]?.name || 'Custom Order'}</td>
                                <td className="px-6 py-4 text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {job.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        to={`/goldsmith/jobs/${job._id}`}
                                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {jobs.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No jobs assigned yet.</div>
                )}
            </div>
        </div>
    );
};

export default GoldsmithDashboard;
