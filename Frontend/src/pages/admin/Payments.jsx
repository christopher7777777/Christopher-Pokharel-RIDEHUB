import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Search, Download } from 'lucide-react';

const Payments = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayouts: 0,
        commissionEarned: 0
    });

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Payments & Financials</h1>
                        <p className="text-slate-500">Track all earnings, payouts, and system fees.</p>
                    </div>
                    <button className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
                        <Download size={18} />
                        EXPORT CSV
                    </button>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                            <CreditCard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Total System Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">Rs. {stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                            <ArrowUpRight size={14} /> +0% from last month
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                            <ArrowUpRight size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Pending Payouts</p>
                        <h3 className="text-2xl font-bold text-slate-800">Rs. {stats.pendingPayouts.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-2 italic">Scheduled for verification</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <Clock size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Commission Earned</p>
                        <h3 className="text-2xl font-bold text-slate-800">Rs. {stats.commissionEarned.toLocaleString()}</h3>
                        <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1">
                            <ArrowUpRight size={14} /> 5% fee on all sales
                        </p>
                    </div>
                </div>

                {/* Transaction List */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800">Recent Transactions</h4>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Transaction ID</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">User/Entity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Amount</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {transactions.map((trx) => (
                                    <tr key={trx.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-slate-600">{trx.id}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{trx.user}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">{trx.amount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-xs font-bold">
                                                {trx.type === 'Payout' ? (
                                                    <span className="text-orange-600 flex items-center gap-1">
                                                        <ArrowUpRight size={14} /> PAYOUT
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <ArrowDownLeft size={14} /> {trx.type.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${trx.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                trx.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                                }`}>
                                                {trx.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-500 font-medium">{trx.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Payments;
