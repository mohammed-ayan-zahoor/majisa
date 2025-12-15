import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';

const MyJobs = () => {
    const { orders, loading } = useOrder(); // orders are already filtered for goldsmith
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const filteredJobs = orders.filter(job => {
        const matchesSearch = job._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.orderItems?.[0]?.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'All' || job.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
                <p className="text-gray-500">Manage your assigned tasks</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search jobs by ID or Product..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                    {['All', 'Pending', 'In Process', 'Completed'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filterStatus === status
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Jobs Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Job ID</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Assigned Date</th>
                                <th className="px-6 py-4">Due Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredJobs.map((job) => (
                                <tr key={job._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-primary-600">#{job._id.substring(0, 8)}...</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {job.orderItems?.[0]?.image && (
                                                <img
                                                    src={job.orderItems[0].image}
                                                    alt={job.orderItems[0].name}
                                                    className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                                                />
                                            )}
                                            <span>{job.orderItems?.[0]?.name || 'Custom Order'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{new Date(job.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {/* Assuming due date isn't in model yet, but placeholder or derived */}
                                        --
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                job.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-blue-100 text-blue-700'
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
                </div>
                {filteredJobs.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No jobs found matching your criteria.</div>
                )}
            </div>
        </div>
    );
};

export default MyJobs;
