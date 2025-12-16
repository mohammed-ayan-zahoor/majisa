import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

const ReportPrompt = ({ t, onSubmit }) => {
    const [value, setValue] = useState('');
    return (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5`}>
            <div className="p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    Report Issue
                </h3>
                <p className="text-xs text-gray-500 mb-3">Please describe the problem with this job.</p>
                <textarea
                    className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-100 focus:border-red-400 outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Type details here..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="flex border-t border-gray-100 bg-gray-50/50 rounded-b-lg">
                <button
                    onClick={() => toast.dismiss(t.id)}
                    className="flex-1 p-3 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors border-r border-gray-100"
                >
                    Cancel
                </button>
                <button
                    onClick={() => {
                        if (!value.trim()) {
                            toast.error('Please enter a description');
                            return;
                        }
                        onSubmit(value);
                        toast.dismiss(t.id);
                    }}
                    className="flex-1 p-3 text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                >
                    Submit Report
                </button>
            </div>
        </div>
    );
};

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getOrderById, updateOrderStatus, reportIssue, loading } = useOrder();
    const [job, setJob] = useState(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            const foundJob = await getOrderById(id);
            if (foundJob) {
                setJob(foundJob);
            } else {
                toast.error('Job not found');
                navigate('/goldsmith/dashboard');
            }
            setFetching(false);
        };
        fetchJob();
    }, [id, getOrderById, navigate]);

    const handleCompleteJob = () => {
        toast.custom((t) => (
            <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 select-none`}>
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <CheckCircle className="h-10 w-10 text-green-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                                Complete Job?
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Are you sure you want to mark this job as completed?
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await updateOrderStatus(job._id, 'Completed');
                                setJob(prev => ({ ...prev, status: 'Completed' }));
                                toast.success('Job marked as completed');
                            } catch (error) {
                                // Error handled in context
                            }
                        }}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500 focus:outline-none"
                    >
                        Confirm
                    </button>
                </div>
                <div className="flex border-l border-gray-200">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    if (loading || fetching || !job) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <SEO
                title={`Job #${job._id.substring(0, 8)}`}
                description="Goldsmith Job Details"
            />
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/goldsmith/dashboard')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Job #{job._id.substring(0, 8)}...</h1>
                    <p className="text-gray-500">Assigned on {new Date(job.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="ml-auto">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${job.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {job.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Left: Job Specs */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="font-bold text-gray-900">Product Specifications</h3>
                        </div>
                        <div className="p-6">
                            {job.orderItems.map((item, idx) => (
                                <div key={idx} className="flex gap-6 mb-6 last:mb-0">
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        <img
                                            src={item.image || 'https://via.placeholder.com/150'}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-medium text-lg text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-500">Quantity: <span className="font-bold text-gray-900">{item.quantity}</span></p>

                                        <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <span className="block text-xs text-gray-500 uppercase">Metal</span>
                                                <span className="font-medium text-gray-900">Gold</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500 uppercase">Purity</span>
                                                <span className="font-medium text-gray-900">22k</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500 uppercase">Weight (approx)</span>
                                                <span className="font-medium text-gray-900">15.5g</span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-gray-500 uppercase">Size</span>
                                                <span className="font-medium text-gray-900">12</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Special Instructions</h3>
                        <p className="text-gray-600 bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm">
                            Please ensure the engraving "A&S" is added to the inner band. Use high polish finish.
                        </p>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-900 mb-6">Job Actions</h3>

                        {job.status !== 'Completed' ? (
                            <button
                                onClick={handleCompleteJob}
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={20} />
                                Mark as Completed
                            </button>
                        ) : (
                            <div className="text-center p-4 bg-green-50 rounded-lg text-green-700 font-medium flex flex-col items-center gap-2">
                                <CheckCircle size={32} />
                                Job Completed
                            </div>
                        )}

                        <button
                            onClick={() => {
                                toast.custom((t) => (
                                    <ReportPrompt
                                        t={t}
                                        onSubmit={(issue) => reportIssue(job._id, issue)}
                                    />
                                ), { duration: Infinity }); // Keep open until action
                            }}
                            className="w-full mt-4 border border-red-200 text-red-600 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <AlertCircle size={20} />
                            Report Issue
                        </button>
                    </div>

                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h4 className="font-bold text-blue-900 mb-2">Note</h4>
                        <p className="text-sm text-blue-800">
                            Customer and pricing information is hidden for privacy and security protocols.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default JobDetails;
