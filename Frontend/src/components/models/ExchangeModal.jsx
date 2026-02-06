import React, { useState } from 'react';
import { X, Bike, Calendar, Gauge, Zap, AlertCircle, Loader2, ChevronRight, CheckCircle2, Upload } from 'lucide-react';

const ExchangeModal = ({ isOpen, onClose, bike, onConfirm, onProceed }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [step, setStep] = useState('form'); // 'form' or 'result'
    const [valuationResult, setValuationResult] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        modelYear: '',
        engineCapacity: '',
        mileage: '',
        condition: 'Good'
    });

    const [files, setFiles] = useState({
        blueBookPhoto: null,
        bikeModelPhoto: null,
        fullBikePhoto: null,
        meterPhoto: null
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        if (selectedFiles && selectedFiles[0]) {
            setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const data = new FormData();
            data.append('exchangeBikeDetails', JSON.stringify(formData));

            if (files.blueBookPhoto) data.append('blueBookPhoto', files.blueBookPhoto);
            if (files.bikeModelPhoto) data.append('bikeModelPhoto', files.bikeModelPhoto);
            if (files.fullBikePhoto) data.append('fullBikePhoto', files.fullBikePhoto);
            if (files.meterPhoto) data.append('meterPhoto', files.meterPhoto);

            const result = await onConfirm(data);
            setValuationResult(result.exchangeValuation || 0);
            setStep('result');
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleProceedClick = () => {
        if (onProceed) onProceed();
        // Reset state slightly delayed or just close
        setTimeout(() => {
            setStep('form');
            setFormData({
                name: '', brand: '', modelYear: '', engineCapacity: '', mileage: '', condition: 'Good'
            });
            setFiles({ blueBookPhoto: null, bikeModelPhoto: null, fullBikePhoto: null, meterPhoto: null });
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-zoomIn max-h-[90vh] flex flex-col border border-gray-100">
                {/* Header */}
                <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {step === 'result' ? 'Valuation Result' : 'Swap Your Bike'}
                        </h2>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                            {step === 'result' ? 'Confirm & Proceed' : 'Enter Bike Info'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-gray-900 shadow-sm border border-transparent hover:border-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                    {step === 'result' ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center animate-fadeIn space-y-6">
                            <div className="w-24 h-24 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mb-2 mx-auto shadow-lg shadow-orange-100">
                                <Zap size={48} fill="currentColor" className="opacity-20 hidden" />
                                <span className="text-3xl font-black">NPR</span>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-gray-900">
                                    {valuationResult > 0 ? valuationResult.toLocaleString() : 'Pending'}
                                </h3>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Estimated Valuation Price</p>
                            </div>

                            <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                                {valuationResult > 0
                                    ? "Based on your bike details, this amount will be deducted from your purchase."
                                    : "We couldn't estimate a price instantly. Our team will review your request manually."}
                            </p>

                            <div className="flex flex-col gap-3 w-full pt-4">
                                <div className="bg-blue-50 p-4 rounded-2xl text-blue-800 text-xs font-bold text-left">
                                    <p>Do you want to proceed with the purchase using this valuation?</p>
                                </div>
                            </div>
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

                            {/* Photo Uploads */}
                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                    Required Photos <span className="text-orange-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { name: 'blueBookPhoto', label: 'Blue Book' },
                                        { name: 'bikeModelPhoto', label: 'Bike Model' },
                                        { name: 'fullBikePhoto', label: 'Full Bike' },
                                        { name: 'meterPhoto', label: 'Odometer' }
                                    ].map((field) => (
                                        <div key={field.name} className="relative group">
                                            <input
                                                type="file"
                                                name={field.name}
                                                id={field.name}
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                required
                                            />
                                            <label
                                                htmlFor={field.name}
                                                className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${files[field.name]
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-500'
                                                    }`}
                                            >
                                                {files[field.name] ? (
                                                    <>
                                                        <CheckCircle2 size={20} className="mb-2" />
                                                        <span className="text-[10px] font-black uppercase">{field.label} Added</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload size={20} className="mb-2" />
                                                        <span className="text-[10px] font-black uppercase text-center">{field.label}</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-gray-100">
                    {step === 'result' ? (
                        <div className="flex gap-4">
                            <button
                                onClick={onClose}
                                className="flex-1 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={handleProceedClick}
                                className="flex-[2] bg-green-600 hover:bg-green-700 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-3"
                            >
                                Yes, Proceed
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    ) : (
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
                                    Calculate Value
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExchangeModal;
