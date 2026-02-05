import React, { useState } from 'react';
import { X, Bike, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const ValuationModal = ({ isOpen, onClose, bike, onValuate }) => {
    const [valuation, setValuation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !bike) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!valuation || isNaN(valuation)) {
            setError('Please enter a valid price');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await onValuate(bike._id, Number(valuation));
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Valuation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Exchange Valuation</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Bike info */}
                    <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exchange Bike Details</p>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm text-orange-600">
                                <Bike size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{bike.exchangeBikeDetails?.name}</h4>
                                <p className="text-xs text-slate-500">{bike.exchangeBikeDetails?.brand} • {bike.exchangeBikeDetails?.modelYear} • {bike.exchangeBikeDetails?.engineCapacity}CC</p>
                            </div>
                        </div>
                        <div className="flex gap-4 pt-2 border-t border-slate-200">
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Condition</p>
                                <p className="text-xs font-bold text-slate-700">{bike.exchangeBikeDetails?.condition}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">Mileage</p>
                                <p className="text-xs font-bold text-slate-700">{bike.exchangeBikeDetails?.mileage} KM</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-600">Valuation Amount (NPR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs.</span>
                                <input
                                    type="number"
                                    required
                                    value={valuation}
                                    onChange={(e) => setValuation(e.target.value)}
                                    placeholder="Enter market value"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-600/20"
                                    autoFocus
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 italic mt-1">* This amount will be deducted from the price of <b>{bike.name}</b>.</p>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg flex items-center gap-2">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> CONFIRM VALUATION</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ValuationModal;
