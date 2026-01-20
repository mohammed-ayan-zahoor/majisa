import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Search, Download, Printer } from 'lucide-react';

const Ledger = () => {
    const [parties, setParties] = useState([]);
    const [selectedParty, setSelectedParty] = useState('');
    const [ledgerData, setLedgerData] = useState(null);
    const [processedTransactions, setProcessedTransactions] = useState([]);

    useEffect(() => {
        api.get('/accounts/parties').then(res => setParties(res.data));
    }, []);

    useEffect(() => {
        if (selectedParty) {
            fetchLedger();
        }
    }, [selectedParty]);

    const fetchLedger = async () => {
        try {
            const res = await api.get(`/accounts/ledger/${selectedParty}`);
            setLedgerData(res.data);
            processLedger(res.data);
        } catch (error) {
            console.error("Failed to fetch ledger", error);
        }
    };

    const processLedger = (data) => {
        const { party, transactions } = data;
        let metalBal = party.openingBalance?.metal?.weight || 0;
        let cashBal = party.openingBalance?.amount?.value || 0;

        // Ensure we handle Dr/Cr for opening balance correctly if stored
        // Assuming stored values are just numbers, positive = Dr (Receivable), Negative = Cr (Payable)?? 
        // Or we just use strict Dr/Cr columns.
        // Let's assume standard accounting: Asset (Customer) -> Debit is positive.

        const processed = transactions.map(txn => {
            let metalDr = 0, metalCr = 0;
            let cashDr = 0, cashCr = 0;

            // Logic varies by type
            if (txn.type === 'Sales') {
                // Sales to Party: Party is Receiver (Dr)
                // Metal: Party owes metal (Dr)
                // Cash: Party owes cash (if any labour/other charges) (Dr)
                metalDr = txn.items.reduce((acc, item) => acc + (item.fineWeight || 0), 0);
                cashDr = txn.totalAmount; // Labour/Other charges
            } else if (txn.type === 'Purchase') {
                // Purchase from Party: Party is Giver (Cr)
                metalCr = txn.items.reduce((acc, item) => acc + (item.fineWeight || 0), 0);
                cashCr = txn.totalAmount;
            } else if (txn.type === 'Receipt') {
                // Received from Party: Party is Giver (Cr)
                // Usually Cash or Metal received
                if (txn.cashReceived > 0) cashCr = txn.cashReceived;
                // If metal received? (Not in current voucher structure directly, maybe via "Items" in receipt voucher?)
                // Assuming Receipt Voucher follows same structure or uses specific fields
            } else if (txn.type === 'Issue') {
                // Open Issue to Karigar? 
                // Party (Karigar) is Dr.
                metalDr = txn.items.reduce((acc, item) => acc + (item.fineWeight || 0), 0);
            }

            // Bhav Cutting:
            // Converting Metal to Cash.
            // If Party sells metal to us (Purchaseish): Metal Cr, Cash Dr (We owe them cash).
            // Logic depends on who initiated. 
            // Let's rely on `bhavCuttingWeight` and `bhavCuttingAmount`.
            // Assumption: Bhav Cutting in a Voucher implies adjusting that voucher's party.
            if (txn.bhavCuttingWeight > 0) {
                // Usually means converting Metal Credit to Cash Credit?
                // Or Party giving Metal to get Cash.
                // This is complex without strict business rules.
                // Placeholder: If Weight is positive, reducing Metal Balance?
            }

            // Update Running Balances
            metalBal = metalBal + metalDr - metalCr;
            cashBal = cashBal + cashDr - cashCr;

            return {
                ...txn,
                metalDr,
                metalCr,
                metalBal,
                cashDr,
                cashCr,
                cashBal
            };
        });

        setProcessedTransactions(processed);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold font-serif text-gray-900">Party Ledger</h1>
                    <select
                        value={selectedParty}
                        onChange={(e) => setSelectedParty(e.target.value)}
                        className="border rounded-lg p-2 min-w-[250px] focus:ring-2 focus:ring-primary-500 outline-none"
                    >
                        <option value="">Select Party Account</option>
                        {parties.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-primary-600 border rounded-lg"><Printer size={20} /></button>
                    <button className="p-2 text-gray-500 hover:text-green-600 border rounded-lg"><Download size={20} /></button>
                </div>
            </div>

            {selectedParty && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between">
                        <div>
                            <span className="font-bold text-gray-700">Opening Balance:</span>
                            <span className="ml-2 text-sm">
                                Metal: {ledgerData?.party?.openingBalance?.metal?.weight} |
                                Cash: {ledgerData?.party?.openingBalance?.amount?.value}
                            </span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-100 text-gray-700 font-bold font-serif border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Particulars</th>
                                    <th className="px-4 py-3">Vch Type</th>
                                    <th className="px-4 py-3 text-center border-l border-gray-300" colSpan="3">Metal (Fine Wt)</th>
                                    <th className="px-4 py-3 text-center border-l border-gray-300" colSpan="3">Amount (Cash)</th>
                                </tr>
                                <tr className="text-xs uppercase bg-gray-50">
                                    <th colSpan="3"></th>

                                    <th className="px-2 py-1 text-right border-l">Debit</th>
                                    <th className="px-2 py-1 text-right">Credit</th>
                                    <th className="px-2 py-1 text-right font-bold text-primary-800">Balance</th>

                                    <th className="px-2 py-1 text-right border-l">Debit</th>
                                    <th className="px-2 py-1 text-right">Credit</th>
                                    <th className="px-2 py-1 text-right font-bold text-green-800">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {processedTransactions.map((txn) => (
                                    <tr key={txn._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2">{new Date(txn.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-2 text-gray-600">{txn.narration || '-'}</td>
                                        <td className="px-4 py-2"><span className="px-2 py-0.5 rounded text-xs bg-slate-100 border">{txn.type}</span></td>

                                        <td className="px-2 py-2 text-right border-l text-gray-600">{txn.metalDr ? txn.metalDr.toFixed(3) : '-'}</td>
                                        <td className="px-2 py-2 text-right text-gray-600">{txn.metalCr ? txn.metalCr.toFixed(3) : '-'}</td>
                                        <td className="px-2 py-2 text-right font-medium text-primary-700">{txn.metalBal.toFixed(3)}</td>

                                        <td className="px-2 py-2 text-right border-l text-gray-600">{txn.cashDr ? txn.cashDr.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-2 text-right text-gray-600">{txn.cashCr ? txn.cashCr.toFixed(2) : '-'}</td>
                                        <td className="px-2 py-2 text-right font-medium text-green-700">{txn.cashBal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!selectedParty && (
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Select a party to view their ledger</p>
                </div>
            )}
        </div>
    );
};

export default Ledger;
