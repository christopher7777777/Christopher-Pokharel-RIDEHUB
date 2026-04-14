import React, { useState, useEffect } from 'react';
import {
    X,
    Calculator,
    Percent,
    Calendar,
    ArrowRight,
    Info,
    ShieldCheck,
    TrendingUp
} from 'lucide-react';

export default function EMIModal({ isOpen, onClose, bike, onApply }) {
    const bikePrice = bike?.price || 0;
    const minDownPayment = Math.round(bikePrice * 0.2);

    const [downPayment, setDownPayment] = useState(0);
    const [rawInput, setRawInput] = useState('');
    const [tenure, setTenure] = useState(24);
    const [interestRate, setInterestRate] = useState(12);
    const [monthlyEMI, setMonthlyEMI] = useState(0);

    // Initialize down payment when bike/modal changes
    useEffect(() => {
        if (isOpen && bikePrice) {
            const initial = Math.round(bikePrice * 0.2);
            setDownPayment(initial);
            setRawInput(String(initial));
        }
    }, [isOpen, bikePrice]);

    useEffect(() => {
        if (!isOpen || !bikePrice) return;

        const principal = bikePrice - downPayment;
        const monthlyRate = interestRate / 12 / 100;
        const numberOfPayments = tenure;

        if (monthlyRate === 0) {
            setMonthlyEMI(Math.round(principal / numberOfPayments));
        } else {
            const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            setMonthlyEMI(Math.round(emi));
        }
    }, [downPayment, tenure, interestRate, bikePrice]);

    const handleDownPaymentChange = (e) => {
        // Allow free typing — don't block mid-edit
        setRawInput(e.target.value);
        const value = parseInt(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= bikePrice) {
            setDownPayment(value);
        }
    };

    const handleDownPaymentBlur = () => {
        // Enforce minimum on blur
        const value = parseInt(rawInput);
        const clamped = isNaN(value)
            ? minDownPayment
            : Math.min(bikePrice, Math.max(minDownPayment, value));
        setDownPayment(clamped);
        setRawInput(String(clamped));
    };

    const loanAmount = bikePrice - downPayment;

    if (!isOpen || !bike) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fadeIn"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-modalIn">
                {/* Header */}
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Personal Financing</h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Setup Your Loan Preference</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 pt-4 space-y-10 max-h-[70vh] overflow-y-auto scrollbar-none">
                    {/* Section 1: Principal Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-black text-sm">
                                RS
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Financing Base</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Bike Price</p>
                                <p className="text-xl font-black text-slate-900">RS {bikePrice.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Principal Loan</p>
                                <p className="text-xl font-black text-orange-600">RS {loanAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2 mb-3 block">Down Payment (Min 20%)</label>
                            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                                <span className="text-sm font-black text-slate-400 mr-2">RS</span>
                                <input
                                    type="number"
                                    min={minDownPayment}
                                    max={bikePrice}
                                    value={rawInput}
                                    onChange={handleDownPaymentChange}
                                    onBlur={handleDownPaymentBlur}
                                    className="w-full bg-transparent outline-none text-lg font-black text-slate-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-[10px] font-bold text-slate-400 ml-2 whitespace-nowrap">min RS {minDownPayment.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Loan Terms */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                <Calendar size={18} />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Loan Configure</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Choose Tenure</p>
                                <div className="flex flex-wrap gap-2">
                                    {[12, 24, 36].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setTenure(m)}
                                            className={`px-4 py-3 rounded-xl font-black text-xs transition-all border ${tenure === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-100 hover:border-orange-200'}`}
                                        >
                                            {m} MO
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Interest Rate</p>
                                <select
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 font-black text-xs text-slate-900 outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                >
                                    {[10, 11, 12, 13, 14].map(rate => (
                                        <option key={rate} value={rate}>{rate}% Annual</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Safe Info */}
                    <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 flex gap-4">
                        <ShieldCheck size={20} className="text-green-500 flex-shrink-0" />
                        <div>
                            <p className="text-xs text-slate-800 font-bold leading-relaxed italic uppercase tracking-tighter">Verified Facilitation</p>
                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">RideHub partners with certified banks in Nepal. Final rates are subject to verification.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Section - Design match */}
                <div className="p-8 bg-slate-900">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 italic">Your Plan Cost</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-white">RS {monthlyEMI.toLocaleString()}</span>
                                <span className="text-xs font-black text-orange-500 uppercase italic">/ month</span>
                            </div>
                        </div>
                        <TrendingUp size={24} className="text-white/20" />
                    </div>

                    <button
                        onClick={() => onApply({
                            totalPrice: bikePrice,
                            downPayment,
                            loanAmount: bikePrice - downPayment,
                            interestRate,
                            tenure,
                            monthlyEMI
                        })}
                        className="w-full bg-orange-600 text-white py-5 rounded-[22px] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-orange-950/40 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group"
                    >
                        APPLY FOR THIS LOAN <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center mt-4 text-[10px] text-white/30 font-black uppercase tracking-widest">RideHub FacilitatedLead</p>
                </div>
            </div>
        </div>
    );
};


