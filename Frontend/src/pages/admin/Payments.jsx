import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { CreditCard, ArrowUpRight, ArrowDownLeft, Clock, Search, Download, Calendar } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const Payments = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingPayouts: 0,
        commissionEarned: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null
    });

    const fetchFinancials = async () => {
        try {
            setLoading(true);
            let url = '/api/admin/financials';
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate.toISOString());
            if (dateRange.endDate) params.append('endDate', dateRange.endDate.toISOString());
            
            if (params.toString()) url += `?${params.toString()}`;

            const response = await api.get(url);
            if (response.data.success) {
                setStats(response.data.data.stats);
                setTransactions(response.data.data.transactions);
            }
        } catch (error) {
            console.error('Error fetching financials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, [dateRange]);

    const exportToCSV = () => {
        if (transactions.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['Transaction ID', 'User/Entity', 'Amount (Rs)', 'Commission (Rs)', 'Type', 'Status', 'Date'];
        const csvRows = [
            headers.join(','),
            ...transactions.map(trx => [
                trx.id,
                `"${trx.user}"`,
                trx.amount,
                trx.commission,
                trx.type,
                trx.status,
                trx.date
            ].join(','))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ridehub_financials_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Report exported successfully');
    };

    const filteredTransactions = transactions.filter(trx => 
        trx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.user.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Payments & Financials</h1>
                        <p className="text-slate-500">Track all earnings, payouts, and system fees.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Date Filters */}
                        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors z-10" size={14} />
                                <DatePicker
                                    selected={dateRange.startDate}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, startDate: date }))}
                                    placeholderText="Start Date"
                                    className="pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold outline-none focus:bg-white focus:border-orange-500 transition-all w-32"
                                    maxDate={dateRange.endDate || new Date()}
                                />
                            </div>
                            <span className="text-slate-300 font-bold">—</span>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors z-10" size={14} />
                                <DatePicker
                                    selected={dateRange.endDate}
                                    onChange={(date) => setDateRange(prev => ({ ...prev, endDate: date }))}
                                    placeholderText="End Date"
                                    className="pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-100 text-xs font-bold outline-none focus:bg-white focus:border-orange-500 transition-all w-32"
                                    minDate={dateRange.startDate}
                                    maxDate={new Date()}
                                />
                            </div>
                            {(dateRange.startDate || dateRange.endDate) && (
                                <button 
                                    onClick={() => setDateRange({ startDate: null, endDate: null })}
                                    className="px-2 text-xs font-bold text-red-500 hover:text-red-600"
                                >
                                    CLEAR
                                </button>
                            )}
                        </div>

                        <button 
                            onClick={exportToCSV}
                            className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                            <Download size={18} />
                            EXPORT CSV
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                            <CreditCard size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Total System Revenue</p>
                        <h3 className="text-2xl font-bold text-slate-800">Rs {stats.totalRevenue.toLocaleString()}</h3>
                        <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                            <ArrowUpRight size={14} /> +0% from last month
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-4">
                            <ArrowUpRight size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Pending Payouts</p>
                        <h3 className="text-2xl font-bold text-slate-800">Rs {stats.pendingPayouts.toLocaleString()}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-2 italic">Scheduled for verification</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                            <Clock size={24} />
                        </div>
                        <p className="text-sm font-medium text-slate-500">Commission Earned</p>
                        <h3 className="text-2xl font-bold text-slate-800">Rs {stats.commissionEarned.toLocaleString()}</h3>
                        <p className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-1">
                            <ArrowUpRight size={14} /> 5% fee on all sales
                        </p>
                    </div>
                </div>

                {/* Transactions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h4 className="font-bold text-slate-800">Recent Transactions</h4>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
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
                                {filteredTransactions.length > 0 ? (
                                    filteredTransactions.map((trx) => (
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                                            No transactions found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Payments;
