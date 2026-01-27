import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import api from '../../utils/api';
import {
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Wallet,
    ArrowRight,
    ShieldCheck,
    MessageSquare,
    QrCode,
    Banknote,
    Loader2,
    Package
} from 'lucide-react';

const UserSellingStatus = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCounterModal, setShowCounterModal] = useState(false);
    const [counterPrice, setCounterPrice] = useState('');
    const [selectedPayment, setSelectedPayment] = useState('Cash');
    const [bankDetails, setBankDetails] = useState('');
    const [qrFile, setQrFile] = useState(null);

    useEffect(() => {
        fetchMySales();
    }, []);

    const fetchMySales = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bikes/my-listings');
            const sales = response.data.data.filter(bike => bike.listingType === 'Sale' || bike.listingType === 'Purchase');
            setListings(sales);
            if (sales.length > 0) {
                // Keep selected listing if it still exists
                const current = sales.find(s => s._id === selectedListing?._id);
                setSelectedListing(current || sales[0]);
            }
        } catch (err) {
            console.error('Failed to fetch sales', err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSale = async () => {
        try {
            const formData = new FormData();
            formData.append('paymentMethod', selectedPayment);
            if (selectedPayment === 'Bank Transfer') {
                formData.append('userBankDetails', bankDetails);
            }
            if (selectedPayment === 'QR' && qrFile) {
                formData.append('userQrImage', qrFile);
            }

            await api.put(`/api/bikes/confirm-sale/${selectedListing._id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setShowPaymentModal(false);
            fetchMySales();
        } catch (err) {
            alert('Confirmation failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCounterOffer = async () => {
        if (!counterPrice || isNaN(counterPrice)) return;
        try {
            await api.put(`/api/bikes/counter-offer/${selectedListing._id}`, {
                userCounterPrice: Number(counterPrice)
            });
            setShowCounterModal(false);
            setCounterPrice('');
            fetchMySales();
        } catch (err) {
            alert('Counter offer failed');
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Pending Review': return { label: 'In Review', color: 'text-orange-500', bg: 'bg-orange-50' };
            case 'Negotiating': return { label: 'Offer Received', color: 'text-blue-500', bg: 'bg-blue-50' };
            case 'Countered': return { label: 'Waiting for Dealer', color: 'text-pink-500', bg: 'bg-pink-50' };
            case 'Approved': return { label: 'Ready for Sale', color: 'text-green-500', bg: 'bg-green-50' };
            case 'Purchased': return { label: 'Sold', color: 'text-purple-500', bg: 'bg-purple-50' };
            case 'Rejected': return { label: 'Rejected', color: 'text-red-500', bg: 'bg-red-50' };
            default: return { label: status || 'Unknown', color: 'text-gray-500', bg: 'bg-gray-50' };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-orange-600" size={48} />
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="pt-32 pb-20 px-4 text-center">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                        <Package className="text-gray-200" size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-2">No active bike sales</h2>
                    <p className="text-gray-500 mb-8 italic">You haven't listed any bikes for sale yet.</p>
                    <a href="/sell" className="inline-block bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-orange-700 transition-all">
                        LIST A BIKE NOW
                    </a>
                </main>
                <Footer />
            </div>
        );
    }

    const listing = selectedListing;
    const statusInfo = getStatusInfo(listing.status);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {listings.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
                            {listings.map(l => (
                                <button
                                    key={l._id}
                                    onClick={() => setSelectedListing(l)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${selectedListing?._id === l._id ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    {l.name}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 mb-8 animate-fadeIn">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-orange-100 shadow-sm">
                                    <img src={listing.images[0] || 'https://via.placeholder.com/400'} alt={listing.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h1 className="text-2xl font-black text-gray-900">{listing.name}</h1>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusInfo.bg} ${statusInfo.color} border border-current/10`}>
                                            {statusInfo.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Ref ID: {listing._id.slice(-8).toUpperCase()}</p>
                                </div>
                            </div>
                            <div className="text-left md:text-right">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">
                                    {listing.status === 'Countered' ? "Your Counter Price" : "Current Dealer Offer"}
                                </p>
                                <p className={`text-3xl font-black ${listing.status === 'Countered' ? 'text-pink-600' : 'text-orange-600'}`}>
                                    NPR {listing.status === 'Countered' ? listing.userCounterPrice?.toLocaleString() : (listing.negotiatedPrice > 0 ? listing.negotiatedPrice.toLocaleString() : '--')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center gap-2">
                                    <Clock size={20} className="text-orange-600" /> Sale Progress
                                </h3>
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-100"></div>
                                    <div className="space-y-8">
                                        {[
                                            { label: 'Listed', completed: true, date: new Date(listing.createdAt).toLocaleDateString() },
                                            { label: 'Reviewing', completed: true, date: 'Completed' },
                                            { label: 'Price Negotiation', completed: listing.negotiatedPrice > 0 || listing.status === 'Countered', date: listing.status === 'Countered' ? 'Countered' : (listing.negotiatedPrice > 0 ? 'Offer Received' : 'Waiting') },
                                            { label: 'Completion', completed: listing.status === 'Purchased', date: listing.status === 'Purchased' ? 'Sold' : 'Waiting' },
                                        ].map((item, idx) => (
                                            <div key={idx} className="relative flex items-center gap-6 pl-10">
                                                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${item.completed ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white border-2 border-gray-200 text-gray-300'
                                                    }`}>
                                                    <CheckCircle2 size={16} />
                                                </div>
                                                <div>
                                                    <p className={`font-black text-sm uppercase tracking-wider ${item.completed ? 'text-gray-900' : 'text-gray-300'}`}>{item.label}</p>
                                                    <p className="text-xs text-gray-400 italic">{item.date}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {listing.dealerNote && (
                                <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8">
                                    <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                        <MessageSquare size={20} className="text-orange-600" /> Message from Dealer
                                    </h3>
                                    <div className="bg-orange-50 rounded-3xl p-6 border border-orange-100 text-sm text-gray-700 leading-relaxed italic">
                                        "{listing.dealerNote}"
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {(listing.status === 'Negotiating' || (listing.status === 'Approved' && !listing.userConfirmed)) && (
                                <div className="bg-gray-900 rounded-[40px] p-8 text-white shadow-2xl animate-slideInUp">
                                    <h3 className="text-xl font-black mb-6">Decision Center</h3>
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setShowPaymentModal(true)}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl shadow-orange-900/40 flex items-center justify-center gap-2 group"
                                        >
                                            {listing.status === 'Approved' ? 'CONFIRM DEAL' : 'ACCEPT DEALER OFFER'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                        {listing.status === 'Negotiating' && (
                                            <button
                                                onClick={() => setShowCounterModal(true)}
                                                className="w-full bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2"
                                            >
                                                <Banknote size={18} /> COUNTER OFFER
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {listing.status === 'Countered' && (
                                <div className="bg-pink-600 rounded-[40px] p-8 text-white shadow-xl animate-pulse">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                        <Clock size={24} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Countered</h3>
                                    <p className="text-xs text-pink-50 leading-relaxed">
                                        You've proposed NPR {listing.userCounterPrice?.toLocaleString()}. Waiting for the dealer to review and respond.
                                    </p>
                                </div>
                            )}

                            {listing.status === 'Approved' && listing.userConfirmed && (
                                <div className="bg-orange-600 rounded-[40px] p-8 text-white shadow-xl animate-pulse">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                        <Clock size={24} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Awaiting Payment</h3>
                                    <p className="text-xs text-orange-50 leading-relaxed">
                                        You've confirmed the deal via {listing.paymentMethod}. Waiting for the dealer to process your payment and upload proof.
                                    </p>
                                </div>
                            )}

                            {listing.status === 'Purchased' && (
                                <div className="bg-green-600 rounded-[40px] p-8 text-white shadow-xl animate-zoomIn">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-xl font-black mb-2">Sold Successfully!</h3>
                                    <p className="text-xs text-green-100 opacity-90 leading-relaxed">
                                        Your bike has been sold to the dealer for NPR {listing.negotiatedPrice.toLocaleString()}. Payment: {listing.paymentMethod} on delivery.
                                    </p>
                                </div>
                            )}

                            <div className="bg-white rounded-[40px] border border-gray-100 p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="text-green-600" size={24} />
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold uppercase leading-tight tracking-wider">
                                    Safe & Secure <br />
                                    <span className="text-gray-900">RIDEHUB VERIFIED</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Counter Offer Modal */}
            {showCounterModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowCounterModal(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn">
                        <div className="p-8 text-center border-b border-gray-50">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Make a Counter Offer</h2>
                            <p className="text-sm text-gray-500 italic text-xs">Enter your desired price to send back to the dealer</p>
                        </div>
                        <div className="p-8">
                            <div className="relative mb-6">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">NPR</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[25px] border-none focus:ring-2 focus:ring-orange-500 text-xl font-black transition-all"
                                    value={counterPrice}
                                    onChange={(e) => setCounterPrice(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowCounterModal(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
                                <button onClick={handleCounterOffer} className="flex-[2] bg-orange-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-900/20 hover:bg-orange-700 transition-all">SEND COUNTER</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sale Confirmation Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setShowPaymentModal(false)}></div>
                    <div className="relative bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn">
                        <div className="p-8 text-center border-b border-gray-50">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">How do you want to be paid?</h2>
                            <p className="text-sm text-gray-500 italic text-xs">Choose your preferred payment method</p>
                        </div>

                        <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'Cash', label: 'Cash on Collection', icon: <Banknote size={20} /> },
                                    { id: 'QR', label: 'Scan & Pay (QR Code)', icon: <QrCode size={20} /> },
                                    { id: 'Bank Transfer', label: 'Direct Bank Transfer', icon: <CreditCard size={20} /> }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setSelectedPayment(method.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${selectedPayment === method.id ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPayment === method.id ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                            {method.icon}
                                        </div>
                                        <span className={`font-bold text-sm ${selectedPayment === method.id ? 'text-gray-900' : 'text-gray-500'}`}>{method.label}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedPayment === 'QR' && (
                                <div className="mt-6 animate-fadeIn">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Upload your QR Code</p>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            onChange={(e) => setQrFile(e.target.files[0])}
                                            accept="image/*"
                                        />
                                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 group-hover:border-orange-500 transition-colors">
                                            <QrCode size={32} className="text-gray-300 group-hover:text-orange-600" />
                                            <p className="text-xs font-bold text-gray-400">{qrFile ? qrFile.name : 'Click to upload QR image'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedPayment === 'Bank Transfer' && (
                                <div className="mt-6 animate-fadeIn">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Bank Account Details</p>
                                    <textarea
                                        placeholder="Enter Bank Name, Account Number, and Account Name..."
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 text-sm font-medium leading-relaxed"
                                        rows="3"
                                        value={bankDetails}
                                        onChange={(e) => setBankDetails(e.target.value)}
                                    ></textarea>
                                </div>
                            )}

                            <p className="text-[10px] text-gray-400 text-center italic mt-4 font-medium">
                                * RideHub ensures safe transactions. The dealer will process the payment based on your selection.
                            </p>
                        </div>

                        <div className="p-8 bg-gray-50 flex gap-4">
                            <button
                                onClick={() => setShowPaymentModal(false)}
                                className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
                            >
                                Back
                            </button>
                            <button
                                className="flex-[2] py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all bg-orange-600 text-white shadow-orange-900/20 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleConfirmSale}
                                disabled={(selectedPayment === 'QR' && !qrFile) || (selectedPayment === 'Bank Transfer' && !bankDetails)}
                            >
                                CONFIRM DEAL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default UserSellingStatus;
