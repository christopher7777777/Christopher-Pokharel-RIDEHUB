import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import {
    Calculator,
    Zap,
    ShieldCheck,
    Info,
    ChevronRight,
    CheckCircle2,
    TrendingUp,
    Smartphone,
    Globe,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const EMICalculatorPage = () => {
    const [bikePrice, setBikePrice] = useState(250000);
    const [downPayment, setDownPayment] = useState(50000);
    const [tenure, setTenure] = useState(24);
    const [interestRate, setInterestRate] = useState(12);
    const [monthlyEMI, setMonthlyEMI] = useState(0);

    const calculateEMI = () => {
        const principal = bikePrice - downPayment;
        const monthlyRate = interestRate / 12 / 100;
        const numberOfPayments = tenure;

        if (principal <= 0) {
            setMonthlyEMI(0);
            return;
        }

        if (monthlyRate === 0) {
            setMonthlyEMI(principal / numberOfPayments);
            return;
        }

        const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
        setMonthlyEMI(Math.round(emi));
    };

    useEffect(() => {
        calculateEMI();
    }, [bikePrice, downPayment, tenure, interestRate]);

    // Financial breakdown calculations
    const loanAmount = Math.max(0, bikePrice - downPayment);
    const totalPayable = monthlyEMI * tenure;
    const totalInterest = Math.max(0, totalPayable - loanAmount);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Header />

            <main className="pt-32 pb-20">
                {/* Hero section */}
                <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full mb-6 border border-orange-100 animate-fadeIn">
                        <Zap size={14} className="text-orange-600" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Financing Made Easy</span>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                        Calculate Your <span className="text-orange-600">Dream Ride</span> EMI
                    </h1>
                    <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed italic">
                        Real-time estimates for bike financing in Nepal. Adjust your down payment and tenure to find a plan that fits your budget.
                    </p>
                </section>

                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-10">
                    {/* Left: Interactive Controls */}
                    <div className="lg:col-span-7 space-y-10">
                        <div className="bg-slate-50 rounded-[40px] p-10 border border-gray-100 shadow-sm relative overflow-hidden group">
                            {/* Decorative element */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-400/5 rounded-full blur-3xl group-hover:bg-orange-400/10 transition-all"></div>

                            <h3 className="text-xl font-black text-gray-900 mb-10 flex items-center gap-3">
                                <Calculator className="text-orange-600" size={24} /> Adjust Parameters
                            </h3>

                            <div className="space-y-12">
                                {/* Bike Price Input */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Expected Bike Price (NPR)</label>
                                        <span className="text-2xl font-black text-gray-900">Rs {bikePrice.toLocaleString()}</span>
                                    </div>
                                    <input
                                        type="range" min="50000" max="2500000" step="5000"
                                        value={bikePrice} onChange={(e) => setBikePrice(parseInt(e.target.value))}
                                        className="w-full h-3 bg-gray-200 rounded-2xl appearance-none cursor-pointer accent-orange-600"
                                    />
                                </div>

                                {/* Down Payment Input */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Down Payment (NPR)</label>
                                        <div className="text-right">
                                            <span className="text-2xl font-black text-orange-600">Rs {downPayment.toLocaleString()}</span>
                                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase">({Math.round(downPayment / bikePrice * 100)}% of Total)</p>
                                        </div>
                                    </div>
                                    <input
                                        type="range" min="0" max={bikePrice} step="5000"
                                        value={downPayment} onChange={(e) => setDownPayment(parseInt(e.target.value))}
                                        className="w-full h-3 bg-gray-200 rounded-2xl appearance-none cursor-pointer accent-orange-600"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Loan Tenure</label>
                                        <div className="flex flex-wrap gap-2">
                                            {[12, 24, 36, 48].map(m => (
                                                <button
                                                    key={m} onClick={() => setTenure(m)}
                                                    className={`px-6 py-3 rounded-xl font-black text-xs transition-all ${tenure === m ? 'bg-orange-600 text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-500 hover:border-orange-200'}`}
                                                >
                                                    {m} MO
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Interest Rate (%)</label>
                                        <select
                                            value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                                            className="w-full bg-white border border-gray-100 rounded-xl p-3 font-black text-xs outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                                        >
                                            <option value={10}>10% Annual</option>
                                            <option value={12}>12% Annual</option>
                                            <option value={13}>13% Annual</option>
                                            <option value={14}>14% Annual</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Features Info */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: "Instant Lead Generation", desc: "Apply and get forwarded to top banks in Nepal within 24 hours.", icon: Globe },
                                { title: "Simple Paperwork", desc: "Our partners require minimal documents for RideHub verified leads.", icon: Smartphone }
                            ].map((f, i) => (
                                <div key={i} className="bg-white border border-gray-100 p-8 rounded-[35px] hover:shadow-xl transition-all group">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-all">
                                        <f.icon size={24} />
                                    </div>
                                    <h4 className="text-lg font-black text-gray-900 mb-3">{f.title}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Results & Summary */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Result Card */}
                        <div className="bg-slate-900 rounded-[45px] p-10 text-white shadow-2xl sticky top-40 overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>

                            <div className="relative">
                                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4">Estimated Monthly EMI</p>
                                <div className="flex items-baseline gap-2 mb-10">
                                    <span className="text-5xl lg:text-6xl font-black tracking-tighter">NPR {monthlyEMI.toLocaleString()}</span>
                                    <span className="text-sm text-slate-400 font-bold uppercase italic">/ month</span>
                                </div>

                                <div className="space-y-6 pt-10 border-t border-white/10">
                                    <div className="flex justify-between items-center group">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <ShieldCheck size={14} className="text-green-500" /> Loan Amount
                                        </span>
                                        <span className="text-sm font-black group-hover:text-orange-500 transition-colors">Rs {loanAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp size={14} className="text-blue-500" /> Total Interest
                                        </span>
                                        <span className="text-sm font-black group-hover:text-orange-500 transition-colors">Rs {totalInterest.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center group">
                                        <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Grand Total</span>
                                        <span className="text-sm font-black text-orange-500">Rs {totalPayable.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="mt-12 bg-white/5 rounded-3xl p-6 border border-white/5 backdrop-blur-sm">
                                    <div className="flex gap-4">
                                        <Info size={20} className="text-orange-500 shrink-0" />
                                        <p className="text-[10px] text-slate-300 leading-relaxed italic">
                                            Calculations are based on the reducing balance method. Terms and conditions of the respective banks apply.
                                            RideHub is a facilitation platform.
                                        </p>
                                    </div>
                                </div>

                                <Link to="/browse" className="mt-10 w-full bg-orange-600 text-white py-5 rounded-[22px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-orange-900/40 hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group">
                                    Find A Bike To Finance <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="bg-green-50 border border-green-100 p-6 rounded-[30px] flex items-center gap-5">
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shrink-0">
                                <CheckCircle2 size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-1">NRB Compliance</p>
                                <p className="text-[10px] text-green-600 font-medium italic leading-relaxed">We only partner with Class 'A' and 'B' financial institutions licensed by Nepal Rastra Bank.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default EMICalculatorPage;
