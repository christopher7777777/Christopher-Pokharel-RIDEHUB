import React, { useState, useEffect } from 'react';
import SellerLayout from '../../components/layout/SellerLayout';
import api from '../../utils/api';
import {
    Bike as BikeIcon,
    Search,
    Filter,
    Calendar,
    Tag,
    ChevronRight,
    ArrowUpRight,
    Loader2,
    AlertCircle,
    Clock,
    ShoppingCart,
    CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const SellerBikes = () => {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, Sale, Rental, Exchange, Purchased
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBikes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bikes/my-listings');
            setBikes(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch bike listings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    const filteredBikes = bikes.filter(bike => {
        const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' ||
            (filter === 'Purchased' ? bike.status === 'Purchased' :
                filter === 'Exchange' ? bike.exchangeStatus === 'Valuated' :
                    bike.listingType === filter);
        return matchesSearch && matchesFilter;
    });

    const displayBikes = filteredBikes.map(bike => {
        const isExchangeView = filter === 'Exchange' && bike.exchangeBikeDetails;
        if (isExchangeView) {
            return {
                ...bike,
                _isExchange: true,
                displayName: bike.exchangeBikeDetails.name,
                displayBrand: bike.exchangeBikeDetails.brand,
                displayYear: bike.exchangeBikeDetails.modelYear,
                displayImage: bike.exchangeBikeDetails.fullBikePhoto || bike.images[0],
                displayPrice: bike.exchangeValuation,
                displayPriceLabel: 'Swap Valuation',
                originalBikeName: bike.name
            };
        }
        return {
            ...bike,
            _isExchange: false,
            displayName: bike.name,
            displayBrand: bike.brand,
            displayYear: bike.modelYear,
            displayImage: bike.images?.[0],
            displayPrice: bike.price,
            displayPriceLabel: bike.listingType === 'Rental' ? 'Per Day' : 'Full Sale'
        };
    });

    const stats = {
        total: bikes.length,
        rentals: bikes.filter(b => b.listingType === 'Rental').length,
        sales: bikes.filter(b => b.listingType === 'Sale').length,
        exchanges: bikes.filter(b => b.exchangeStatus === 'Valuated').length,
        sold: bikes.filter(b => b.status === 'Purchased').length
    };

    if (loading) {
        return (
            <SellerLayout>
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="animate-spin text-orange-600" size={48} />
                </div>
            </SellerLayout>
        );
    }

    return (
        <SellerLayout>
            <div className="animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bike Management</h1>
                        <p className="text-gray-500 text-sm italic">Unified view of your rentals and sales.</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {[
                        { label: 'Total Items', value: stats.total, icon: BikeIcon, color: 'text-gray-900', bg: 'bg-white' },
                        { label: 'For Rent', value: stats.rentals, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50/50' },
                        { label: 'For Exchange', value: stats.exchanges, icon: ArrowUpRight, color: 'text-orange-600', bg: 'bg-orange-50/50' },
                        { label: 'Completed Sales', value: stats.sold, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50/50' },
                    ].map((stat, idx) => (
                        <div key={idx} className={`${stat.bg} p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between group transition-all`}>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color} bg-white shadow-sm border border-gray-50`}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filter/Search */}
                <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search your rides..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl w-full md:w-auto overflow-x-auto">
                        {['all', 'Rental', 'Sale', 'Exchange', 'Purchased'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === t
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {t === 'all' ? 'Everything' : (t === 'Purchased' ? 'Sold' : t)}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-[32px] flex items-center gap-4 mb-8 animate-shake">
                        <AlertCircle size={24} />
                        <div>
                            <p className="font-black text-sm uppercase">Connection Error</p>
                            <p className="text-xs opacity-80">{error}</p>
                        </div>
                    </div>
                )}

                {/* Bikes */}
                {displayBikes.length === 0 ? (
                    <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BikeIcon className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No rides found</h3>
                        <p className="text-gray-400 text-sm font-medium">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayBikes.map((bike) => (
                            <div key={bike._isExchange ? `swap-${bike._id}` : bike._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:border-orange-200 transition-all">
                                <div className="aspect-[16/10] relative overflow-hidden">
                                    <img
                                        src={bike.displayImage || 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=2070&auto=format&fit=crop'}
                                        alt={bike.displayName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 ${bike.listingType === 'Rental'
                                                ? 'bg-blue-600/80 text-white'
                                                : 'bg-orange-600/80 text-white'
                                                }`}>
                                                {bike.listingType}
                                            </span>
                                            {bike.exchangeStatus === 'Valuated' && (
                                                <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-purple-600 text-white border border-white/20 shadow-sm">
                                                    Valuated Swap
                                                </span>
                                            )}
                                        </div>
                                        {bike._isExchange && (
                                            <span className="px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/10">
                                                Received for: {bike.originalBikeName}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors uppercase tracking-tight">{bike.displayName}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{bike.displayBrand} • {bike.displayYear}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900">Rs {bike.displayPrice?.toLocaleString()}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{bike.displayPriceLabel}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/bike/${bike._id}`}
                                                className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-900 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2"
                                            >
                                                View {bike._isExchange ? 'Original' : 'Details'} <ArrowUpRight size={14} />
                                            </Link>
                                            <Link
                                                to="/seller/inventory"
                                                className="w-12 h-11 flex items-center justify-center bg-gray-50 hover:bg-orange-50 text-gray-400 hover:text-orange-600 rounded-xl transition-all"
                                            >
                                                <Filter size={16} />
                                            </Link>
                                        </div>
                                        {bike.status === 'Approved' && (bike.listingType === 'Sale' || bike.listingType === 'Rental') && (
                                            <button
                                                onClick={async () => {
                                                    const action = bike.listingType === 'Sale' ? 'sold' : 'rented';
                                                    if (window.confirm(`Mark this bike as ${action} and payment received?`)) {
                                                        try {
                                                            await api.put(`/api/bikes/complete-payment/${bike._id}`, {
                                                                paymentMessage: `Transaction completed and payment received by dealer.`
                                                            });
                                                            alert(`Successfully marked as ${action}! Notification sent to buyer.`);
                                                            fetchBikes();
                                                        } catch (err) {
                                                            alert(`Failed to complete ${action}: ${err.response?.data?.message || err.message}`);
                                                        }
                                                    }
                                                }}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={14} /> MARK AS {bike.listingType === 'Sale' ? 'SOLD' : 'RENTED'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </SellerLayout>
    );
};

export default SellerBikes;
