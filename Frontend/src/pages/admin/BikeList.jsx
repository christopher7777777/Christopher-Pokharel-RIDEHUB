import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Bike, Search, Trash2, Eye, MapPin, Tag, Loader2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import ValuationModal from '../../components/models/ValuationModal';

const BikeList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [typeFilter, setTypeFilter] = useState('All Types');
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBike, setSelectedBike] = useState(null);
    const [isValuationModalOpen, setIsValuationModalOpen] = useState(false);

    useEffect(() => {
        fetchBikes();
    }, []);

    const fetchBikes = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/bikes/admin/all');
            setBikes(res.data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch global inventory');
            setLoading(false);
        }
    };

    const handleDeleteBike = async (bikeId) => {
        if (!window.confirm('Are you sure you want to remove this listing? This action cannot be undone.')) {
            return;
        }

        try {
            await api.delete(`/api/bikes/${bikeId}`);
            toast.success('Listing removed successfully');
            fetchBikes();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to remove listing');
        }
    };

    const handleValuateExchange = async (bikeId, valuation) => {
        try {
            await api.put(`/api/bikes/admin/valuate-exchange/${bikeId}`, {
                exchangeValuation: valuation,
                status: 'Valuated'
            });
            toast.success('Valuation submitted successfully');
            fetchBikes();
        } catch (error) {
            toast.error('Failed to submit valuation');
            throw error;
        }
    };

    const filteredBikes = bikes.filter(bike => {
        const matchesSearch =
            bike.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All Status' || bike.status === statusFilter;
        const matchesType = typeFilter === 'All Types' || bike.listingType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Available': return 'bg-green-100 text-green-700';
            case 'Sold': return 'bg-slate-900 text-white';
            case 'Rented': return 'bg-blue-100 text-blue-700';
            case 'Purchased': return 'bg-purple-100 text-purple-700';
            case 'Pending Review': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Global Bike Inventory</h1>
                    <p className="text-slate-500">View and manage all bikes listed for sale, rent, or exchange.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by model, brand, or seller..."
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                        >
                            <option>All Types</option>
                            <option value="Sale">Sale</option>
                            <option value="Rental">Rental</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                        >
                            <option>All Status</option>
                            <option>Available</option>
                            <option>Sold</option>
                            <option>Rented</option>
                            <option>Purchased</option>
                            <option>Pending Review</option>
                        </select>
                    </div>
                </div>

                {/* Bikes */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Inventory...</p>
                    </div>
                ) : filteredBikes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredBikes.map((bike) => (
                            <div key={bike._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                                <div className="h-40 bg-slate-100 relative overflow-hidden">
                                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2 items-end">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${bike.listingType === 'Rental' ? 'bg-blue-600 text-white' : 'bg-orange-600 text-white'}`}>
                                            {bike.listingType}
                                        </span>
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm ${getStatusColor(bike.status)}`}>
                                            {bike.status}
                                        </span>
                                        {bike.exchangeStatus === 'Pending' && (
                                            <span className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm bg-red-600 text-white animate-pulse">
                                                Exchange Req
                                            </span>
                                        )}
                                        {bike.exchangeStatus === 'Valuated' && (
                                            <span className="px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shadow-sm bg-green-600 text-white">
                                                Valuated
                                            </span>
                                        )}
                                    </div>
                                    {bike.images && bike.images[0] ? (
                                        <img src={bike.images[0]} alt={bike.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <Bike size={64} className="group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 space-y-3">
                                    <div>
                                        <h4 className="font-bold text-slate-800 truncate">{bike.brand} {bike.model}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Tag size={12} /> {bike.seller?.name || 'Unknown Seller'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="font-black text-orange-600">Rs. {bike.price.toLocaleString()}</p>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                            <MapPin size={10} /> {bike.location}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex gap-2">
                                        <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold">
                                            <Eye size={14} /> VIEW
                                        </button>
                                        {bike.exchangeStatus === 'Pending' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBike(bike);
                                                    setIsValuationModalOpen(true);
                                                }}
                                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-orange-200"
                                            >
                                                VALUATE
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteBike(bike._id)}
                                            className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all flex items-center justify-center"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
                        <AlertCircle className="text-slate-300 mb-2" size={48} />
                        <p className="text-slate-400 font-medium">No bikes found matching your criteria.</p>
                    </div>
                )}
            </div>

            <ValuationModal
                isOpen={isValuationModalOpen}
                onClose={() => setIsValuationModalOpen(false)}
                bike={selectedBike}
                onValuate={handleValuateExchange}
            />
        </AdminLayout>
    );
};

export default BikeList;
