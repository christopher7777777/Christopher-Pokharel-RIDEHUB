import { useState, useEffect } from 'react';
import SellerLayout from '../../components/layout/SellerLayout';
import api from '../../utils/api';
import {
    Package,
    Clock,
    CheckCircle2,
    XCircle,
    DollarSign,
    Search,
    ArrowUpRight,
    Loader2,
    Upload,
    Banknote,
    QrCode,
    CreditCard
} from 'lucide-react';

const SellerPurchaseHub = () => {
    const [activeTab, setActiveTab] = useState('Pending Review');
    const [searchQuery, setSearchQuery] = useState('');
    const [buyRequests, setBuyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [negotiationData, setNegotiationData] = useState({ price: 0, note: '' });
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({ message: '', screenshot: null });
    const [selectedBike, setSelectedBike] = useState(null);
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrImageUrl, setQrImageUrl] = useState('');

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

    const handleCompletePayment = async () => {
        try {
            const formData = new FormData();
            formData.append('paymentMessage', paymentData.message);
            if (paymentData.screenshot) {
                formData.append('paymentScreenshot', paymentData.screenshot);
            }

            await api.put(`/api/bikes/complete-payment/${selectedBike._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowPaymentModal(false);
            setPaymentData({ message: '', screenshot: null });
            setSelectedBike(null);

            // Show success message
            alert('✅ Payment Successful!\n\nThe bike purchase is complete. The seller will be notified and you can arrange pickup/delivery as per your payment message.');

            fetchRequests();
        } catch (err) {
            alert('Payment completion failed: ' + (err.response?.data?.message || err.message));
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
                    {['All', 'Pending Review', 'Negotiating', 'Countered', 'Approved', 'Purchased', 'Rejected'].map((tab) => (
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
                                                    <p className="font-black text-gray-900 text-xs">Rs {request.price.toLocaleString()}</p>
                                                </div>
                                                <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-100/50">
                                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Last Offer</p>
                                                    <p className={`font-black text-xs ${request.negotiatedPrice > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                                                        {request.negotiatedPrice > 0 ? `Rs ${request.negotiatedPrice.toLocaleString()}` : 'No offer yet'}
                                                    </p>
                                                </div>
                                            </div>

                                            {request.status === 'Countered' && (
                                                <div className="mb-4 p-3 bg-pink-50 border border-pink-100 rounded-2xl">
                                                    <p className="text-[9px] text-pink-500 font-black uppercase tracking-widest mb-1">User&apos;s Counter Price</p>
                                                    <p className="font-black text-pink-700">Rs {request.userCounterPrice?.toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional bike info */}
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
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rs</span>
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
                                        {request.status === 'Approved' && request.userConfirmed && (
                                            <div className="space-y-3">
                                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Payment Method</p>
                                                    <div className="flex items-center gap-2">
                                                        {request.paymentMethod === 'Cash' && <Banknote size={16} className="text-blue-600" />}
                                                        {request.paymentMethod === 'QR' && <QrCode size={16} className="text-blue-600" />}
                                                        {request.paymentMethod === 'Bank Transfer' && <CreditCard size={16} className="text-blue-600" />}
                                                        <span className="font-black text-blue-700 text-sm">{request.paymentMethod}</span>
                                                    </div>
                                                    {request.userBankDetails && (
                                                        <div className="mt-3 p-3 bg-white rounded-xl">
                                                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Bank Details</p>
                                                            <p className="text-[10px] text-gray-700 font-medium whitespace-pre-line">{request.userBankDetails}</p>
                                                        </div>
                                                    )}
                                                    {request.userQrImage && (
                                                        <div className="mt-3">
                                                            <p className="text-[8px] font-black text-gray-400 uppercase mb-2">User's QR Code</p>
                                                            <div
                                                                className="w-32 h-32 cursor-pointer hover:opacity-80 transition-opacity relative group"
                                                                onClick={() => {
                                                                    setQrImageUrl(request.userQrImage);
                                                                    setShowQrModal(true);
                                                                }}
                                                            >
                                                                <img
                                                                    src={request.userQrImage}
                                                                    alt="QR Code"
                                                                    className="w-full h-full object-contain bg-white rounded-xl border border-gray-200 p-2"
                                                                />
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl flex items-center justify-center transition-all">
                                                                    <p className="text-[8px] font-black text-white opacity-0 group-hover:opacity-100 bg-black/50 px-2 py-1 rounded">Click to enlarge</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setSelectedBike(request);
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="w-full bg-green-600 text-white px-4 py-3 rounded-xl font-black text-[10px] hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                                >
                                                    <Upload size={14} /> COMPLETE PAYMENT
                                                </button>
                                            </div>
                                        )}
                                        {request.status === 'Purchased' && (
                                            <div className="space-y-3">
                                                <div className="bg-green-600 text-white p-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-green-900/10">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">PURCHASE COMPLETE</span>
                                                </div>
                                                {request.paymentMessage && (
                                                    <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                                                        <p className="text-[9px] font-black text-green-400 uppercase tracking-widest mb-2">Delivery/Payment Details</p>
                                                        <p className="text-sm text-green-900 font-medium leading-relaxed">{request.paymentMessage}</p>
                                                    </div>
                                                )}
                                                {request.paymentScreenshot && (
                                                    <div className="bg-white border border-gray-100 p-3 rounded-2xl">
                                                        <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Payment Proof</p>
                                                        <img
                                                            src={request.paymentScreenshot}
                                                            alt="Payment Screenshot"
                                                            className="w-full h-auto rounded-xl border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(request.paymentScreenshot, '_blank')}
                                                        />
                                                    </div>
                                                )}
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
                        <h3 className="text-xl font-black text-gray-900 mb-2">
                            {activeTab === 'Purchased' ? 'No completed purchases yet' : `No ${activeTab.toLowerCase()} requests`}
                        </h3>
                        <p className="text-gray-400 max-w-sm mx-auto italic text-sm">
                            {activeTab === 'Purchased'
                                ? 'Bikes you have successfully purchased will appear here with payment details and delivery information.'
                                : 'When users list their bikes for sale, they will appear here for your review.'}
                        </p>
                    </div>
                )}

                {/* Payment Completion Modal */}
                {showPaymentModal && selectedBike && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowPaymentModal(false)}></div>
                        <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn">
                            <div className="p-8 text-center border-b border-gray-50">
                                <h2 className="text-2xl font-black text-gray-900 mb-2">Complete Payment</h2>
                                <p className="text-sm text-gray-500 italic">Upload proof and finalize the transaction</p>
                            </div>

                            <div className="p-8 space-y-4">
                                <div className="bg-gray-50 p-4 rounded-2xl">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Transaction Details</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedBike.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">Amount: Rs {selectedBike.negotiatedPrice?.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">Method: {selectedBike.paymentMethod}</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Screenshot (Optional)</p>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setPaymentData({ ...paymentData, screenshot: e.target.files[0] })}
                                            accept="image/*"
                                        />
                                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-orange-500 transition-colors">
                                            <Upload size={32} className="text-gray-300 group-hover:text-orange-600" />
                                            <p className="text-xs font-bold text-gray-400">{paymentData.screenshot ? paymentData.screenshot.name : 'Click to upload proof'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Message to User</p>
                                    <textarea
                                        placeholder="E.g., 'Payment sent via bank transfer' or 'Will pay cash on collection tomorrow at 2 PM'"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-sm font-medium leading-relaxed"
                                        rows="3"
                                        value={paymentData.message}
                                        onChange={(e) => setPaymentData({ ...paymentData, message: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-8 bg-gray-50 flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowPaymentModal(false);
                                        setPaymentData({ message: '', screenshot: null });
                                    }}
                                    className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                    onClick={handleCompletePayment}
                                    disabled={!paymentData.message}
                                >
                                    MARK AS PAID
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* QR viewer modal */}
                {showQrModal && qrImageUrl && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowQrModal(false)}>
                        <div className="relative bg-white rounded-[40px] shadow-2xl overflow-hidden max-w-lg w-full animate-zoomIn" onClick={(e) => e.stopPropagation()}>
                            <div className="p-6 text-center border-b border-gray-100">
                                <h2 className="text-2xl font-black text-gray-900 mb-1">Scan QR Code</h2>
                                <p className="text-xs text-gray-500 italic">Use your payment app to scan</p>
                            </div>

                            <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                                <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-orange-100">
                                    <img
                                        src={qrImageUrl}
                                        alt="QR Code for Payment"
                                        className="w-72 h-72 object-contain"
                                    />
                                </div>
                                <p className="mt-6 text-xs text-gray-400 font-bold uppercase tracking-widest">Point your camera here</p>
                            </div>

                            <div className="p-6 bg-gray-50 flex justify-center">
                                <button
                                    onClick={() => setShowQrModal(false)}
                                    className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerPurchaseHub;
