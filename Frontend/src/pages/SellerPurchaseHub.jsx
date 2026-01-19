import React, { useState, useEffect } from 'react';
import SellerLayout from '../components/SellerLayout';
import api from '../utils/api';
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    MessageSquare,
    DollarSign,
    Search,
    Filter,
    ArrowUpRight,
    Loader2
} from 'lucide-react';

const SellerPurchaseHub = () => {
    const [activeTab, setActiveTab] = useState('Pending Review');
    const [searchQuery, setSearchQuery] = useState('');
    const [buyRequests, setBuyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [negotiationData, setNegotiationData] = useState({ price: 0, note: '' });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bikes/sale-requests');
            setBuyRequests(response.data.data);
        } catch (err) {
            console.error('Failed to fetch requests', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, offer = 0, note = '') => {
        try {
            await api.put(`/api/bikes/sale-status/${id}`, {
                status,
                negotiatedPrice: offer,
                dealerNote: note
            });
            setSelectedRequest(null);
            fetchRequests();
        } catch (err) {
            alert('Operation failed');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Review': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'Negotiating': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Countered': return 'bg-pink-100 text-pink-700 border-pink-200';
            case 'Approved': return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'Purchased': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const filteredRequests = buyRequests.filter(req =>
        (activeTab === 'All' || req.status === activeTab) &&
        (req.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <SellerLayout>
            <div className="animate-fadeIn">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Purchase Hub</h1>
                    <p className="text-gray-500 text-sm italic">Review and purchase bikes listed by users directly.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by bike name or user..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-2xl max-w-fit overflow-x-auto">
                    {['Pending Review', 'Negotiating', 'Countered', 'Approved', 'Purchased', 'Rejected'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-white text-orange-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-orange-600" size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredRequests.map((request) => (
                            <div key={request._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                <div className="flex flex-col h-full">
                                    <div className="flex flex-col sm:flex-row border-b border-gray-50">
                                        <div className="sm:w-48 h-48 relative overflow-hidden">
                                            <img
                                                src={request.images[0] || 'https://via.placeholder.com/400'}
                                                alt={request.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md shadow-lg ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex-1 p-6 text-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="text-lg font-black text-gray-900 mb-1">{request.name}</h3>
                                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider underline decoration-orange-600/30 underline-offset-4">
                                                        By {request.seller?.name || 'Unknown User'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mb-4">
                                                <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Asking Price</p>
                                                    <p className="font-black text-gray-900 text-xs">NPR {request.price.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Last Offer</p>
                                                    <p className={`font-black text-xs ${request.negotiatedPrice > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                                                        {request.negotiatedPrice > 0 ? `NPR ${request.negotiatedPrice.toLocaleString()}` : 'No offer yet'}
                                                    </p>
                                                </div>
                                            </div>

                                            {request.status === 'Countered' && (
                                                <div className="mb-4 p-3 bg-pink-50 border border-pink-100 rounded-2xl">
                                                    <p className="text-[9px] text-pink-500 font-black uppercase tracking-widest mb-1">User's Counter Price</p>
                                                    <p className="font-black text-pink-700">NPR {request.userCounterPrice?.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional info section: Documents & Specs */}
                                    <div className="px-6 py-4 bg-gray-50/30 flex items-center justify-between border-b border-gray-50">
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">Mileage</p>
                                                <p className="text-[10px] font-bold text-gray-700">{request.mileage} KM</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">Condition</p>
                                                <p className="text-[10px] font-bold text-gray-700">Grade {request.condition}</p>
                                            </div>
                                        </div>

                                        {request.bluebookImage && (
                                            <a
                                                href={request.bluebookImage}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-600 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
                                            >
                                                <ArrowUpRight size={12} /> BLUEBOOK
                                            </a>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="p-6 pt-4">
                                        {(request.status === 'Pending Review' || request.status === 'Negotiating' || request.status === 'Countered') && (
                                            <div className="flex gap-3">
                                                {selectedRequest === request._id ? (
                                                    <div className="flex-1 space-y-3 animate-slideIn">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">NPR</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="OFFER PRICE"
                                                                    className="w-full pl-12 pr-4 py-2 bg-white border border-orange-200 rounded-xl text-sm font-black focus:ring-2 focus:ring-orange-500/20 outline-none"
                                                                    value={negotiationData.price}
                                                                    onChange={(e) => setNegotiationData({ ...negotiationData, price: e.target.value })}
                                                                />
                                                            </div>
                                                            <button
                                                                onClick={() => handleAction(request._id, 'Negotiating', negotiationData.price, negotiationData.note)}
                                                                className="bg-orange-600 text-white p-2.5 rounded-xl hover:bg-orange-700 transition-all shadow-md active:scale-95"
                                                            >
                                                                <CheckCircle2 size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedRequest(null)}
                                                                className="bg-gray-100 text-gray-400 p-2.5 rounded-xl hover:bg-gray-200 transition-all"
                                                            >
                                                                <XCircle size={18} />
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="Add internal notes or message to user..."
                                                            className="w-full px-4 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-orange-500/20 outline-none"
                                                            value={negotiationData.note}
                                                            onChange={(e) => setNegotiationData({ ...negotiationData, note: e.target.value })}
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest(request._id);
                                                                setNegotiationData({ price: request.negotiatedPrice || request.price, note: '' });
                                                            }}
                                                            className="flex-1 bg-orange-600 text-white px-4 py-2.5 rounded-xl font-black text-[10px] hover:bg-orange-700 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                                        >
                                                            <DollarSign size={14} />
                                                            {request.status === 'Countered' ? 'RESPOND' : (request.status === 'Negotiating' ? 'RE-NEGOTIATE' : 'MAKE OFFER')}
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(request._id, 'Approved', request.negotiatedPrice || request.price, 'Approved for purchase.')}
                                                            className="px-4 py-2.5 bg-green-50 text-green-600 border border-green-100 rounded-xl font-black text-[10px] hover:bg-green-100 transition-all"
                                                        >
                                                            APPROVE
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(request._id, 'Rejected', 0, 'Not interested at this time.')}
                                                            className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 hover:text-red-600 transition-all"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        {request.status === 'Approved' && !request.userConfirmed && (
                                            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-center justify-center gap-3">
                                                <Clock className="text-yellow-600" size={16} />
                                                <span className="text-[10px] font-black text-yellow-700 uppercase tracking-widest">Awaiting User Confirmation</span>
                                            </div>
                                        )}
                                        {request.status === 'Purchased' && (
                                            <div className="bg-green-600 text-white p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-900/10">
                                                <CheckCircle2 size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">PURCHASE COMPLETE (CASH)</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredRequests.length === 0 && (
                    <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No buy requests found</h3>
                        <p className="text-gray-400 max-w-sm mx-auto italic text-sm">When users list their bikes for sale, they will appear here for your review.</p>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerPurchaseHub;
