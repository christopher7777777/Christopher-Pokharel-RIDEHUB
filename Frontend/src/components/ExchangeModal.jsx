import React, { useState } from 'react';
import { X, Bike, Calendar, Gauge, Zap, AlertCircle, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';

const ExchangeModal = ({ isOpen, onClose, bike, onConfirm }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        modelYear: '',
        engineCapacity: '',
        mileage: '',
        condition: 'Good'
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await onConfirm(formData);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 3000);
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn max-h-[90vh] flex flex-col border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Swap Your Bike</h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Enter Bike Info</p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Swap Request Sent</h3>
                            <p className="text-sm text-gray-500 italic">Wait For Review</p>
                        </div>
                    ) : (
                        <form id="exchange-form" onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-3xl flex items-center gap-3 text-sm font-bold animate-shake">
                                    <AlertCircle size={18} /> {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Your Bike Name</label>
                                    <input
                                        required
                                        name="name"
                                        placeholder="e.g. Pulsar NS 200"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Make Of Bike</label>
                                    <input
                                        required
                                        name="brand"
                                        placeholder="e.g. Bajaj"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Year Of Build</label>
                                    <input
                                        required
                                        type="number"
                                        name="modelYear"
                                        placeholder="2022"
                                        value={formData.modelYear}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Engine Size CC</label>
                                    <input
                                        required
                                        type="number"
                                        name="engineCapacity"
                                        placeholder="200"
                                        value={formData.engineCapacity}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mileage In KM</label>
                                    <input
                                        required
                                        type="number"
                                        name="mileage"
                                        placeholder="15000"
                                        value={formData.mileage}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Bike State</label>
                                <select
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 focus:bg-white rounded-2xl text-sm font-bold transition-all outline-none appearance-none"
                                >
                                    <option value="Excellent">Excellent (Like New)</option>
                                    <option value="Good">Good (Minor Scratches)</option>
                                    <option value="Average">Average (Visible Wear)</option>
                                    <option value="Poor">Poor (Needs Repair)</option>
                                </select>
                            </div>

                            <div className="bg-orange-50 rounded-[32px] p-6 text-orange-900 border border-orange-100">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 text-orange-600 shadow-sm">
                                        <Bike size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black uppercase tracking-tight">Save On Price</p>
                                        <p className="text-[11px] font-medium opacity-80 leading-relaxed italic mt-1">
                                            Deducted From Cost
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {!success && (
                    <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                        <button
                            form="exchange-form"
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gray-900 hover:bg-black text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-gray-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    Start Swap Process
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExchangeModal;
