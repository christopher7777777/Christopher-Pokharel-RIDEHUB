import React, { useState, useEffect } from 'react';
import SellerLayout from '../../components/layout/SellerLayout';
import api from '../../utils/api';
import {
    Package,
    Truck,
    CheckCircle2,
    PackageCheck,
    User,
    Calendar,
    Clock,
    Loader2,
    Search,
    ChevronRight,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SellerSales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSales = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/bikes/my-listings');
            // Filter bikes that are already sold or rented
            const soldBikes = response.data.data.filter(bike =>
                ['Purchased', 'Rented', 'Sold', 'Pending Return', 'Maintenance', 'Overdue'].includes(bike.status)
            );
            setSales(soldBikes);
        } catch (err) {
            console.error('Failed to fetch sales', err);
            toast.error('Failed to load sales data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const handleReleaseForDelivery = async (bikeId) => {
        try {
            const response = await api.put(`/api/bikes/release-delivery/${bikeId}`);
            if (response.data.success) {
                toast.success('Bike marked as shipped! The buyer has been notified.');
                fetchSales();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleConfirmReturn = async (bikeId, isMaintenance = false) => {
        const actionText = isMaintenance ? 'send to maintenance' : 'complete the return';
        if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;

        try {
            const response = await api.put(`/api/bikes/return/confirm/${bikeId}`, { isMaintenance });
            if (response.data.success) {
                toast.success(isMaintenance ? 'Bike sent to maintenance.' : 'Bike is now available for rent again!');
                fetchSales();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to confirm return');
        }
    };

    const getStatusStep = (deliveryStatus) => {
        if (deliveryStatus === 'Delivered') return 3;
        if (deliveryStatus === 'Shipped') return 2;
        return 1; // Pending or undefined
    };

    const filteredSales = sales.filter(sale =>
        sale.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <SellerLayout>
            <div className="animate-fadeIn">
                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Sales & <span className="text-orange-600">Deliveries</span></h1>
                    <p className="text-gray-500 italic mt-2">Manage your sold/rented fleet and track shipment status.</p>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by bike name or brand..."
                            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-orange-500 transition-all shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border border-gray-50 shadow-sm">
                        <Loader2 className="animate-spin text-orange-600 mb-4" size={48} />
                        <p className="text-gray-400 font-black italic uppercase tracking-widest text-[10px]">Accessing shipment data...</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="bg-white border border-gray-100 p-24 rounded-[40px] text-center shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package className="text-gray-200" size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2">No active sales</h3>
                        <p className="text-gray-500 italic max-w-sm mx-auto">
                            {searchTerm ? "No bikes match your search terms." : "You haven't sold or rented any bikes yet. They will appear here once purchased by a user."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredSales.map((sale) => (
                            <div key={sale._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
                                <div className="flex flex-col lg:flex-row">
                                    {/* Bike Preview */}
                                    <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden group bg-gray-50">
                                        <img
                                            src={sale.images?.[0] || 'https://placehold.co/400'}
                                            alt={sale.name}
                                            className="w-full h-full object-contain transition-all duration-700 p-2"
                                        />
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border border-white/20 ${sale.listingType === 'Rental' ? 'bg-blue-600/90 text-white' : 'bg-emerald-600/90 text-white'
                                                }`}>
                                                {sale.listingType}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 p-8">
                                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                                            <div>
                                                <p className="text-orange-600 text-[10px] font-black uppercase tracking-[0.2em] mb-1 italic">Order Summary</p>
                                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{sale.name}</h3>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <User size={14} className="text-orange-600/50" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            ID: {sale.purchasedBy || sale.rentedBy || 'Guest User'}
                                                        </span>
                                                    </div>
                                                    <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                                    <div className="flex items-center gap-1.5 text-gray-400">
                                                        <Calendar size={14} className="text-orange-600/50" />
                                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                                            {new Date(sale.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-gray-50 px-6 py-4 rounded-3xl border border-gray-100 text-right">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">Sale Price</p>
                                                <p className="text-2xl font-black text-gray-900 leading-none">Rs {sale.price.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        {/* Status Progress */}
                                        <div className="bg-gray-50/50 rounded-3xl p-8 mb-6 border border-gray-50">
                                            <div className="flex items-center justify-between relative mb-12">
                                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2"></div>
                                                <div
                                                    className="absolute top-1/2 left-0 h-1 bg-orange-600 -translate-y-1/2 transition-all duration-1000"
                                                    style={{ width: `${(getStatusStep(sale.deliveryStatus) - 1) * 50}%` }}
                                                ></div>

                                                {[
                                                    { step: 1, label: 'Pending', icon: Box, active: true },
                                                    { step: 2, label: 'Shipped', icon: Truck, active: getStatusStep(sale.deliveryStatus) >= 2 },
                                                    { step: 3, label: 'Delivered', icon: CheckCircle2, active: getStatusStep(sale.deliveryStatus) >= 3 }
                                                ].map((s) => (
                                                    <div key={s.step} className="relative z-10 flex flex-col items-center">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-4 border-white transition-all shadow-sm ${s.active ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/20' : 'bg-white text-gray-300'
                                                            }`}>
                                                            {s.step === 1 ? <PackageCheck size={20} /> : <s.icon size={20} />}
                                                        </div>
                                                        <span className={`absolute -bottom-8 whitespace-nowrap text-[9px] font-black uppercase tracking-widest ${s.active ? 'text-orange-600' : 'text-gray-300'
                                                            }`}>{s.label}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Action / Status Message */}
                                            <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    {(!sale.deliveryStatus || sale.deliveryStatus === 'Pending') ? (
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-100 rounded-full">
                                                            <Clock size={16} className="text-orange-600 animate-pulse" />
                                                            <span className="text-[10px] font-black text-orange-700 uppercase tracking-widest italic">Awaiting Dispatch</span>
                                                        </div>
                                                    ) : sale.deliveryStatus === 'Shipped' ? (
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-full">
                                                            <Truck size={16} className="text-blue-600" />
                                                            <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest italic">In Transit to Buyer</span>
                                                        </div>
                                                    ) : sale.status === 'Overdue' ? (
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-full">
                                                            <AlertCircle size={16} className="text-red-600 animate-bounce" />
                                                            <span className="text-[10px] font-black text-red-700 uppercase tracking-widest italic">Rental Overdue</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                                                            <CheckCircle2 size={16} className="text-emerald-600" />
                                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest italic">Confirmed Received</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {(!sale.deliveryStatus || sale.deliveryStatus === 'Pending') && (
                                                    <button
                                                        onClick={() => handleReleaseForDelivery(sale._id)}
                                                        className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-95"
                                                    >
                                                        RELEASE FOR DELIVERY <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                )}

                                                {/* CONFIRM RETURN BUTTONS */}
                                                {sale.status === 'Pending Return' && (
                                                    <div className="flex flex-col gap-3 w-full sm:w-auto">
                                                        {sale.fineAmount > 0 && (
                                                            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 mb-2 flex flex-col">
                                                                <span className="text-[8px] font-black uppercase">Late Fee (Paid by User)</span>
                                                                <span className="text-sm font-black italic">Rs {sale.fineAmount.toLocaleString()}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => handleConfirmReturn(sale._id, false)}
                                                                className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                                                            >
                                                                Confirm & Make Available
                                                            </button>
                                                            <button
                                                                onClick={() => handleConfirmReturn(sale._id, true)}
                                                                className="flex-1 bg-amber-500 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg active:scale-95"
                                                            >
                                                                Send to Maintenance
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {sale.status === 'Maintenance' && (
                                                    <button
                                                        onClick={() => handleConfirmReturn(sale._id, false)}
                                                        className="w-full sm:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                                                    >
                                                        Finish Maintenance
                                                    </button>
                                                )}
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

// Simple Box icon placeholder since Box wasn't in original list
const Box = Package;

export default SellerSales;
