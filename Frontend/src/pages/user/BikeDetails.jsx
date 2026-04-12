import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import {
    Bike as BikeIcon,
    Calendar,
    Gauge,
    Zap,
    ShieldCheck,
    Loader2,
    CheckCircle2,
    ArrowRightLeft,
    Clock,
    Tag,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    MessageSquare,
    Calculator,
    Star
} from 'lucide-react';
import BookingModal from '../../components/models/BookingModal';
import ExchangeModal from '../../components/models/ExchangeModal';
import EMICalculator from '../../components/emi/EMICalculator';
import FinanceModal from '../../components/emi/FinanceModal';
import EMIModal from '../../components/emi/EMIModal';

const BikeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
    const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
    const [selectedLoanDetails, setSelectedLoanDetails] = useState(null);
    const [isEMIModalOpen, setIsEMIModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);

    useEffect(() => {
        const fetchBike = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/bikes/${id}`);
                setBike(response.data.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch bike details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchReviews = async () => {
            try {
                setReviewsLoading(true);
                const response = await api.get(`/api/reviews/bike/${id}`);
                setReviews(response.data.data);
            } catch (err) {
                console.error('Failed to fetch reviews', err);
            } finally {
                setReviewsLoading(false);
            }
        };

        fetchBike();
        fetchReviews();
    }, [id]);

    const handleAction = () => {
        setIsBookingModalOpen(true);
    };

    const handleConfirmBooking = async (bookingData) => {
        try {
            setActionLoading(true);
            const endpoint = isBuyBike ? `/api/bikes/confirm-sale/${id}` : `/api/bikes/rent/${id}`;
            await api.put(endpoint, bookingData);

            const message = isBuyBike ? 'Bike Purchase Successful!' : 'Bike Rental Confirmed!';

            // Online payment logic
            if (bookingData.paymentMethod === 'Online') {
                setSuccessMessage('Initiating secure payment...');

                try {
                    // Call our initiation endpoint
                    const initResponse = await api.post('/api/payment/initiate', {
                        amount: bookingData.totalAmount,
                        productName: bike.name,
                        bikeId: bike._id,
                        bookingDetails: {
                            rentalPlan: bookingData.rentalPlan,
                            rentalDuration: bookingData.rentalDuration,
                            bookingDate: bookingData.bookingDate,
                            deliveryMethod: bookingData.deliveryMethod,
                            deliveryCharge: bookingData.deliveryCharge,
                            serviceDay: bookingData.serviceDay
                        }
                    });

                    if (initResponse.data.success) {
                        const { esewaConfig } = initResponse.data.data;

                        // Create a hidden form and submit it to eSewa
                        console.log('Redirecting to eSewa with config:', esewaConfig);

                        const form = document.createElement('form');
                        form.setAttribute('method', 'POST');
                        form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');
                        form.style.display = 'none';

                        Object.entries(esewaConfig).forEach(([key, value]) => {
                            const input = document.createElement('input');
                            input.setAttribute('type', 'hidden');
                            input.setAttribute('name', key);
                            input.setAttribute('value', typeof value === 'number' ? value.toString() : value);
                            form.appendChild(input);
                        });

                        document.body.appendChild(form);
                        console.log('Submitting form to eSewa...');
                        form.submit();

                        // Clean up if somehow it stays (though it should redirect)
                        setTimeout(() => {
                            if (document.body.contains(form)) {
                                document.body.removeChild(form);
                            }
                        }, 5000);
                        return;
                    }
                } catch (payErr) {
                    console.error('Payment initiation failed:', payErr);
                    setError('Payment initiation failed. Please try again or choose another method.');
                    setActionLoading(false);
                    return;
                }
            }

            setSuccessMessage(message);

            // Refresh status
            const response = await api.get(`/api/bikes/${id}`);
            setBike(response.data.data);
            setIsBookingModalOpen(false);

            // Redirect automatically after success (only for non-online or if something went wrong)
            setTimeout(() => {
                navigate('/browse');
            }, 3000);

        } catch (err) {
            setError(err.response?.data?.message || 'Transaction failed');
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmExchange = async (formData) => {
        try {
            setActionLoading(true);
            const response = await api.put(`/api/bikes/exchange/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedBike = response.data.data;

            setBike(updatedBike);
            return updatedBike;
        } catch (err) {
            setError(err.response?.data?.message || 'Exchange request failed');
            throw err;
        } finally {
            setActionLoading(false);
        }
    };

    const handleProceedAfterExchange = () => {
        setIsExchangeModalOpen(false);
        setIsBookingModalOpen(true);
    };

    const handleApplyFinance = (loanDetails) => {
        setSelectedLoanDetails(loanDetails);
        setIsFinanceModalOpen(true);
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 size={48} className="text-orange-600 animate-spin mb-4" />
                <p className="text-gray-500 font-bold italic">Loading Bike Data</p>
            </div>
        );
    }

    if (error || !bike) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BikeIcon size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-4">{error || 'No Bike Found'}</h2>
                    <button onClick={() => navigate('/browse')} className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-orange-700 transition-all">
                        GO BACK NOW
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const isBuyBike = bike.listingType === 'Sale' || bike.listingType === 'Purchase';
    const isViewOnly = user?.isAdmin || user?.role === 'admin' || user?.role === 'seller';

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            {!isViewOnly && <Header />}

            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isViewOnly ? 'pt-10' : 'pt-28 md:pt-40'} pb-12 lg:pb-20`}>
                {/* Back button for Admin/Seller */}
                {isViewOnly && (
                    <div className="mb-8">
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            <ArrowLeft size={16} /> BACK TO PREVIOUS
                        </button>
                    </div>
                )}

                {/* Nav breadcrumbs - Hidden for ViewOnly or kept simpler */}
                {!isViewOnly && (
                    <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 overflow-x-auto whitespace-nowrap pb-2">
                        <Link to="/dashboard" className="hover:text-orange-600 transition-colors">Home</Link>
                        <ChevronRight size={12} />
                        <Link to="/browse" className="hover:text-orange-600 transition-colors">Browse</Link>
                        <ChevronRight size={12} />
                        <span className="text-gray-900">{bike.name}</span>
                    </nav>
                )}

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Visual section */}
                    {successMessage && (
                        <div className="lg:col-span-2 bg-green-50 border border-green-100 p-6 rounded-[30px] flex items-center justify-between animate-fadeInScale">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Action Was Done</p>
                                    <p className="text-xs text-green-700 font-medium italic">{successMessage}</p>
                                </div>
                            </div>
                            <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700 font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-white rounded-xl transition-all">Dismiss Now</button>
                        </div>
                    )}
                    <div className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-[40px] overflow-hidden bg-gray-50 group shadow-2xl">
                            {bike.images && bike.images.length > 0 ? (
                                <>
                                    <img
                                        src={bike.images[activeImage]}
                                        alt={bike.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    {bike.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setActiveImage(prev => prev === 0 ? bike.images.length - 1 : prev - 1)}
                                                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white"
                                            >
                                                <ChevronLeft size={24} />
                                            </button>
                                            <button
                                                onClick={() => setActiveImage(prev => prev === bike.images.length - 1 ? 0 : prev + 1)}
                                                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-900 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-white"
                                            >
                                                <ChevronRight size={24} />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                                    <BikeIcon size={80} strokeWidth={1} />
                                    <p className="mt-4 font-bold uppercase tracking-widest text-sm">No Photo Here</p>
                                </div>
                            )}
                            <div className="absolute top-8 left-8">
                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md shadow-lg ${isBuyBike ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'}`}>
                                    For {bike.listingType}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnail list */}
                        {bike.images && bike.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto py-2 scrollbar-none">
                                {bike.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 border-2 transition-all ${activeImage === idx ? 'border-orange-500 scale-95 shadow-lg' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={img} alt={`${bike.name} ${idx}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Content section */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                                    {bike.brand}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    {bike.category}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                                {bike.name}
                            </h1>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-baseline gap-2">
                                    <span className={`text-4xl font-black ${bike.exchangeValuation > 0 ? 'text-gray-400 line-through text-2xl' : 'text-orange-600'}`}>
                                        Rs {bike.price.toLocaleString()}
                                    </span>
                                    {bike.listingType === 'Rental' && (
                                        <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">/ Per Day</span>
                                    )}
                                </div>
                                {bike.exchangeValuation > 0 && (
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-orange-600">
                                            Rs {(bike.price - bike.exchangeValuation).toLocaleString()}
                                        </span>
                                        <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-lg">
                                            New Low Price
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Refined EMI Section - Now opens a Modal */}
                            {isBuyBike && bike.status === 'Available' && (
                                <div className="mt-6 animate-fadeIn">
                                    <button
                                        onClick={() => setIsEMIModalOpen(true)}
                                        className="w-full flex items-center justify-between p-4 bg-orange-50/50 rounded-[25px] border border-orange-100 hover:border-orange-300 hover:bg-white transition-all group shadow-sm hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-orange-600 shadow-sm border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                                <Calculator size={18} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[8px] font-black text-orange-400 uppercase tracking-[0.2em] mb-0.5">Financing Available</p>
                                                <p className="text-[12px] font-black text-slate-800 group-hover:text-orange-600 transition-colors">Check Monthly EMI Plans</p>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-xl border border-orange-200 border-dashed flex items-center justify-center text-orange-400 group-hover:border-solid group-hover:border-orange-600 group-hover:text-orange-600 transition-all bg-white">
                                            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Specs grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { icon: Calendar, label: "Year Of Build", value: bike.modelYear },
                                { icon: Zap, label: "Engine Size CC", value: `${bike.engineCapacity} CC` },
                                { icon: Gauge, label: "Mileage In KM", value: `${bike.mileage} KM` },
                                { icon: ShieldCheck, label: "Bike State", value: bike.condition }
                            ].map((spec, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-3xl p-5 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <spec.icon className="text-orange-600 mb-3" size={20} />
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">{spec.label}</p>
                                    <p className="text-sm font-black text-gray-900">{spec.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Bike description */}
                        <div className="mb-10 text-gray-500 leading-relaxed space-y-4">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Tag size={18} className="text-orange-600" /> About This Bike
                            </h3>
                            <p className="text-sm">
                                This {bike.name} is a {bike.condition} condition {bike.category} motorcycle, meticulously maintained and ready for its next owner.
                                With a powerful {bike.engineCapacity}cc engine and only {bike.mileage}km on the clock, it offers the perfect balance of performance and reliability.
                            </p>
                            <p className="text-sm italic">
                                {isBuyBike ?
                                    "Listed by verified seller on RIDEHUB. All documents are verified and ready for transfer." :
                                    "Available for immediate rental. Insurance and safety equipment can be provided upon request."
                                }
                            </p>
                        </div>

                        {/* Action buttons - Restricted for Admin/Seller */}
                        {!isViewOnly && (
                            <div className="mt-auto space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    <button
                                        onClick={handleAction}
                                        disabled={actionLoading || bike.status !== 'Available'}
                                        className="flex-[2] bg-orange-600 text-white py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (() => {
                                            if (bike.status === 'Available') {
                                                return isBuyBike ? 'Buy This Bike' : 'Rent This Bike';
                                            }

                                            // Handle special EMI/Finance states
                                            const statusMap = {
                                                'FinancePending': 'Financing In Progress',
                                                'Purchased': 'Purchased Already',
                                                'Rented': 'Rented Already',
                                                'Approved': 'Ready For Purchase',
                                                'Negotiating': 'Under Negotiation',
                                                'Countered': 'Counter Offer Sent'
                                            };

                                            return statusMap[bike.status] || bike.status.toUpperCase();
                                        })()}

                                        {bike.status === 'Available' && !actionLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                    </button>

                                    {isBuyBike && (
                                        <button
                                            onClick={() => setIsExchangeModalOpen(true)}
                                            disabled={bike.status !== 'Available' || bike.exchangeStatus === 'Pending' || bike.exchangeStatus === 'Valuated'}
                                            className="flex-1 bg-gray-900 text-white py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group border border-transparent hover:border-orange-500/30 disabled:opacity-50"
                                        >
                                            <ArrowRightLeft size={18} className="text-orange-500 group-hover:rotate-180 transition-transform duration-500" />
                                            {bike.exchangeStatus === 'Pending' ? 'Swap Is Pending' :
                                                bike.exchangeStatus === 'Valuated' ? 'Swap Ready Now' : 'Swap My Bike'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openChat', {
                                                detail: {
                                                    sellerId: bike.seller?._id || bike.seller,
                                                    bikeId: bike._id,
                                                    bikeName: bike.name
                                                }
                                            }));
                                        }}
                                        className="flex-1 bg-white text-gray-900 py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-3 group border border-gray-100"
                                    >
                                        <MessageSquare size={18} className="text-orange-600 group-hover:scale-110 transition-transform" />
                                        Chat With Seller
                                    </button>
                                </div>

                                <div className="flex items-center justify-center gap-6 py-4 px-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-green-500" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Specs Are Real</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-blue-500" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Money Is Safe</span>
                                    </div>
                                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-orange-500" />
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Quick Deal Done</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-20 border-t border-gray-100 pt-20">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3">User Feedback</p>
                            <h2 className="text-4xl font-black text-gray-900 leading-none">Reviews & Ratings</h2>
                        </div>
                        <div className="flex items-center gap-4 py-3 px-6 bg-gray-50 rounded-3xl border border-gray-100">
                            <div className="flex text-orange-500">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} size={16} className={i <= Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length || 0) ? 'fill-orange-500' : 'text-gray-200'} />
                                ))}
                            </div>
                            <span className="text-sm font-black text-gray-900">{reviews.length} total reviews</span>
                        </div>
                    </div>

                    {reviewsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 size={32} className="text-orange-600 animate-spin" />
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-8">
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-white p-8 rounded-[40px] border border-gray-100/80 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 font-black text-lg">
                                                {review.reviewer?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-sm uppercase tracking-tight">{review.reviewer?.name || 'Anonymous User'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold italic">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1 text-orange-500 bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={12} className={s <= review.rating ? 'fill-orange-500' : 'text-orange-200'} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="absolute -top-4 -left-2 text-6xl text-orange-100 font-serif opacity-50">"</span>
                                        <p className="text-gray-600 text-sm leading-relaxed relative z-10 italic">
                                            {review.comment}
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center gap-2">
                                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-100">
                                            Verified {review.serviceType}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-[50px] border border-dashed border-gray-200">
                            <MessageSquare size={48} className="text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No Reviews Yet</h3>
                            <p className="text-gray-400 text-xs italic mt-2">Be the first to share your experience after booking!</p>
                        </div>
                    )}
                </div>
            </main>

            {!isViewOnly && <Footer />}

            <BookingModal
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                bike={bike}
                onConfirm={handleConfirmBooking}
            />

            <ExchangeModal
                isOpen={isExchangeModalOpen}
                onClose={() => setIsExchangeModalOpen(false)}
                bike={bike}
                onProceed={handleProceedAfterExchange}
                onConfirm={handleConfirmExchange}
            />

            {isFinanceModalOpen && (
                <FinanceModal
                    isOpen={isFinanceModalOpen}
                    onClose={() => setIsFinanceModalOpen(false)}
                    bike={bike}
                    loanDetails={selectedLoanDetails}
                />
            )}

            <EMIModal
                isOpen={isEMIModalOpen}
                onClose={() => setIsEMIModalOpen(false)}
                bike={bike}
                onApply={(loanDetails) => {
                    setIsEMIModalOpen(false);
                    handleApplyFinance(loanDetails);
                }}
            />
        </div>
    );
};

export default BikeDetails;
