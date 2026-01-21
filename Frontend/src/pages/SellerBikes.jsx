import React, { useState, useEffect } from 'react';
import SellerLayout from '../components/SellerLayout';
import api from '../utils/api';
import {
    Bike as BikeIcon,
    Calendar,
    ShoppingCart,
    Search,
    Filter,
    Loader2,
    CheckCircle2,
    Clock,
    User,
    ArrowUpRight
} from 'lucide-react';

const SellerBikes = () => {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchBikes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bikes/my-listings');
            // Filter only Purchased or Rented bikes for this "BIKES" page (orders/rentals)
            const filtered = response.data.data.filter(bike =>
                bike.status === 'Purchased' || bike.status === 'Rented'
            );
            setBikes(filtered);
        } catch (err) {
            console.error('Failed to fetch bikes', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    const filteredBikes = bikes.filter(bike => {
        const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'All' || bike.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Purchased': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Rented': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <SellerLayout>
            <div className="animate-fadeIn">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders & Rentals</h1>
                    <p className="text-gray-500 text-sm italic">Track your sold and rented motorcycles in one place.</p>
                </div>

                {/* Filters & Tabs */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-center justify-between">
                    <div className="flex gap-2 bg-gray-100/50 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto">
                        {['All', 'Purchased', 'Rented'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all whitespace-nowrap ${activeTab === tab
                                        ? 'bg-white text-orange-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search bikes..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 outline-none font-bold text-xs"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Loader2 size={40} className="text-orange-600 animate-spin mb-4" />
                        <p className="text-gray-400 font-bold italic text-sm uppercase tracking-widest">Loading transactions...</p>
                    </div>
                ) : filteredBikes.length === 0 ? (
                    <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BikeIcon className="text-gray-200" size={40} />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">No {activeTab === 'All' ? 'orders' : activeTab.toLowerCase()} yet</h3>
                        <p className="text-gray-400 max-w-sm mx-auto italic text-sm">When customers purchase or rent your bikes, they will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredBikes.map((bike) => (
                            <div key={bike._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                <div className="flex flex-col sm:flex-row h-full">
                                    <div className="sm:w-48 h-48 relative overflow-hidden bg-gray-50">
                                        <img
                                            src={bike.images[0] || 'https://via.placeholder.com/400'}
                                            alt={bike.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md shadow-lg ${getStatusStyles(bike.status)}`}>
                                                {bike.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-6 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900 mb-1">{bike.name}</h3>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                                    <span>{bike.brand}</span>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                                    <span>{bike.modelYear}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-black text-orange-600">Rs {bike.price.toLocaleString()}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase italic">
                                                    {bike.status === 'Rented' ? '/ day' : 'Total Sale'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-auto">
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Activity Date</p>
                                                </div>
                                                <p className="font-black text-gray-900 text-[10px]">
                                                    {new Date(bike.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100/50">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <User size={12} className="text-gray-400" />
                                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">Type</p>
                                                </div>
                                                <p className="font-black text-gray-900 text-[10px]">
                                                    {bike.status === 'Rented' ? 'Short Term Rental' : 'Outright Purchase'}
                                                </p>
                                            </div>
                                        </div>
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
