import React, { useState, useEffect } from 'react';
import SellerLayout from '../../components/layout/SellerLayout';
import api from '../../utils/api';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    Eye,
    Bike as BikeIcon,
    AlertCircle,
    Loader2
} from 'lucide-react';
import BikeFormModal from '../../components/models/BikeFormModal';

const SellerInventory = () => {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBike, setSelectedBike] = useState(null);
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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await api.delete(`/api/bikes/${id}`);
                setBikes(bikes.filter(bike => bike._id !== id));
            } catch (err) {
                alert('Failed to delete listing');
                console.error(err);
            }
        }
    };

    const handleEdit = (bike) => {
        setSelectedBike(bike);
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedBike(null);
        setIsModalOpen(true);
    };

    const filteredBikes = bikes.filter(bike =>
        bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.model.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SellerLayout>
            <div className="animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bike Inventory</h1>
                        <p className="text-gray-500 text-sm italic">Manage your ride listings and availability.</p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-900/20 transform active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Add New Ride
                    </button>
                </div>

                {/* Search filters */}
                <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, brand, or model..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
                            <Filter size={18} /> Filters
                        </button>
                    </div>
                </div>

                {/* Inventory list */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={40} className="text-orange-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-bold italic">Loading your fleet...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 p-8 rounded-[40px] text-center">
                        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-red-900 mb-2">Oops! Something went wrong</h3>
                        <p className="text-red-600 mb-6">{error}</p>
                        <button
                            onClick={fetchBikes}
                            className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredBikes.length === 0 ? (
                    <div className="bg-white border border-gray-100 p-20 rounded-[40px] text-center shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BikeIcon size={40} className="text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No rides found</h3>
                        <p className="text-gray-500 italic mb-8 max-w-xs mx-auto">
                            {searchTerm ? "We couldn't find any bikes matching your search." : "Your inventory is empty. Start by adding your first ride!"}
                        </p>
                        <button
                            onClick={handleAdd}
                            className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-900/20"
                        >
                            List a Bike
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredBikes.map((bike) => (
                            <div key={bike._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
                                <div className="h-48 bg-gray-100 relative overflow-hidden">
                                    {bike.images && bike.images[0] ? (
                                        <img src={bike.images[0]} alt={bike.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <BikeIcon size={48} className="text-gray-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bike.listingType === 'Rental' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
                                            }`}>
                                            For {bike.listingType}
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => handleEdit(bike)}
                                                className="p-2 bg-white rounded-xl text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bike._id)}
                                                className="p-2 bg-white rounded-xl text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{bike.brand} • {bike.modelYear}</p>
                                            <h3 className="text-lg font-black text-gray-900 line-clamp-1">{bike.name}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-gray-900">RS {bike.price.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase italic">{bike.listingType === 'Rental' ? '/ day' : 'total'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-1.5 text-gray-700">
                                            <span className="text-xs font-bold">{bike.engineCapacity} CC</span>
                                        </div>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        <div className="flex items-center gap-1.5 text-gray-700">
                                            <span className="text-xs font-bold">{bike.category}</span>
                                        </div>
                                        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                        <div className="flex items-center gap-1.5 text-gray-700">
                                            <span className="text-xs font-bold">{bike.condition}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <BikeFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    bike={selectedBike}
                    onSuccess={fetchBikes}
                />
            )}
        </SellerLayout>
    );
};

export default SellerInventory;
