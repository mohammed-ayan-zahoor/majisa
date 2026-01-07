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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchVisits(page);
    }, [page]);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVisits = async (pageNumber = 1) => {
        try {
            setLoading(true);
            const { data } = await api.get(`/users/visits?pageNumber=${pageNumber}`);
            setVisits(data.visits);
            setTotalPages(data.pages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching visits:', error);
            toast.error('Failed to load customer visits');
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

    // Removed blocking loading check to allow consistent table rendering
    // if (loading && visits.length === 0) return <div className="p-8 text-center">Loading visits...</div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-xl font-serif font-bold text-gray-900">Customer Visits</h1>
                    <p className="text-xs text-gray-500 hidden md:block">Track customers entering via Referral Codes</p>
                </div>
                <button
                    onClick={exportPDF}
                    className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors whitespace-nowrap"
                >
                    <Printer size={16} />
                    <span className="hidden md:inline">Export PDF</span>
                    <span className="md:hidden">PDF</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search current page..."
                        className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        value={selectedVendor}
                        onChange={(e) => setSelectedVendor(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 bg-white"
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
            <div className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden relative transition-opacity duration-300 ${loading ? 'opacity-60' : 'opacity-100'}`}>
                {loading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px] font-medium text-primary-600 uppercase tracking-wider">Updating...</span>
                        </div>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-medium">
                            <tr>
                                <th className="px-4 py-2">Customer</th>
                                <th className="px-4 py-2">Contact</th>
                                <th className="px-4 py-2">Referred By (Vendor)</th>
                                <th className="px-4 py-2">Code Used</th>
                                <th className="px-4 py-2">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVisits.map((visit) => (
                                <tr key={visit._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-primary-50 p-1.5 rounded-full text-primary-600">
                                                <User size={14} />
                                            </div>
                                            <span className="font-medium text-gray-900 text-sm">{visit.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        <div className="flex items-center gap-2 text-xs">
                                            <Phone size={12} className="text-gray-400" />
                                            {visit.phone}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-gray-700 text-xs">
                                            <Store size={12} className="text-gray-400" />
                                            {visit.vendor?.businessName || visit.vendor?.name || 'Unknown Vendor'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-[10px] text-primary-600 bg-primary-50 inline-block rounded px-1.5 py-0.5">
                                            {visit.referralCode}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={12} className="text-gray-400" />
                                            {new Date(visit.visitedAt).toLocaleString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredVisits.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        {loading ? 'Loading...' : 'No visits found matching your filters.'}
                    </div>
                )}

                {/* Pagination Controls */}
                <div className="border-t border-gray-100 p-3 flex justify-between items-center bg-gray-50">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-400 flex items-center gap-2">
                        {loading && <div className="w-3 h-3 border border-primary-400 border-t-transparent rounded-full animate-spin"></div>}
                        Page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-3 py-1 text-sm bg-white border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomerVisits;
