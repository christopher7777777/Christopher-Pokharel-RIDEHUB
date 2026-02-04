import React, { useState } from 'react';
import {
    X,
    Calendar,
    Clock,
    Truck,
    User,
    CreditCard,
    CheckCircle2,
    Loader2,
    AlertCircle,
    Package,
    ShieldCheck,
    ChevronRight,
    MapPin
} from 'lucide-react';

const BookingModal = ({ isOpen, onClose, bike, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        bookingDate: new Date().toISOString().split('T')[0],
        serviceDay: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()),
        deliveryMethod: 'Self Pickup',
        paymentMethod: 'Cash At Pickup',
        rentalPlan: 'Daily',
        rentalDuration: 1
    });

    if (!isOpen) return null;

    const deliveryCharge = formData.deliveryMethod === 'Home Delivery' ? 10 : 0;
    const basePrice = bike.price;
    const planMultiplier = formData.rentalPlan === 'Weekly' ? 7 : 1;
    const rentalCost = basePrice * planMultiplier * formData.rentalDuration;
    const totalAmount = rentalCost + deliveryCharge;

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'bookingDate') {
            const date = new Date(value);
            const day = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
            setFormData(prev => ({ ...prev, [name]: value, serviceDay: day }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onConfirm({
                ...formData,
                deliveryCharge,
                totalAmount
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn max-h-[95vh] flex flex-col border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Book Your Ride</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Ready To Ride</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-3xl flex items-center gap-3 text-sm font-bold animate-shake">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    {/* Booking Details Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <Calendar size={16} />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Set Your Dates</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Your Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        name="bookingDate"
                                        value={formData.bookingDate}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Select Service Day</label>
                                <div className="relative">
                                    <select
                                        name="serviceDay"
                                        value={formData.serviceDay}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none appearance-none"
                                    >
                                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                            <option key={day} value={day}>{day}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Configuration Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Package size={16} />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Configure Your Ride</h3>
                        </div>

                        {bike.listingType === 'Rental' && (
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Pick Rental Plan</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, rentalPlan: 'Daily' }))}
                                        className={`px-5 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${formData.rentalPlan === 'Daily' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        Daily Basis
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, rentalPlan: 'Weekly' }))}
                                        className={`px-5 py-3 rounded-2xl border-2 transition-all font-bold text-sm ${formData.rentalPlan === 'Weekly' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        Pay Every Week
                                    </button>
                                </div>
                                <div className="space-y-1.5 mt-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        Total {formData.rentalPlan === 'Weekly' ? 'Weeks' : 'Days'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        name="rentalDuration"
                                        value={formData.rentalDuration}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    {bike.listingType === 'Rental' ? 'Cost Per Day' : 'Fixed Sale Price'}
                                </label>
                                <input
                                    readOnly
                                    value={basePrice.toLocaleString()}
                                    className="w-full px-5 py-4 bg-gray-100 border-2 border-transparent rounded-2xl text-sm font-bold text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Service Type</label>
                                <div className="px-5 py-4 bg-orange-500 text-white rounded-2xl text-sm font-black flex items-center justify-center shadow-lg shadow-orange-200">
                                    {bike.listingType}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 mt-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Choose Delivery Mode</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'Self Pickup' }))}
                                    className={`px-5 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.deliveryMethod === 'Self Pickup' ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                >
                                    <MapPin size={24} className={formData.deliveryMethod === 'Self Pickup' ? 'text-orange-600' : 'text-gray-300'} />
                                    <span className="text-xs font-black uppercase tracking-widest">Self Pick Up</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: 'Home Delivery' }))}
                                    className={`px-5 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.deliveryMethod === 'Home Delivery' ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                                >
                                    <Truck size={24} className={formData.deliveryMethod === 'Home Delivery' ? 'text-orange-600' : 'text-gray-300'} />
                                    <span className="text-xs font-black uppercase tracking-widest">Send To Home</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payment Options Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                <CreditCard size={16} />
                            </div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Pay For Ride</h3>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Cash At Pickup' }))}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${formData.paymentMethod === 'Cash At Pickup' ? 'bg-orange-500 text-white shadow-orange-200 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                Cash At Pickup
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Online' }))}
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm ${formData.paymentMethod === 'Online' ? 'bg-orange-500 text-white shadow-orange-200 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                Pay Online Now
                            </button>
                        </div>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-gray-900 rounded-[32px] p-6 text-white shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Ride Cost</span>
                            <ShieldCheck size={20} className="text-orange-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                    Base Ride Cost
                                </span>
                                <span className="font-bold">NPR {rentalCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Extra Delivery Fee</span>
                                <span className="font-bold">NPR {deliveryCharge.toLocaleString()}</span>
                            </div>
                            <div className="pt-3 border-t border-gray-800 flex justify-between items-baseline">
                                <span className="text-lg font-black uppercase tracking-tighter">Total Price Due</span>
                                <span className="text-2xl font-black text-orange-500 tracking-tight">NPR {totalAmount.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-orange-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 size={24} className="animate-spin" />
                        ) : (
                            <>
                                Book My Ride
                                <ChevronRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
