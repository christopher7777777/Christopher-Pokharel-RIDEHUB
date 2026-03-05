import React, { useState, useEffect } from 'react';
import { Calculator, Percent, Calendar, DollarSign, ArrowRight, Info } from 'lucide-react';

const EMICalculator = ({ bikePrice, onApply }) => {
    const minDownPayment = Math.round(bikePrice * 0.2); // 20% min down payment
    const [downPayment, setDownPayment] = useState(minDownPayment);
    const [tenure, setTenure] = useState(24); // 24 months default
    const [interestRate, setInterestRate] = useState(12);
    const [monthlyEMI, setMonthlyEMI] = useState(0);

    const loanAmount = bikePrice - downPayment;
    const totalPayable = monthlyEMI * tenure;
    const totalInterest = Math.max(0, totalPayable - loanAmount);

    useEffect(() => {
        const principal = loanAmount;
        const monthlyRate = interestRate / 12 / 100;
        const numberOfPayments = tenure;

        if (principal <= 0) {
            setMonthlyEMI(0);
            return;
        }

        if (monthlyRate === 0) {
            setMonthlyEMI(Math.round(principal / numberOfPayments));
            return;
        }

        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        setMonthlyEMI(Math.round(emi));
    }, [downPayment, tenure, interestRate, bikePrice]);

    return (
        <div className="bg-white rounded-[35px] border border-gray-100 shadow-xl overflow-hidden p-8 space-y-8 animate-fadeIn">
            <h2 className="text-3xl font-black text-center text-slate-900 mb-2">EMI Calculator</h2>

            <div className="space-y-6">
                {/* Loan Amount Input (Price - DownPayment) */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 block">Loan Amount</label>
                    <div className="relative group">
                        <input
                            type="number"
                            readOnly
                            value={loanAmount}
                            className="w-full bg-white border border-slate-200 rounded-2xl p-5 font-black text-lg text-slate-900 outline-none transition-all cursor-not-allowed group-hover:border-slate-300"
                        />
                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            Locked
                        </div>
                    </div>
                </div>

                {/* Interest Rate Input */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 block">Interest Rate (% per year)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-2xl p-5 font-black text-lg text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                    />
                </div>

                {/* Loan Tenure Input */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 block">Loan Tenure (months)</label>
                    <input
                        type="number"
                        value={tenure}
                        onChange={(e) => setTenure(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-slate-200 rounded-2xl p-5 font-black text-lg text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all"
                    />
                </div>
            </div>

            <div className="pt-8 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors italic">Monthly EMI</span>
                    <span className="text-2xl font-black text-slate-900">Rs {monthlyEMI.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors italic">Total Interest</span>
                    <span className="text-xl font-black text-slate-700">Rs {totalInterest.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center group">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors italic">Total Payable</span>
                    <span className="text-xl font-black text-orange-600">Rs {totalPayable.toLocaleString()}</span>
                </div>
            </div>

            <button
                onClick={() => onApply({
                    totalPrice: bikePrice,
                    downPayment,
                    loanAmount,
                    interestRate,
                    tenure,
                    monthlyEMI
                })}
                className="w-full mt-4 bg-orange-600 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-950/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group"
            >
                APPLY FOR FINANCE <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    );
};

export default EMICalculator;
