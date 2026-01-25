import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Bike, Search, Filter, Trash2, Eye, MapPin, Tag } from 'lucide-react';

const BikeList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [bikes, setBikes] = useState([]);

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Global Bike Inventory</h1>
                        <p className="text-slate-500">View and manage all bikes listed for sale, rent, or exchange.</p>
                    </div>
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
                        <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none">
                            <option>All Types</option>
                            <option>Sell</option>
                            <option>Exchange</option>
                            <option>Rent</option>
                        </select>
                        <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 focus:outline-none">
                            <option>All Status</option>
                            <option>Listed</option>
                            <option>Sold</option>
                            <option>In Review</option>
                        </select>
                    </div>
                </div>

                {/* Bike Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bikes.map((bike) => (
                        <div key={bike.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all">
                            <div className="h-40 bg-slate-100 relative overflow-hidden">
                                <div className="absolute top-3 right-3 z-10">
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${bike.type === 'Exchange' ? 'bg-orange-600 text-white' : 'bg-slate-900 text-white'
                                        }`}>
                                        {bike.type}
                                    </span>
                                </div>
                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                    <Bike size={64} className="group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div>
                                    <h4 className="font-bold text-slate-800 truncate">{bike.model}</h4>
                                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                        <Tag size={12} /> {bike.seller}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="font-black text-orange-600">{bike.price}</p>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                        <MapPin size={10} /> {bike.location}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex gap-2">
                                    <button className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 p-2 rounded-lg transition-all flex items-center justify-center gap-2 text-xs font-bold">
                                        <Eye size={14} /> VIEW
                                    </button>
                                    <button className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-all flex items-center justify-center">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default BikeList;
