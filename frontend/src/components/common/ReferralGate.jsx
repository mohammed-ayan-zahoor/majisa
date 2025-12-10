import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReferralGate = ({ children }) => {
    const { user } = useAuth();
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        referralCode: ''
    });

    useEffect(() => {
        // If user is logged in (Admin/Vendor), they are verified
        if (user) {
            setIsVerified(true);
            setLoading(false);
            return;
        }

        // Check local storage for customer verification
        const customerData = localStorage.getItem('majisa_customer');
        if (customerData) {
            setIsVerified(true);
        }
        setLoading(false);
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/users/verify-referral', {
                referralCode: formData.referralCode,
                name: formData.name,
                phone: formData.phone
            });

            if (data.valid) {
                localStorage.setItem('majisa_customer', JSON.stringify({
                    ...formData,
                    vendorName: data.vendorName,
                    verifiedAt: new Date().toISOString()
                }));
                setIsVerified(true);
                toast.success(`Welcome! You are shopping with ${data.vendorName}`);
            }
        } catch (error) {
            toast.error('Invalid Referral Code. Please contact your vendor.');
        }
    };

    if (loading) return null;

    if (!isVerified) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <h2 className="text-3xl font-serif font-bold text-charcoal-500 mb-2">Welcome to Majisa</h2>
                        <p className="text-gray-500">Please enter your details to view our exclusive collection.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all"
                                placeholder="Enter your mobile number"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Referral Code</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all uppercase tracking-widest font-mono"
                                placeholder="Enter 6-digit code"
                                value={formData.referralCode}
                                onChange={e => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                            />
                            <p className="text-xs text-gray-400 mt-1">Get this code from your local jeweller.</p>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-4"
                        >
                            Enter Store
                        </button>
                    </form>
                </div>
                <div className="absolute bottom-8 text-center w-full">
                    <a href="/login" className="text-white/50 hover:text-white text-sm transition-colors">
                        Admin Login
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default ReferralGate;
