import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Store, User, Phone, MapPin, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorRegister = () => {
    const [formData, setFormData] = useState({
        businessName: '',
        ownerName: '',
        phone: '',
        gstNo: '',
        city: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate API call
        try {
            const formDataToSend = new FormData();
            toast.success('Application submitted successfully!');
        }, 1000);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Application Submitted!</h2>
                <p className="text-gray-600 max-w-md mb-8">
                    Thank you for registering with Majisa Jewellers. Your application is under review.
                    We will contact you shortly once your account is approved.
                </p>
                <Link to="/" className="text-primary-600 font-medium hover:underline">
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-primary-900 py-6 px-8 text-center">
                    <h2 className="text-2xl font-serif font-bold text-white">Vendor Registration</h2>
                    <p className="text-primary-200 text-sm mt-2">Join our network of trusted partners</p>
                </div>

                <form onSubmit={handleSubmit} className="py-8 px-8 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Store className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="businessName"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Majisa Jewellers"
                                value={formData.businessName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="ownerName"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="John Doe"
                                value={formData.ownerName}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="gstNo"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="22AAAAA0000A1Z5"
                                value={formData.gstNo}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPin className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="city"
                                required
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                                placeholder="Mumbai"
                                value={formData.city}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        Submit Application
                    </button>

                    <div className="text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Log in</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VendorRegister;
