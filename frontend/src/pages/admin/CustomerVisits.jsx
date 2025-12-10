import React, { useState, useEffect } from 'react';
import { Search, Calendar, User, Phone, Store, Printer } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CustomerVisits = () => {
    const [visits, setVisits] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVendor, setSelectedVendor] = useState('');

    useEffect(() => {
        fetchVisits();
        fetchVendors();
    }, []);

    const fetchVisits = async () => {
        try {
            const { data } = await api.get('/users/visits');
            setVisits(data);
        } catch (error) {
            console.error('Error fetching visits:', error);
            toast.error('Failed to load customer visits');
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const { data } = await api.get('/users?role=vendor');
            setVendors(data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const filteredVisits = visits.filter(visit => {
        const matchesSearch = visit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.phone.includes(searchTerm) ||
            visit.vendor?.businessName?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesVendor = selectedVendor ? (visit.vendor?._id === selectedVendor) : true;

        return matchesSearch && matchesVendor;
    });

    const exportPDF = async () => {
        const { default: jsPDF } = await import('jspdf');
        const { default: autoTable } = await import('jspdf-autotable');

        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.text('Customer Visits Report', 14, 22);

        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
        if (selectedVendor) {
            const vendorName = vendors.find(v => v._id === selectedVendor)?.businessName || 'Unknown Vendor';
            doc.text(`Vendor: ${vendorName}`, 14, 36);
        }

        const tableColumn = ["Customer", "Contact", "Referred By", "Code Used", "Time"];
        const tableRows = [];

        filteredVisits.forEach(visit => {
            const visitData = [
                visit.name,
                visit.phone,
                visit.vendor?.businessName || 'Unknown',
                visit.referralCode,
                new Date(visit.visitedAt).toLocaleString(),
            ];
            tableRows.push(visitData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        doc.save('customer_visits.pdf');
    };

    if (loading) return <div className="p-8 text-center">Loading visits...</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Customer Visits</h1>
                    <p className="text-gray-500">Track customers entering via Referral Codes</p>
                </div>
                <button
                    onClick={exportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Printer size={18} />
                    Export PDF
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, phone..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
                    >
                        <option value="">All Vendors</option>
                        {vendors.map(vendor => (
                            <option key={vendor._id} value={vendor._id}>
                                {vendor.businessName || vendor.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Referred By (Vendor)</th>
                            <th className="px-6 py-4">Code Used</th>
                            <th className="px-6 py-4">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredVisits.map((visit) => (
                            <tr key={visit._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary-50 p-2 rounded-full text-primary-600">
                                            <User size={16} />
                                        </div>
                                        <span className="font-medium text-gray-900">{visit.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        {visit.phone}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Store size={14} className="text-gray-400" />
                                        {visit.vendor?.businessName || visit.vendor?.name || 'Unknown Vendor'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-primary-600 bg-primary-50 inline-block rounded px-2 py-1 mt-3">
                                    {visit.referralCode}
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        {new Date(visit.visitedAt).toLocaleString()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredVisits.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No visits found matching your filters.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerVisits;
