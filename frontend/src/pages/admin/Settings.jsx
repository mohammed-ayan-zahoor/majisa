import React, { useState, useEffect } from 'react';
import { Save, Lock, Globe, Bell, User, Database, Download, Upload, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import SEO from '../../components/common/SEO';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const { user, updateUser } = useAuth();
    const [generalSettings, setGeneralSettings] = useState({
        siteName: '',
        contactEmail: '',
        currency: 'INR',
        maintenanceMode: false,
        watermarkLogo: ''
    });
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    });
    const [uploading, setUploading] = useState(false);
    const [restoring, setRestoring] = useState(false);
    const [backupFile, setBackupFile] = useState(null);

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

    const handleProfileSave = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/users/profile', profileData);
            updateUser(data);
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data || 'Failed to update profile');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new !== passwordData.confirm) {
            toast.error('New passwords do not match');
            return;
        }
        try {
            const { data } = await api.put('/users/profile/password', {
                password: passwordData.new,
            });
            updateUser(data);
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

    const handleExportBackup = async () => {
        try {
            const response = await api.get('/settings/backup', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `majisa_backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Backup downloaded successfully');
        } catch (error) {
            console.error('Export Error:', error);
            toast.error('Failed to export backup');
        }
    };

    const handleImportRestore = async (e) => {
        e.preventDefault();
        if (!backupFile) return;

        const confirmRestore = window.confirm('WARNING: This will PERMANENTLY REPLACE all current data (products, orders, users, etc.) with the data in the backup file. This cannot be undone. Are you absolutely sure?');

        if (!confirmRestore) return;

        setRestoring(true);
        try {
            const formData = new FormData();
            // We need to read the file first since we are sending it as JSON in the body based on our controller
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const backupData = JSON.parse(event.target.result);
                    await api.post('/settings/restore', { backupData });
                    toast.success('Database restored successfully! Logging out...');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 2000);
                } catch (err) {
                    console.error('Inner Restore Error:', err);
                    toast.error(err.response?.data?.message || 'Invalid backup data or server error');
                    setRestoring(false);
                }
            };
            reader.onerror = () => {
                toast.error('Failed to read backup file');
                setRestoring(false);
            };
            reader.readAsText(backupFile);
        } catch (error) {
            console.error('Import Error:', error);
            toast.error(error.response?.data?.message || 'Restore failed');
            setRestoring(false);
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
                {/* Account Profile */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <User className="text-primary-600" size={24} />
                        <h2 className="font-bold text-gray-900">Account Profile</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleProfileSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">My Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Login Email Address</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-medium bg-primary-50/30"
                                        placeholder="Your Login Email"
                                    />
                                    <p className="text-[10px] text-primary-600 mt-1">This is the email you use to sign in.</p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button type="submit" className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                                    <Save size={18} />
                                    Update Profile
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* General Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <Globe className="text-primary-600" size={24} />
                        <h2 className="font-bold text-gray-900">Site Settings</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleGeneralSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                                    <input
                                        type="text"
                                        value={generalSettings.siteName}
                                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Display Contact Email</label>
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

                {/* Maintenance & Data Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                        <Database className="text-primary-600" size={24} />
                        <h2 className="font-bold text-gray-900">Maintenance & Data</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Export Section */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Download size={18} className="text-green-600" />
                                    Export Data
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Download a complete backup of your store, including products, categories, orders, and users.
                                    Keep this file safe to restore your data later.
                                </p>
                                <button
                                    onClick={handleExportBackup}
                                    className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                                >
                                    <Download size={16} />
                                    Download Full Backup (.json)
                                </button>
                            </div>

                            {/* Import Section */}
                            <div className="space-y-4 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                                <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                    <Upload size={18} className="text-primary-600" />
                                    Restore Data
                                </h3>
                                <p className="text-xs text-gray-500">
                                    Restore your store from a previous backup file.
                                    <span className="text-red-600 font-bold"> Warning: This will overwrite all current data.</span>
                                </p>

                                <form onSubmit={handleImportRestore} className="space-y-3">
                                    <input
                                        type="file"
                                        accept=".json"
                                        onChange={(e) => setBackupFile(e.target.files[0])}
                                        className="block w-full text-xs text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-xs file:font-semibold
                                            file:bg-primary-50 file:text-primary-700
                                            hover:file:bg-primary-100"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!backupFile || restoring}
                                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {restoring ? 'Restoring...' : 'Import & Restore Now'}
                                        {restoring && <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Critical Alert */}
                        <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200 flex gap-3">
                            <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="text-sm font-bold text-amber-800">Precautions during Testing</h4>
                                <ul className="text-xs text-amber-700 mt-1 list-disc list-inside space-y-1">
                                    <li>Always take a backup before performing bulk deletes or experimental changes.</li>
                                    <li>Cloudinary images are preserved even when products are deleted, ensuring restoration works.</li>
                                    <li>If you restore a backup, you must re-login to see the changes.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
