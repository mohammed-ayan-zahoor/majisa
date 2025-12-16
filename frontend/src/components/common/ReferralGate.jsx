import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../firebase';
import toast from 'react-hot-toast';

const ReferralGate = ({ children }) => {
    const { user } = useAuth();
    const { loginCustomer } = useWishlist();
    const [isVerified, setIsVerified] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        referralCode: ''
    });

    const [step, setStep] = useState('details');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Use ref to track if verifier is initialized
    const recaptchaVerifierRef = useRef(null);
    const recaptchaInitialized = useRef(false);

    // Initial Auth Check
    useEffect(() => {
        // Immediate check - AuthContext is already ready
        if (user) {
            setIsVerified(true);
        } else {
            const customerData = localStorage.getItem('majisa_customer');
            if (customerData) {
                setIsVerified(true);
            }
        }
        setLoading(false);
    }, [user]);

    // Initialize reCAPTCHA once when component mounts and gate is shown
    useEffect(() => {
        if (isVerified || loading) return;

        const initRecaptcha = () => {
            // Clean up existing verifier
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                } catch (e) {
                    console.log('Error clearing recaptcha:', e);
                }
                recaptchaVerifierRef.current = null;
                recaptchaInitialized.current = false;
            }

            // Wait for DOM element to be available
            const container = document.getElementById('recaptcha-container');
            if (!container) {
                console.log('Recaptcha container not found, retrying...');
                setTimeout(initRecaptcha, 100);
                return;
            }

            try {
                // Remove any existing recaptcha instances in the container to be safe
                container.innerHTML = '';

                recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size: 'invisible',
                    callback: (response) => {
                        console.log('reCAPTCHA solved');
                    },
                    'expired-callback': () => {
                        toast.error('Recaptcha expired, please try again');
                        recaptchaInitialized.current = false;
                    }
                });

                // Render the verifier
                recaptchaVerifierRef.current.render().then(() => {
                    recaptchaInitialized.current = true;
                    console.log('reCAPTCHA initialized successfully');
                }).catch((error) => {
                    console.error('Error rendering recaptcha:', error);
                    recaptchaInitialized.current = false;
                });

            } catch (error) {
                console.error('Error initializing recaptcha:', error);
            }
        };

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            initRecaptcha();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                } catch (e) {
                    console.log('Cleanup error:', e);
                }
                recaptchaVerifierRef.current = null;
                recaptchaInitialized.current = false;
            }
        };
    }, [isVerified, loading]);

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 10) value = value.slice(0, 10);
        setFormData({ ...formData, phone: value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        // Validate inputs
        if (!formData.name.trim()) {
            toast.error('Please enter your name');
            return;
        }

        if (!formData.phone || formData.phone.length !== 10) {
            toast.error('Please enter a valid 10-digit phone number');
            return;
        }

        if (!formData.referralCode.trim()) {
            toast.error('Please enter referral code');
            return;
        }

        // Check if recaptcha is initialized
        if (!recaptchaVerifierRef.current || !recaptchaInitialized.current) {
            // Attempt to re-init if missing
            toast.error('Initializing security check...');
            return;
        }

        // Format phone number (Indian format)
        const phoneNumber = `+91${formData.phone}`;

        try {
            setSubmitLoading(true);

            const confirmation = await signInWithPhoneNumber(
                auth,
                phoneNumber,
                recaptchaVerifierRef.current
            );

            setConfirmationResult(confirmation);
            setStep('otp');
            toast.success(`OTP sent to ${phoneNumber}`);

        } catch (error) {
            console.error('OTP Send Error:', error);

            // Handle specific error cases
            if (error.code === 'auth/invalid-phone-number') {
                toast.error('Invalid phone number format');
            } else if (error.code === 'auth/too-many-requests') {
                toast.error('Too many attempts. Please try again later.');
            } else if (error.code === 'auth/argument-error') {
                toast.error('Verification error. Refreshing...');
                window.location.reload();
            } else {
                toast.error(error.message || 'Failed to send OTP');
            }
            // If we fail, we might need to reset recaptcha
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                    recaptchaVerifierRef.current = null;
                    recaptchaInitialized.current = false;
                    // Force re-render of effect? No, just let usage fail and user retry or reload.
                } catch (e) { }
            }

        } finally {
            setSubmitLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        if (!otp || otp.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            return;
        }

        if (!confirmationResult) {
            toast.error('Please request OTP first');
            return;
        }

        try {
            setSubmitLoading(true);

            // Verify the OTP
            await confirmationResult.confirm(otp);

            // Register/Login with backend
            const data = await loginCustomer(formData.phone, formData.name, formData.referralCode);

            setIsVerified(true);
            toast.success(`Welcome, ${formData.name}!`);

        } catch (error) {
            console.error('OTP Verification Error:', error);

            if (error.code === 'auth/invalid-verification-code') {
                toast.error('Invalid OTP. Please check and try again.');
            } else if (error.code === 'auth/code-expired') {
                toast.error('OTP expired. Please request a new one.');
                setStep('details');
            } else {
                toast.error('Verification failed. Please try again.');
            }

        } finally {
            setSubmitLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setStep('details');
        setOtp('');
        setConfirmationResult(null);
        toast.info('Please re-enter your details to resend OTP');
    };

    // If initial loading (auth check), shouldn't block for long due to useEffect logic
    if (loading) {
        return null; // Or a spinner if preferred, but usually instant
    }

    if (!isVerified) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
                    <div className="mb-6">
                        <h2 className="text-3xl font-serif font-bold text-charcoal-500 mb-2">
                            Welcome to Majisa
                        </h2>
                        <p className="text-gray-500">
                            Please verify your identity to view our exclusive collection.
                        </p>
                    </div>

                    {step === 'details' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Name
                                </label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-gray-500 font-medium">+91</span>
                                    <input
                                        type="tel"
                                        required
                                        className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all"
                                        placeholder="00000 00000"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                        maxLength="10"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                    Enter 10-digit mobile number
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vendor Referral Code
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-400 focus:border-transparent outline-none transition-all uppercase tracking-widest font-mono"
                                    placeholder="Enter code"
                                    value={formData.referralCode}
                                    onChange={e => setFormData({
                                        ...formData,
                                        referralCode: e.target.value.toUpperCase()
                                    })}
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    Get this code from your local jeweller.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {submitLoading ? 'Sending...' : 'Send Verification Code'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 text-left animate-fade-in">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 mb-4">
                                    Enter the 6-digit code sent to <br />
                                    <span className="font-bold text-gray-800">+91{formData.phone}</span>
                                </p>
                                <div className="flex justify-center gap-2">
                                    <input
                                        type="text"
                                        maxLength="6"
                                        autoFocus
                                        className="w-40 text-center text-3xl tracking-widest px-4 py-2 border-b-2 border-gold-400 focus:border-gold-600 outline-none font-mono bg-transparent"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading || otp.length !== 6}
                                className="w-full bg-charcoal-600 text-white font-bold py-3 rounded-lg shadow-lg hover:bg-black transition-all duration-200 disabled:opacity-70"
                            >
                                {submitLoading ? 'Verifying...' : 'Verify & Enter Store'}
                            </button>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="w-full text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                                Change Phone Number or Resend OTP
                            </button>
                        </form>
                    )}
                </div>

                <div className="absolute bottom-8 text-center w-full">
                    <a href="/login" className="text-white/50 hover:text-white text-sm transition-colors">
                        Admin Login
                    </a>
                </div>

                {/* Recaptcha container - must be in DOM */}
                <div id="recaptcha-container"></div>
            </div>
        );
    }

    return children;
};

export default ReferralGate;
