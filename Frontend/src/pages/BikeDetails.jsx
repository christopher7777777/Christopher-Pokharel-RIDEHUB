import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import {
    Bike as BikeIcon,
    Calendar,
    Gauge,
    Zap,
    ShieldCheck,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    MessageCircle,
    MapPin,
    ArrowRightLeft,
    Clock,
    Tag,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';

const BikeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bike, setBike] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

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

        fetchBike();
    }, [id]);

    const handleAction = async () => {
        try {
            setActionLoading(true);
            const endpoint = isBuyBike ? `/api/bikes/confirm-sale/${id}` : `/api/bikes/rent/${id}`;
            await api.put(endpoint);
            setSuccessMessage(isBuyBike ? 'Purchase successful! Dealer will contact you.' : 'Rental booked! Pick up your bike at the showroom.');
            // Refresh bike status
            const response = await api.get(`/api/bikes/${id}`);
            setBike(response.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Transaction failed');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 size={48} className="text-orange-600 animate-spin mb-4" />
                <p className="text-gray-500 font-bold italic">Gathering bike performance data...</p>
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
                    <h2 className="text-3xl font-black text-gray-900 mb-4">{error || 'Bike not found'}</h2>
                    <button onClick={() => navigate('/browse')} className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-orange-700 transition-all">
                        BACK TO EXPLORE
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const isBuyBike = bike.listingType === 'Sale' || bike.listingType === 'Purchase';

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 mb-8 text-[10px] font-black uppercase tracking-widest text-gray-400 overflow-x-auto whitespace-nowrap pb-2">
                    <Link to="/dashboard" className="hover:text-orange-600 transition-colors">Home</Link>
                    <ChevronRight size={12} />
                    <Link to="/browse" className="hover:text-orange-600 transition-colors">Browse</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-900">{bike.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Visual Section */}
                    {successMessage && (
                        <div className="lg:col-span-2 bg-green-50 border border-green-100 p-6 rounded-[30px] flex items-center justify-between animate-fadeInScale">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-900 uppercase tracking-tight">Well Done!</p>
                                    <p className="text-xs text-green-700 font-medium italic">{successMessage}</p>
                                </div>
                            </div>
                            <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-700 font-bold text-xs uppercase tracking-widest px-4 py-2 hover:bg-white rounded-xl transition-all">Dismiss</button>
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
                                    <p className="mt-4 font-bold uppercase tracking-widest text-sm">No Preview Available</p>
                                </div>
                            )}
                            <div className="absolute top-8 left-8">
                                <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md shadow-lg ${isBuyBike ? 'bg-orange-600 text-white' : 'bg-blue-600 text-white'}`}>
                                    For {bike.listingType}
                                </span>
                            </div>
                        </div>

                        {/* Thumbnails */}
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

                    {/* Content Section */}
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
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-orange-600">
                                    Rs {bike.price.toLocaleString()}
                                </span>
                                {bike.listingType === 'Rental' && (
                                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">/ Per Day</span>
                                )}
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { icon: Calendar, label: "Model Year", value: bike.modelYear },
                                { icon: Zap, label: "Engine (CC)", value: `${bike.engineCapacity} CC` },
                                { icon: Gauge, label: "Mileage", value: `${bike.mileage} KM` },
                                { icon: ShieldCheck, label: "Condition", value: bike.condition }
                            ].map((spec, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-3xl p-5 border border-gray-100 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <spec.icon className="text-orange-600 mb-3" size={20} />
                                    <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">{spec.label}</p>
                                    <p className="text-sm font-black text-gray-900">{spec.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        <div className="mb-10 text-gray-500 leading-relaxed space-y-4">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Tag size={18} className="text-orange-600" /> Description
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

                        {/* Action Buttons */}
                        <div className="mt-auto space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleAction}
                                    disabled={actionLoading || bike.status !== 'Available'}
                                    className="flex-[2] bg-orange-600 text-white py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-orange-900/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        bike.status !== 'Available' ? bike.status.toUpperCase() : (isBuyBike ? 'Inquire for Purchase' : 'Book Rental Now')
                                    )}
                                    {bike.status === 'Available' && !actionLoading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                                </button>

                                {isBuyBike && (
                                    <button
                                        onClick={() => navigate('/sell')}
                                        className="flex-1 bg-gray-900 text-white py-5 rounded-[25px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 group border border-transparent hover:border-orange-500/30"
                                    >
                                        <ArrowRightLeft size={18} className="text-orange-500 group-hover:rotate-180 transition-transform duration-500" />
                                        Exchange Bike
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-center gap-6 py-4 px-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-green-500" />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Verified Specs</span>
                                </div>
                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-blue-500" />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Safe Transaction</span>
                                </div>
                                <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-orange-500" />
                                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fast Approval</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BikeDetails;
