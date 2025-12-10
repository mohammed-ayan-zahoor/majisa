import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Building, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const VendorProfile = () => {
    const [profile, setProfile] = useState({
        name: 'Rajesh Jain',
        businessName: 'Majisa Jewellers',
        email: 'vendor@majisa.com',
        phone: '+91 98765 43210',
        gst: '27ABCDE1234F1Z5',
        address: '123, Gold Market Road, Zaveri Bazaar, Mumbai - 400002',
        city: 'Mumbai',
        state: 'Maharashtra'
    });

    const handleSave = (e) => {
        e.preventDefault();
        // Simulate API call
        setTimeout(() => {
            toast.success('Profile updated successfully');
        }, 500);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Vendor Profile</h1>
                <p className="text-gray-500">Manage your business information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center h-fit">
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                        <User size={40} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{profile.businessName}</h2>
                    <p className="text-gray-500 mb-4">{profile.name}</p>
                    <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Verified Vendor
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-bold text-gray-900">Edit Profile</h3>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                                    <div className="relative">
                                        <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profile.businessName}
                                            onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                                    <input
                                        type="text"
                                        value={profile.gst}
                                        onChange={(e) => setProfile({ ...profile, gst: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                    <input
                                        type="text"
                                        value={profile.city}
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                                <div className="relative">
                                    <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <textarea
                                        rows="3"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors">
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorProfile;
