import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Package } from 'lucide-react';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = new AbortController();
        fetchInventory(controller.signal);
        return () => controller.abort();
    }, []);

    const fetchInventory = async (signal) => {
        setLoading(true);
        setError(null);
        try {
            // In a real app, this should be an aggregation query on the backend
            // For now, we fetch items and vouchers and calculate on client side
            // OR we just show the "Opening Stock" from masters if that's what is expected initially
            const [itemsRes, vouchersRes] = await Promise.all([
                api.get('/accounts/items', { signal }),
                api.get('/accounts/vouchers', { signal })
            ]);

            const items = Array.isArray(itemsRes.data) ? itemsRes.data : [];
            const vouchers = Array.isArray(vouchersRes.data) ? vouchersRes.data : [];

            const calculatedInventory = items.map(item => {
                let currentStock = item.openingStock?.weight || 0;

                // Filter vouchers for this item
                vouchers.forEach(v => {
                    (Array.isArray(v.items) ? v.items : []).forEach(vItem => {
                        if (vItem.item?._id === item._id || vItem.item === item._id) {
                            // Logic: 
                            // Sales/Issue = Out (-)
                            // Purchase/Receipt = In (+)
                            const weight = vItem.fineWeight || vItem.netWeight || 0; // Usage of fine vs net depends on business rule (usually Fine for Gold)

                            if (['Sales', 'Issue'].includes(v.type)) {
                                currentStock -= weight;
                            } else if (['Purchase', 'Receipt'].includes(v.type)) {
                                currentStock += weight;
                            }
                        }
                    });
                });

                return {
                    ...item,
                    currentStock
                };
            });

            if (!signal.aborted) {
                setInventory(calculatedInventory);
            }
        } catch (error) {
            if (signal?.aborted || error.name === 'CanceledError' || error.name === 'AbortError') {
                console.log('Fetch aborted');
                return;
            }
            console.error("Failed to fetch inventory", error);
            if (!signal.aborted) {
                setError(error.message || "Failed to load inventory data");
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold font-serif text-gray-900">Live Inventory</h1>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-600">{error}</div>
            ) : inventory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No inventory items found.</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-100 text-gray-700 font-bold font-serif border-b">
                                <tr>
                                    <th className="px-6 py-4">Item Name</th>
                                    <th className="px-6 py-4">Metal Type</th>
                                    <th className="px-6 py-4">Purity</th>
                                    <th className="px-6 py-4 text-right">Opening Stock</th>
                                    <th className="px-6 py-4 text-right">Current Stock</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(Array.isArray(inventory) ? inventory : []).map((item) => (
                                    <tr key={item._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium flex items-center gap-2">
                                            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-700">
                                                <Package size={16} />
                                            </div>
                                            {item.name}
                                        </td>
                                        <td className="px-6 py-4">{item.metal}</td>
                                        <td className="px-6 py-4">{item.purity}</td>
                                        <td className="px-6 py-4 text-right text-gray-500">{item.openingStock?.weight?.toFixed(3) || '0.000'}</td>
                                        <td className="px-6 py-4 text-right font-bold text-lg text-primary-800">
                                            {item.currentStock?.toFixed(3)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {item.currentStock < 10 ? (
                                                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Low Stock</span>
                                            ) : (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Available</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
