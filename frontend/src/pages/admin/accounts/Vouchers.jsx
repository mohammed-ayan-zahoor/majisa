import React, { useState, useEffect } from 'react';
import { Plus, Trash, Calculator, Save } from 'lucide-react';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const Vouchers = () => {
    const [voucherType, setVoucherType] = useState('Sales');
    const [parties, setParties] = useState([]);
    const [items, setItems] = useState([]);

    // Header Data
    const [header, setHeader] = useState({
        voucherNo: '',
        date: new Date().toISOString().split('T')[0],
        partyId: '',
        narration: ''
    });

    // Grid Data
    const [rows, setRows] = useState([]);

    // Bhav Cutting Data
    const [bhav, setBhav] = useState({
        metalRate: 0,
        bhavCuttingWeight: 0,
        bhavCuttingAmount: 0,
        cashReceived: 0
    });

    useEffect(() => {
        // Fetch dependencies
        const fetchData = async () => {
            try {
                const [pRes, iRes] = await Promise.all([
                    api.get('/accounts/parties'),
                    api.get('/accounts/items')
                ]);
                setParties(pRes.data);
                setItems(iRes.data);

                // Set initial voucher no (Mock logic, ideally from backend)
                setHeader(prev => ({ ...prev, voucherNo: `VCH-${Date.now().toString().slice(-4)}` }));
            } catch (error) {
                console.error("Failed to load voucher masters", error);
            }
        };
        fetchData();
        addNewRow();
    }, []);

    const addNewRow = () => {
        setRows([...rows, {
            id: Date.now(),
            item: '',
            grossWeight: 0,
            lessWeight: 0,
            netWeight: 0,
            purity: 100, // Tunch
            wastage: 0,
            fineWeight: 0,
            labRate: 0,
            labAmount: 0,
            amount: 0
        }]);
    };

    const removeRow = (id) => {
        setRows(rows.filter(r => r.id !== id));
    };

    const handleHeaderChange = (e) => {
        setHeader({ ...header, [e.target.name]: e.target.value });
    };

    const handleRowChange = (id, field, value) => {
        setRows(rows.map(row => {
            if (row.id === id) {
                const updatedRow = { ...row, [field]: value };

                // Calculations
                if (['grossWeight', 'lessWeight', 'purity', 'wastage'].includes(field) || field === 'item') {
                    // Logic: Net Wt = Gross - Less
                    // Fine Wt = Net Wt * (Purity + Wastage) / 100
                    const gross = parseFloat(updatedRow.grossWeight) || 0;
                    const less = parseFloat(updatedRow.lessWeight) || 0;
                    updatedRow.netWeight = parseFloat((gross - less).toFixed(3));

                    const purity = parseFloat(updatedRow.purity) || 0;
                    const wastage = parseFloat(updatedRow.wastage) || 0;

                    updatedRow.fineWeight = parseFloat(((updatedRow.netWeight * (purity + wastage)) / 100).toFixed(3));
                }

                if (['labRate', 'netWeight'].includes(field)) {
                    // Assuming lab rate is per gm on Net Weight
                    const rate = parseFloat(updatedRow.labRate) || 0;
                    const net = parseFloat(updatedRow.netWeight) || 0;
                    updatedRow.labAmount = parseFloat((net * rate).toFixed(2));
                    updatedRow.amount = updatedRow.labAmount; // Initially amount is just labour in metal accounting? 
                    // Or if selling, amount is total. Let's assume Amount = Lab Amount for now if Metal is the primary currency.
                }

                return updatedRow;
            }
            return row;
        }));
    };

    // Totals
    const totalGross = rows.reduce((acc, r) => acc + (parseFloat(r.grossWeight) || 0), 0);
    const totalNet = rows.reduce((acc, r) => acc + (parseFloat(r.netWeight) || 0), 0);
    const totalFine = rows.reduce((acc, r) => acc + (parseFloat(r.fineWeight) || 0), 0);
    const totalAmount = rows.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0);

    const handleSubmit = async () => {
        try {
            const payload = {
                voucherNo: header.voucherNo,
                date: header.date,
                type: voucherType,
                party: header.partyId,
                items: rows.map(r => ({
                    item: r.item,
                    grossWeight: r.grossWeight,
                    lessWeight: r.lessWeight,
                    netWeight: r.netWeight,
                    purity: r.purity,
                    wastage: r.wastage,
                    fineWeight: r.fineWeight,
                    labourRate: r.labRate,
                    labourAmount: r.labAmount,
                    totalAmount: r.amount
                })),
                metalRate: bhav.metalRate,
                bhavCuttingWeight: bhav.bhavCuttingWeight,
                bhavCuttingAmount: bhav.bhavCuttingAmount,
                cashReceived: bhav.cashReceived,
                narration: header.narration
            };

            await api.post('/accounts/vouchers', payload);
            toast.success("Voucher Saved Successfully");
            // Reset logic here...
            setRows([]);
            addNewRow();
            setHeader(prev => ({ ...prev, voucherNo: `VCH-${Date.now().toString().slice(-4)}`, narration: '' }));
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to save voucher");
        }
    };

    return (
        <div className="space-y-4 max-w-[1400px] mx-auto">
            {/* Header Section */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Voucher Type</label>
                    <select
                        value={voucherType}
                        onChange={(e) => setVoucherType(e.target.value)}
                        className="w-full mt-1 border-b-2 border-gray-200 focus:border-primary-600 outline-none pb-1 bg-transparent font-medium"
                    >
                        <option value="Sales">Sales Voucher</option>
                        <option value="Purchase">Purchase Voucher</option>
                        <option value="Issue">Issue Voucher</option>
                        <option value="Receipt">Receipt Voucher</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Vch No</label>
                    <input
                        name="voucherNo"
                        value={header.voucherNo}
                        onChange={handleHeaderChange}
                        className="w-full mt-1 border-b-2 border-gray-200 focus:border-primary-600 outline-none pb-1 bg-transparent"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Party A/c</label>
                    <select
                        name="partyId"
                        value={header.partyId}
                        onChange={handleHeaderChange}
                        className="w-full mt-1 border-b-2 border-gray-200 focus:border-primary-600 outline-none pb-1 bg-transparent"
                    >
                        <option value="">Select Party</option>
                        {parties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={header.date}
                        onChange={handleHeaderChange}
                        className="w-full mt-1 border-b-2 border-gray-200 focus:border-primary-600 outline-none pb-1 bg-transparent"
                    />
                </div>
            </div>

            {/* Grid Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-serif font-bold tracking-wider">
                            <tr>
                                <th className="px-3 py-3 w-10">Sr.</th>
                                <th className="px-3 py-3">Item Name</th>
                                <th className="px-3 py-3 w-24 text-right">Gr. Wt</th>
                                <th className="px-3 py-3 w-24 text-right">Less Wt</th>
                                <th className="px-3 py-3 w-24 text-right">Net Wt</th>
                                <th className="px-3 py-3 w-20 text-right">Touch</th>
                                <th className="px-3 py-3 w-20 text-right">Wastage</th>
                                <th className="px-3 py-3 w-24 text-right">Fine Wt</th>
                                <th className="px-3 py-3 w-24 text-right">Lab Rate</th>
                                <th className="px-3 py-3 w-24 text-right">Amount</th>
                                <th className="px-3 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.map((row, index) => (
                                <tr key={row.id} className="hover:bg-slate-50/50">
                                    <td className="px-3 py-2 text-center text-gray-400">{index + 1}</td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={row.item}
                                            onChange={(e) => handleRowChange(row.id, 'item', e.target.value)}
                                            className="w-full bg-transparent outline-none focus:text-primary-600"
                                        >
                                            <option value="">Select Item</option>
                                            {items.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2"><input type="number" className="w-full text-right outline-none bg-transparent" value={row.grossWeight} onChange={e => handleRowChange(row.id, 'grossWeight', e.target.value)} /></td>
                                    <td className="px-3 py-2"><input type="number" className="w-full text-right outline-none bg-transparent" value={row.lessWeight} onChange={e => handleRowChange(row.id, 'lessWeight', e.target.value)} /></td>
                                    <td className="px-3 py-2 text-right font-medium">{row.netWeight.toFixed(3)}</td>
                                    <td className="px-3 py-2"><input type="number" className="w-full text-right outline-none bg-transparent" value={row.purity} onChange={e => handleRowChange(row.id, 'purity', e.target.value)} /></td>
                                    <td className="px-3 py-2"><input type="number" className="w-full text-right outline-none bg-transparent" value={row.wastage} onChange={e => handleRowChange(row.id, 'wastage', e.target.value)} /></td>
                                    <td className="px-3 py-2 text-right font-medium text-primary-600">{row.fineWeight.toFixed(3)}</td>
                                    <td className="px-3 py-2"><input type="number" className="w-full text-right outline-none bg-transparent" value={row.labRate} onChange={e => handleRowChange(row.id, 'labRate', e.target.value)} /></td>
                                    <td className="px-3 py-2 text-right">{row.amount.toFixed(2)}</td>
                                    <td className="px-3 py-2 text-center">
                                        <button onClick={() => removeRow(row.id)} className="text-gray-400 hover:text-red-500"><Trash size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold border-t-2 border-gray-200 text-sm font-serif">
                            <tr>
                                <td colSpan="2" className="px-3 py-3 text-right">Totals</td>
                                <td className="px-3 py-3 text-right text-gray-800">{totalGross.toFixed(3)}</td>
                                <td className="px-3 py-3 text-right text-gray-800">{rows.reduce((a, r) => a + (parseFloat(r.lessWeight) || 0), 0).toFixed(3)}</td>
                                <td className="px-3 py-3 text-right text-gray-800">{totalNet.toFixed(3)}</td>
                                <td colSpan="2"></td>
                                <td className="px-3 py-3 text-right text-primary-700">{totalFine.toFixed(3)}</td>
                                <td></td>
                                <td className="px-3 py-3 text-right text-green-700">{totalAmount.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button onClick={addNewRow} className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1">
                        <Plus size={16} /> Add Line (F9)
                    </button>
                </div>
            </div>

            {/* Bottom Actions & Bhav Cutting */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Bhav Cutting / Metal Conversion */}
                <div className="space-y-4">
                    <h3 className="font-bold text-gray-700 text-sm uppercase flex items-center gap-2">
                        <Calculator size={16} /> Bhav Cutting (Rate Fix)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500">Bhav/Rate</label>
                            <input
                                type="number"
                                className="w-full border-b border-gray-300 focus:border-primary-500 outline-none py-1"
                                value={bhav.metalRate}
                                onChange={e => setBhav({ ...bhav, metalRate: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500">Weight to Cut</label>
                            <input
                                type="number"
                                className="w-full border-b border-gray-300 focus:border-primary-500 outline-none py-1"
                                value={bhav.bhavCuttingWeight}
                                onChange={e => {
                                    const wt = parseFloat(e.target.value) || 0;
                                    setBhav({
                                        ...bhav,
                                        bhavCuttingWeight: wt,
                                        bhavCuttingAmount: wt * (bhav.metalRate || 0)
                                    });
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Final Calculations */}
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <label className="text-sm font-medium text-gray-600">Total Cash Amount</label>
                        <div className="text-right font-bold text-xl text-gray-800">
                            {/* Logic: Row Amounts + Bhav Cutting Amount */}
                            {(totalAmount + bhav.bhavCuttingAmount).toFixed(2)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                        <label className="text-sm font-medium text-gray-600">Cash Received</label>
                        <input
                            type="number"
                            className="text-right border rounded p-2 font-medium"
                            value={bhav.cashReceived}
                            onChange={(e) => setBhav({ ...bhav, cashReceived: parseFloat(e.target.value) })}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg shadow-primary-200 transition-all active:scale-95"
                    >
                        Save Voucher
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Vouchers;
