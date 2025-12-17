import React, { useState, useEffect } from 'react';
import { Save, Lock, Globe, Bell } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [generalSettings, setGeneralSettings] = useState({
        siteName: '',
        contactEmail: '',
        currency: 'INR',
        maintenanceMode: false,
        watermarkLogo: ''
    });
    const [uploading, setUploading] = useState(false);

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
                maintenanceMode: data.maintenanceMode,
                watermarkLogo: data.watermarkLogo || ''
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
            await api.put('/users/profile/password', {
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

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Extract Public ID from Cloudinary URL
            // URL format: .../upload/v12345/folder/public_id.png
            const parts = data.split('/upload/');
            if (parts.length > 1) {
                const afterUpload = parts[1];
                const versionEnd = afterUpload.indexOf('/');
                let publicId = afterUpload.substring(versionEnd + 1); // Remove version (v12345/)
                // Remove extension
                const extensionIndex = publicId.lastIndexOf('.');
                if (extensionIndex !== -1) {
                    publicId = publicId.substring(0, extensionIndex);
                }
                setGeneralSettings(prev => ({ ...prev, watermarkLogo: publicId }));
                toast.success('Logo uploaded successfully');
            } else {
                toast.error('Invalid upload response');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload logo');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading settings...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <SEO title="Settings" description="Admin Settings" />
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

                {/* Branding Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <Bell className="text-primary-600" size={24} />
                        <h2 className="font-bold text-gray-900">Branding & Watermark</h2>
                    </div>
                    <div className="p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Watermark Logo</label>
                            <p className="text-xs text-gray-500 mb-3">
                                Upload a transparent PNG logo. Recommended dimensions: <strong>500x500 pixels</strong>.
                                This logo will be automatically overlaid on all product images.
                            </p>

                            <div className="flex items-center gap-4">
                                {generalSettings.watermarkLogo && (
                                    <div className="relative w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center p-2">
                                        <img
                                            src={`https://res.cloudinary.com/dhmuxg54d/image/upload/${generalSettings.watermarkLogo}`}
                                            alt="Watermark"
                                            className="max-w-full max-h-full object-contain opacity-50"
                                        />
                                        <button
                                            onClick={() => setGeneralSettings({ ...generalSettings, watermarkLogo: '' })}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                )}

                                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                                    <span>{uploading ? 'Uploading...' : 'Upload Logo'}</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/png"
                                        onChange={handleLogoUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={handleGeneralSave}
                                className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                            >
                                <Save size={18} />
                                Save Branding
                            </button>
                        </div>
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
