import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import {
    Bike as BikeIcon,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    User,
    ArrowRight,
    Loader2,
    Calendar,
    MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const MyPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bikes/my-purchases');
            setPurchases(response.data.data);
        } catch (err) {
            console.error('Failed to fetch purchases', err);
            toast.error('Failed to load your orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases();
    }, []);

    const handleConfirmReceipt = async (bikeId) => {
        if (!window.confirm('Have you received the bike in the stated condition?')) return;
        
        try {
            const response = await api.put(`/api/bikes/receive-bike/${bikeId}`);
            if (response.data.success) {
                toast.success('Bike received successfully! Enjoy your ride.');
                fetchPurchases();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const getStatusStep = (status, deliveryStatus) => {
        if (deliveryStatus === 'Delivered') return 3;
        if (deliveryStatus === 'Shipped') return 2;
        return 1; // Pending
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pt-24">
            <Header />
            
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                        My <span className="text-orange-600">Inventory</span>
                    </h1>
                    <p className="text-gray-500 italic mt-2">Track your rentals, purchases and delivery status.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
                        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
                        <p className="text-gray-400 font-bold italic uppercase tracking-widest text-xs">Tracking your rides...</p>
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BikeIcon size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No rides yet</h3>
                        <p className="text-gray-500 italic mb-8 max-w-md mx-auto">
                            Seems like you haven't bought or rented anything yet. Explore our fleet and find your perfect match!
                        </p>
                        <a href="/browse" className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20">
                            START BROWSING
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {purchases.map((bike) => (
                            <div key={bike._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500 group">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Image Section */}
                                    <div className="lg:w-1/3 relative h-64 lg:h-auto overflow-hidden bg-gray-50">
                                        <img 
                                            src={bike.images?.[0] || 'https://placehold.co/600x400'} 
                                            alt={bike.name}
                                            className="w-full h-full object-contain transition-all duration-700 p-2" 
                                        />
                                        <div className="absolute top-6 left-6">
                                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg backdrop-blur-md border border-white/20 ${
                                                bike.listingType === 'Rental' ? 'bg-blue-600/90 text-white' : 'bg-emerald-600/90 text-white'
                                            }`}>
                                                {bike.listingType}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="flex-1 p-8 lg:p-10">
                                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                                            <div>
                                                <p className="text-orange-600 text-[10px] font-black uppercase tracking-widest mb-1 italic">
                                                    {bike.brand} • {bike.modelYear}
                                                </p>
                                                <h2 className="text-3xl font-black text-gray-900 leading-tight uppercase">{bike.name}</h2>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <User size={14} />
                                                        <span className="text-[10px] font-bold uppercase">Seller: {bike.seller?.name || 'RideHub Official'}</span>
                                                    </div>
                                                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Calendar size={14} />
                                                        <span className="text-[10px] font-bold uppercase">{new Date(bike.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Transaction Value</p>
                                                <p className="text-3xl font-black text-gray-900">Rs {bike.price.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Status Progress - Improved Layout */}
                                        <div className="bg-gray-50 rounded-3xl p-8 mb-8 border border-gray-100">
                                            <div className="flex items-center justify-between relative mb-12">
                                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                                                <div 
                                                    className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 transition-all duration-1000"
                                                    style={{ width: `${(getStatusStep(bike.status, bike.deliveryStatus) - 1) * 50}%` }}
                                                ></div>
                                                
                                                {[
                                                    { step: 1, label: 'Processing', icon: Package, active: true },
                                                    { step: 2, label: 'In Transit', icon: Truck, active: getStatusStep(bike.status, bike.deliveryStatus) >= 2 },
                                                    { step: 3, label: 'Delivered', icon: CheckCircle2, active: getStatusStep(bike.status, bike.deliveryStatus) >= 3 }
                                                ].map((s) => (
                                                    <div key={s.step} className="relative z-10 flex flex-col items-center group">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-4 border-white ${
                                                            s.active ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' : 'bg-white text-gray-300 border-gray-100'
                                                        }`}>
                                                            <s.icon size={20} />
                                                        </div>
                                                        <span className={`absolute -bottom-8 whitespace-nowrap text-[9px] font-black uppercase tracking-widest transition-colors ${
                                                            s.active ? 'text-orange-600' : 'text-gray-300'
                                                        }`}>
                                                            {s.label}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Contextual Status Message */}
                                            <div className="text-center mt-14">
                                                {bike.deliveryStatus === 'Delivered' ? (
                                                    <div className="text-emerald-600 bg-emerald-50 py-3 px-6 rounded-2xl border border-emerald-100 inline-flex items-center gap-2">
                                                        <CheckCircle2 size={16} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Transaction Completed Successfully</span>
                                                    </div>
                                                ) : bike.deliveryStatus === 'Shipped' ? (
                                                    <div className="text-blue-600 bg-blue-50 py-3 px-6 rounded-2xl border border-blue-100 inline-flex items-center gap-2">
                                                        <Truck size={16} className="animate-bounce" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Your ride is on its way to you!</span>
                                                    </div>
                                                ) : (
                                                    <div className="text-orange-600 bg-orange-50 py-3 px-6 rounded-2xl border border-orange-100 inline-flex items-center gap-2">
                                                        <Clock size={16} className="animate-pulse" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Preparation for dispatch in progress</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {bike.deliveryStatus === 'Shipped' && (
                                            <button 
                                                onClick={() => handleConfirmReceipt(bike._id)}
                                                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] group"
                                            >
                                                CONFIRM RECEIPT <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                        {bike.deliveryStatus === 'Delivered' && (
                                            <div className="flex gap-4">
                                                <button className="flex-1 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-100 hover:bg-gray-100 transition-all">
                                                    Download Receipt
                                                </button>
                                                <button className="flex-1 bg-white text-orange-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-orange-100 hover:bg-orange-50 transition-all italic">
                                                    Rate Seller
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default MyPurchases;
