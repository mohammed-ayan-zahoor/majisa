import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Package } from 'lucide-react';

const Inventory = () => {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            // In a real app, this should be an aggregation query on the backend
            // For now, we fetch items and vouchres and calculate on client side
            // OR we just show the "Opening Stock" from masters if that's what is expected initially
            const [itemsRes, vouchersRes] = await Promise.all([
                api.get('/accounts/items'),
                api.get('/accounts/vouchers')
            ]);

            const items = itemsRes.data;
            const vouchers = vouchersRes.data;

            const calculatedInventory = items.map(item => {
                let currentStock = item.openingStock?.weight || 0;

                // Filter vouchers for this item
                vouchers.forEach(v => {
                    v.items.forEach(vItem => {
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

            setInventory(calculatedInventory);
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold font-serif text-gray-900">Live Inventory</h1>

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
                            {inventory.map((item) => (
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
        </div>
    );
};

export default Inventory;
