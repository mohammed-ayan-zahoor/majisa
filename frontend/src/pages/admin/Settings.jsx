import React, { useState, useEffect } from 'react';
import { Save, Lock, Globe, Bell } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [generalSettings, setGeneralSettings] = useState({
        siteName: '',
        contactEmail: '',
        currency: 'INR',
        maintenanceMode: false
    });

    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await api.get('/settings');
            setGeneralSettings({
                siteName: data.siteName,
                contactEmail: data.contactEmail,
                currency: data.currency,
                maintenanceMode: data.maintenanceMode
            });
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneralSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('/settings', generalSettings);
            toast.success('General settings saved successfully');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to save settings');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        try {
            await api.put('/users/profile', {
                password: passwordData.new,
                // We might need to send current password for verification depending on backend implementation
                // For now assuming standard profile update
            });
            toast.success('Password updated successfully');
            setPasswordData({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Error updating password:', error);
            toast.error(error.response?.data?.message || 'Failed to update password');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-serif font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your application preferences</p>
            </div>

            <div className="space-y-8">
                {/* General Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <Globe className="text-primary-600" size={24} />
                        <h2 className="font-bold text-gray-900">General Settings</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleGeneralSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                    <input
                                        type="text"
                                        value={generalSettings.siteName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                    <input
                                        type="email"
                                        value={generalSettings.contactEmail}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select
                                        value={generalSettings.currency}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                        <option value="EUR">EUR (€)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="maintenance"
                                    checked={generalSettings.maintenanceMode}
                                    onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                />
                                <label htmlFor="maintenance" className="text-sm text-gray-700">Enable Maintenance Mode</label>
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

                {/* Security Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <Lock className="text-primary-600" size={24} />
                        <h2 className="font-bold text-gray-900">Security</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="flex items-center gap-2 border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
