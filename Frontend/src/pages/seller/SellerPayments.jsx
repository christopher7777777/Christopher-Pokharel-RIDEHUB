import React, { useState, useEffect } from 'react';
import SellerLayout from '../../components/layout/SellerLayout';
import api from '../../utils/api';
import {
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    ExternalLink,
    CalendarDays
} from 'lucide-react';

const SellerPayments = () => {
    const formatDate = (dateStr) => {
        if (!dateStr) return 'Pending';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'Pending';
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'Pending' : date.toLocaleString();
    };
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [stats, setStats] = useState({
        totalRentalIncome: 0,
        totalPayout: 0,
        grandTotalIncome: 0
    });

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const [myListingsRes, saleRequestsRes] = await Promise.all([
                api.get('/api/bikes/my-listings'),
                api.get('/api/bikes/sale-requests')
            ]);

            const listings = myListingsRes.data.data || [];
            const requests = saleRequestsRes.data.data || [];

            const processedData = [];

            // Process Rental and Sale Income
            listings.forEach(bike => {
                if (bike.status === 'Rented' || bike.status === 'Purchased' || bike.status === 'Approved') {
                    processedData.push({
                        id: bike._id,
                        bikeName: bike.name,
                        user: bike.rentedBy?.name || (bike.status === 'Rented' ? 'Renter' : 'Buyer'),
                        amount: bike.totalAmount || bike.negotiatedPrice || bike.price,
                        bookPrice: bike.price,
                        paidPrice: bike.negotiatedPrice || bike.price,
                        type: bike.status === 'Rented' ? 'Rental Income' : 'Sale Income',
                        method: bike.paymentMethod || (bike.status === 'Rented' ? 'Portal' : 'Bank Transfer'),
                        status: (bike.status === 'Purchased' || bike.status === 'Rented') ? 'Completed' : 'Pending',
                        date: bike.updatedAt || bike.createdAt,
                        proof: bike.paymentScreenshot,
                        isIncoming: true,
                        isExchange: bike.isExchange,
                        exchangeValuation: bike.exchangeValuation
                    });
                }
            });

            // Process Payouts (Dealer buying bikes)
            requests.forEach(req => {
                if (req.status === 'Purchased' || (req.status === 'Approved' && req.userConfirmed)) {
                    processedData.push({
                        id: req._id,
                        bikeName: req.name,
                        user: req.seller?.name || 'User',
                        amount: req.totalAmount || req.negotiatedPrice || req.price,
                        bookPrice: req.price, // Original bike price from user
                        paidPrice: req.negotiatedPrice || req.price, // Final price paid to user
                        type: req.status === 'Purchased' ? 'Bike Purchase' : 'Pending Buy',
                        method: req.paymentMethod || (req.status === 'Purchased' ? 'Bank Transfer' : 'Pending'),
                        status: req.status === 'Purchased' ? 'Completed' : 'Pending',
                        date: req.updatedAt || req.createdAt,
                        proof: req.paymentScreenshot,
                        isIncoming: false,
                        isExchange: req.isExchange,
                        exchangeValuation: req.exchangeValuation
                    });
                }
            });

            processedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(processedData);

            // Calculate card stats
            const rentalIncome = processedData.filter(t => t.isIncoming && t.status === 'Completed' && t.type === 'Rental Income').reduce((acc, t) => acc + (t.amount || 0), 0);
            const income = processedData.filter(t => t.isIncoming && t.status === 'Completed').reduce((acc, t) => acc + (t.amount || 0), 0);
            const payout = processedData.filter(t => !t.isIncoming && t.status === 'Completed').reduce((acc, t) => acc + (t.amount || 0), 0);
            const pendingIncome = processedData.filter(t => t.isIncoming && t.status === 'Pending').reduce((acc, t) => acc + (t.amount || 0), 0);

            setStats({
                totalRentalIncome: rentalIncome,
                totalPayout: payout,
                grandTotalIncome: income + pendingIncome
            });

        } catch (err) {
            console.error('Failed to fetch financial data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const filtered = transactions.filter(t => {
        const matchesSearch = t.bikeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.user.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'All' ||
            (filterType === 'Income' && t.isIncoming) ||
            (filterType === 'Payout' && !t.isIncoming);
        return matchesSearch && matchesType;
    });

    return (
        <SellerLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 uppercase">Payments & Financials</h1>
                    <p className="text-slate-500 italic">Manage your earnings and inventory spending.</p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-hover hover:shadow-lg">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                            <ArrowDownLeft size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Rental Income</p>
                        <h3 className="text-2xl font-black text-slate-800">Rs {stats.totalRentalIncome.toLocaleString()}</h3>
                        <div className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1 italic">
                            <CheckCircle2 size={14} /> Completed Rentals
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-hover hover:shadow-lg">
                        <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4">
                            <ArrowUpRight size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Acquisitions</p>
                        <h3 className="text-2xl font-black text-slate-800">Rs {stats.totalPayout.toLocaleString()}</h3>
                        <div className="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1 italic">
                            <Clock size={14} /> Stock Purchases
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-hover hover:shadow-lg">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-xl font-black">Rs</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Income</p>
                        <h3 className="text-2xl font-black text-slate-800">Rs {stats.grandTotalIncome.toLocaleString()}</h3>
                        <div className="text-xs text-blue-600 font-bold mt-2 italic">Lifetime Earnings</div>
                    </div>
                </div>

                {/* Main Table Container */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-tight">Recent Transactions</h4>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-slate-50 border-none rounded-2xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none w-48 sm:w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex bg-slate-50 p-1 rounded-2xl">
                                {['All', 'Income', 'Payout'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${filterType === t ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin text-orange-600" size={40} />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Financials...</p>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="py-20 text-center text-slate-400">
                                <CreditCard className="mx-auto mb-4 opacity-20" size={48} />
                                <p className="font-black uppercase text-sm tracking-widest">No Transactions Found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset / User</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Price</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Exchange</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Price</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filtered.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                            onClick={() => setSelectedTransaction(item)}
                                        >
                                            <td className="px-6 py-4 text-[11px] font-mono font-black text-slate-400 uppercase">
                                                #{item.id.slice(-8)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-lg">🏍️</div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 uppercase leading-none">{item.bikeName}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{item.user}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-600 italic">Rs {item.bookPrice?.toLocaleString()}</td>
                                            <td className="px-6 py-4 font-black text-orange-600">
                                                {item.isExchange ? `Rs ${item.exchangeValuation?.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4 font-black text-slate-800">Rs {item.paidPrice?.toLocaleString()}</td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${item.isIncoming ? 'text-green-600' : 'text-orange-600'}`}>
                                                    {item.isIncoming ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                                                    {item.type}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs font-bold text-slate-400 italic">
                                                {formatDate(item.date)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Transaction Modal */}
            {selectedTransaction && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
                        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Payment Detail</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Transaction #{selectedTransaction.id}</p>
                            </div>
                            <button onClick={() => setSelectedTransaction(null)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all border border-slate-100">
                                <XCircle size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 col-span-2">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Book Price</p>
                                    <p className="text-xl font-black text-slate-600">Rs {selectedTransaction.bookPrice?.toLocaleString()}</p>
                                </div>
                                {selectedTransaction.isExchange && (
                                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 col-span-2 flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Exchange Valuation (-)</p>
                                            <p className="text-xl font-black text-orange-600">Rs {selectedTransaction.exchangeValuation?.toLocaleString()}</p>
                                        </div>
                                        <div className="bg-orange-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase">Exchanged</div>
                                    </div>
                                )}
                                <div className="p-4 bg-green-50 rounded-2xl border border-green-100 col-span-2">
                                    <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">Final Paid Price</p>
                                    <p className="text-2xl font-black text-green-800">Rs {selectedTransaction.paidPrice?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    ['Bike', selectedTransaction.bikeName],
                                    ['User', selectedTransaction.user],
                                    ['Method', selectedTransaction.method],
                                    ['Date', formatDateTime(selectedTransaction.date)]
                                ].map(([label, value]) => (
                                    <div key={label} className="flex justify-between items-center text-sm font-bold border-b border-slate-50 pb-4 last:border-0 uppercase">
                                        <span className="text-slate-400 text-[10px] tracking-widest">{label}</span>
                                        <span className="text-slate-800 truncate ml-4">{value}</span>
                                    </div>
                                ))}
                            </div>

                            {selectedTransaction.proof ? (
                                <div className="relative group rounded-3xl overflow-hidden border border-slate-100">
                                    <img src={selectedTransaction.proof} alt="Payment Proof" className="w-full h-48 object-cover" />
                                    <a
                                        href={selectedTransaction.proof}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                                    >
                                        <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2">
                                            <ExternalLink size={14} /> View Full
                                        </span>
                                    </a>
                                </div>
                            ) : (
                                <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Attachment Available</p>
                                </div>
                            )}
                        </div>
                        <div className="p-8 bg-slate-50">
                            <button
                                onClick={() => setSelectedTransaction(null)}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
};

export default SellerPayments;
