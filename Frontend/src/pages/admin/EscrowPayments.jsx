import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../utils/api';
import { 
    Clock, 
    CheckCircle2, 
    AlertCircle, 
    Search, 
    Loader2, 
    ExternalLink, 
    CreditCard,
    ArrowUpRight,
    ArrowDownLeft,
    User,
    Bike,
    Smartphone,
    Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EscrowPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [releasing, setReleasing] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPayment, setSelectedPayment] = useState(null);

    const fetchPendingPayments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/escrow-payments');
            setPayments(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch escrow payments:', err);
            toast.error('Failed to load pending payments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const handleRelease = async (paymentId) => {
        if (!window.confirm('Are you sure you want to release this payment to the seller? 10% commission will be deducted.')) return;
        
        try {
            setReleasing(paymentId);
            const res = await api.post(`/api/admin/release-payment/${paymentId}`);
            toast.success(res.data.message || 'Payment released successfully!');
            fetchPendingPayments();
            setSelectedPayment(null);
        } catch (err) {
            console.error('Failed to release payment:', err);
            toast.error(err.response?.data?.message || 'Failed to release payment');
        } finally {
            setReleasing(null);
        }
    };

    const filteredPayments = payments.filter(p => 
        p.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.seller?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.bike?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Pending Escrow Payments</h1>
                        <p className="text-slate-500 italic">Review and release rental payments to sellers after platform commission.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-2xl border border-orange-100 flex items-center gap-2">
                            <Info size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">10% Platform Commission</span>
                        </div>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                            <Clock size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Amount</p>
                        <h3 className="text-2xl font-black text-slate-800">
                            Rs {payments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                        </h3>
                        <p className="text-xs text-slate-400 font-bold mt-2 italic">{payments.length} transactions waiting</p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                            <CreditCard size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expected Commission</p>
                        <h3 className="text-2xl font-black text-slate-800">
                            Rs {(payments.reduce((acc, p) => acc + p.amount, 0) * 0.1).toLocaleString()}
                        </h3>
                        <p className="text-xs text-green-600 font-bold mt-2 italic">10% of total pending</p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                            <Smartphone size={24} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Net to Sellers</p>
                        <h3 className="text-2xl font-black text-slate-800">
                            Rs {(payments.reduce((acc, p) => acc + p.amount, 0) * 0.9).toLocaleString()}
                        </h3>
                        <p className="text-xs text-purple-600 font-bold mt-2 italic">After platform fee</p>
                    </div>
                </div>

                {/* Main Table Container */}
                <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <h4 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                             <CheckCircle2 className="text-orange-600" size={20} /> VERIFICATION QUEUE
                        </h4>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by user, seller or bike..."
                                className="bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-3 text-sm focus:ring-2 focus:ring-orange-500/20 outline-none w-full sm:w-80 font-medium"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin text-orange-600" size={40} />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Fetching Escrow Queue...</p>
                            </div>
                        ) : filteredPayments.length === 0 ? (
                            <div className="py-24 text-center">
                                <AlertCircle className="mx-auto mb-4 text-slate-200" size={64} />
                                <p className="font-black uppercase text-slate-400 text-sm tracking-widest">No pending releases found</p>
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rental Asset</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parties Involved</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Amount</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Seller Account</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPayments.map((p) => (
                                        <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-lg shadow-sm">🏍️</div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 uppercase leading-none">{p.bike?.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{p.bike?.model} • {p.bike?.brand}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase">User</span>
                                                        <span className="text-xs font-bold text-slate-700">{p.user?.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded uppercase">Seller</span>
                                                        <span className="text-xs font-bold text-slate-700">{p.seller?.name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div>
                                                    <p className="text-sm font-black text-slate-800">Rs {p.amount?.toLocaleString()}</p>
                                                    <p className="text-[9px] text-green-600 font-black uppercase tracking-tighter">Paid via {p.method}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {p.seller?.esewaId ? (
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <Smartphone size={14} className="text-slate-400" />
                                                        <span className="text-xs font-mono font-bold uppercase">{p.seller.esewaId}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1">
                                                        <AlertCircle size={12} /> Account Missing
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-slate-400 italic">
                                                    {formatDate(p.createdAt)}
                                                </p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => setSelectedPayment(p)}
                                                    className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-slate-100"
                                                >
                                                    <ExternalLink size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Release Confirmation Modal */}
            {selectedPayment && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden animate-slideUp">
                        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
                            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Escrow Release Review</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Transaction #{selectedPayment._id.slice(-8)}</p>
                        </div>

                        <div className="p-10 space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} /> USER Information
                                    </h5>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase">{selectedPayment.user?.name}</p>
                                        <p className="text-xs text-slate-500 font-medium italic">{selectedPayment.user?.email}</p>
                                    </div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-6">
                                        <Bike size={14} /> Book Detail
                                    </h5>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase">{selectedPayment.bike?.name}</p>
                                        <p className="text-xs text-slate-500 font-medium uppercase">{selectedPayment.bike?.model} • {selectedPayment.bike?.brand}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} className="text-orange-600" /> SELLER Information
                                    </h5>
                                    <div>
                                        <p className="text-sm font-black text-slate-800 uppercase">{selectedPayment.seller?.name}</p>
                                        <p className="text-xs text-slate-500 font-medium italic mb-2">{selectedPayment.seller?.email}</p>
                                        {selectedPayment.seller?.esewaId ? (
                                            <div className="bg-orange-50 px-3 py-2 rounded-xl inline-flex items-center gap-2">
                                                <Smartphone size={12} className="text-orange-600" />
                                                <span className="text-[10px] font-black text-orange-900 font-mono">{selectedPayment.seller.esewaId}</span>
                                            </div>
                                        ) : (
                                            <div className="text-red-600 text-[10px] font-black uppercase flex items-center gap-1">
                                                <AlertCircle size={12} /> ACCOUNT MISSING
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Financial Breakdown */}
                            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <CreditCard size={100} />
                                </div>
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Execution Breakdown</h5>
                                <div className="space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-slate-400 uppercase">Gross Amount</span>
                                        <span className="font-black text-white">Rs {selectedPayment.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-4">
                                        <span className="font-bold text-orange-500 uppercase">Platform Fee (10%)</span>
                                        <span className="font-black text-orange-500">- Rs {(selectedPayment.amount * 0.1).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl border-t border-slate-800 pt-6 mt-4">
                                        <span className="font-black text-slate-400 uppercase tracking-tight">Seller Payout</span>
                                        <span className="text-3xl font-black text-green-400">Rs {(selectedPayment.amount * 0.9).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {!selectedPayment.seller?.esewaId && (
                                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="text-red-600 shrink-0" size={20} />
                                    <p className="text-[11px] text-red-700 font-bold leading-relaxed">
                                        CAUTION: This seller has not provided a valid eSewa ID. You cannot release funds until the seller updates their payout information in their dashboard.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="p-10 bg-slate-50 flex gap-4">
                            <button 
                                onClick={() => setSelectedPayment(null)}
                                className="flex-1 py-4 bg-white text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                            >
                                CLOSE
                            </button>
                            <button 
                                onClick={() => handleRelease(selectedPayment._id)}
                                disabled={!selectedPayment.seller?.esewaId || releasing}
                                className={`flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
                                    !selectedPayment.seller?.esewaId || releasing 
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                }`}
                            >
                                {releasing === selectedPayment._id ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <>RELEASE FUNDS <ArrowUpRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default EscrowPayments;
