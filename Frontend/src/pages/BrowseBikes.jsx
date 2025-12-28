import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';
import { Search, Filter, Bike, Loader2, AlertCircle } from 'lucide-react';

const BrowseBikes = () => {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Filter states
    const [filters, setFilters] = useState({
        type: 'all', // 'Sale' or 'Rental' or 'all'
        minPrice: '',
        maxPrice: '',
        brand: 'all'
    });

    const fetchBikes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bikes');
            setBikes(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch bikes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    // Derived values for filters
    const brands = ['all', ...new Set(bikes.map(bike => bike.brand))];

    const filteredBikes = bikes.filter(bike => {
        // Search Term
        const matchesSearch = bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bike.brand.toLowerCase().includes(searchTerm.toLowerCase());

        // Type Filter (Sale / Rental)
        // Note: Backend likely saves 'Sale' or 'Rental' in listingType
        const matchesType = filters.type === 'all' || bike.listingType === filters.type;

        // Brand Filter
        const matchesBrand = filters.brand === 'all' || bike.brand === filters.brand;

        // Price Filter
        const matchesMinPrice = !filters.minPrice || bike.price >= Number(filters.minPrice);
        const matchesMaxPrice = !filters.maxPrice || bike.price <= Number(filters.maxPrice);

        return matchesSearch && matchesType && matchesBrand && matchesMinPrice && matchesMaxPrice;
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="w-full lg:w-64 flex-shrink-0 space-y-8">
                        <div>
                            <h3 className="font-black text-xl text-gray-900 mb-4">Filters</h3>
                            <button
                                onClick={() => setFilters({ type: 'all', minPrice: '', maxPrice: '', brand: 'all' })}
                                className="text-sm text-red-500 font-bold hover:underline mb-6"
                            >
                                Clear All
                            </button>

                            {/* Type Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                                    value={filters.type}
                                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                >
                                    <option value="all">All Types</option>
                                    <option value="Purchase">Buy</option>
                                    <option value="Rental">Rent</option>
                                </select>
                            </div>

                            {/* Brand Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                                <select
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm font-medium"
                                    value={filters.brand}
                                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                                >
                                    {brands.map((brand, idx) => (
                                        <option key={idx} value={brand}>{brand === 'all' ? 'All Brands' : brand}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Price Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                        value={filters.minPrice}
                                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200">
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1">
                        {/* Search and Sort */}
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative flex-1 w-full md:max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search bikes..."
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-medium">Sort by:</span>
                                <select className="bg-transparent border-none text-sm font-bold text-gray-900 focus:ring-0 cursor-pointer">
                                    <option>Most Recent</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Available Bikes Title */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-black text-gray-900">Available Bikes</h2>
                            <p className="text-gray-500 text-sm">Showing {filteredBikes.length} results</p>
                        </div>

                        {/* Grid */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 size={40} className="text-orange-600 animate-spin mb-4" />
                                <p className="text-gray-500 font-bold italic">Loading bikes...</p>
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
                                    <Bike size={40} className="text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">No bikes found</h3>
                                <p className="text-gray-500 italic mb-8 mx-auto">
                                    Try adjusting your filters or search terms.
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredBikes.map((bike) => (
                                    <div key={bike._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
                                        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                            {bike.images && bike.images[0] ? (
                                                <img src={bike.images[0]} alt={bike.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Bike size={48} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <div className="mb-4">
                                                <h3 className="text-lg font-black text-gray-900 line-clamp-1">{bike.name}</h3>
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wide mt-1">
                                                    {bike.modelYear} • {bike.category} • {bike.engineCapacity}cc
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-400 font-bold uppercase">Price</span>
                                                    <span className="text-xl font-black text-orange-600">
                                                        Rs {bike.price.toLocaleString()}
                                                        <span className="text-xs text-gray-400 font-normal ml-1">
                                                            {bike.listingType === 'Rental' ? '/day' : ''}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                                <button className="py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors">
                                                    View Details
                                                </button>
                                                <button className="py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200">
                                                    {bike.listingType === 'Rental' ? 'Rent Now' : 'Buy Now'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default BrowseBikes;
