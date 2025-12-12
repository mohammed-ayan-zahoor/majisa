import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
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

    const { loginCustomer } = useWishlist();

    const [step, setStep] = useState('details'); // 'details' | 'otp'
    const [otp, setOtp] = useState('');

    const handleSendOtp = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phone || !formData.referralCode) {
            toast.error('Please fill in all details');
            return;
        }
        // Simulate sending OTP
        setStep('otp');
        toast.success(`Verification Code sent to ${formData.phone}`);
        setTimeout(() => toast('Your code is: 1234', { icon: '📱' }), 1000);
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otp !== '1234') {
            toast.error('Invalid Code. Try 1234');
            return;
        }

        try {
            const data = await loginCustomer(formData.phone, formData.name, formData.referralCode);
            setIsVerified(true);
            toast.success(`Welcome back ${data.name}!`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
            setStep('details'); // Reset on error to check details
        }
    };

    if (loading) return null;

    if (!isVerified) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <h2 className="text-3xl font-serif font-bold text-charcoal-500 mb-2">Welcome to Majisa</h2>
                        <p className="text-gray-500">Please verify your identity to view our exclusive collection.</p>
                    </div>

                    {step === 'details' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4 text-left">
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
                                Send Verification Code
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 text-left animate-fade-in">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-4">Enter the 4-digit code sent to <br /><span className="font-bold text-gray-800">{formData.phone}</span></p>
                                <div className="flex justify-center gap-2">
                                    <input
                                        type="text"
                                        maxLength="4"
                                        autoFocus
                                        className="w-32 text-center text-3xl tracking-widest px-4 py-2 border-b-2 border-gold-400 focus:border-gold-600 outline-none font-mono bg-transparent"
                                        placeholder="0000"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-charcoal-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-black transition-all duration-200"
                            >
                                Verify & Enter Store
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('details')}
                                className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                                Change Phone Number
                            </button>
                        </form>
                    )}
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
