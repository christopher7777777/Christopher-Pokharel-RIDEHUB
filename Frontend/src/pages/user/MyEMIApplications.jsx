import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { Loader2, FileText, Bike, Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const MyEMIApplications = () => {
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/emi/my-applications');
                setApplications(response.data.data || []);
            } catch (err) {
                setError('Failed to fetch EMI applications');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleCompleteEMI = async (id) => {
        if (!window.confirm('Are you sure you want to mark this EMI as completed? This will set the bike as Purchased.')) return;
        try {
            setLoading(true);
            await api.put(`/api/emi/${id}/complete`);
            const response = await api.get('/api/emi/my-applications');
            setApplications(response.data.data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete EMI');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'text-green-600 bg-green-50 border-green-100';
            case 'Approved': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'Rejected': return 'text-red-600 bg-red-50 border-red-100';
            case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 size={40} className="text-orange-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fafafa]">
            <Header />
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 mb-2 uppercase tracking-tighter">My EMI Plans</h1>
                        <p className="text-gray-400 font-bold italic text-sm">Review your financing applications and active installment plans.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Plans</p>
                            <p className="text-2xl font-black text-gray-900 leading-none">{applications.length}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 bg-red-50 border border-red-100 p-6 rounded-[35px] flex items-center gap-4 text-red-700">
                        <AlertCircle size={24} />
                        <p className="text-sm font-black uppercase tracking-tight">{error}</p>
                    </div>
                )}

                {applications.length === 0 ? (
                    <div className="bg-white rounded-[50px] p-24 text-center border border-gray-100 shadow-2xl shadow-gray-200/50">
                        <div className="w-24 h-24 bg-gray-50 rounded-[35px] flex items-center justify-center mx-auto mb-8 border border-gray-100">
                            <FileText size={40} className="text-gray-200" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 uppercase">No EMI Found</h2>
                        <p className="text-gray-400 mb-10 max-w-sm mx-auto italic font-medium leading-relaxed">It seems you haven't applied for any finance plans yet. Explore our bike listings to find your match!</p>
                        <a href="/browse" className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-900/20 hover:bg-orange-700 hover:-translate-y-1 transition-all inline-block">Start Browsing</a>
                    </div>
                ) : (
                    <div className="grid gap-8">
                        {applications.map((app) => (
                            <div key={app._id} className="bg-white rounded-[45px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
                                <div className="flex flex-col lg:row-span-1 lg:flex-row">
                                    {/* Bike Preview */}
                                    <div className="w-full lg:w-[450px] min-h-[300px] lg:min-h-full relative overflow-hidden">

                                        <img
                                            src={app.bike?.images?.[0] || '/placeholder-bike.png'}
                                            alt={app.bike?.name || 'Bike'}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        <div className={`absolute top-6 left-6 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.status)} backdrop-blur-xl shadow-lg`}>
                                            {app.status}
                                        </div>
                                    </div>

                                    {/* Application Details */}
                                    <div className="flex-1 p-8 lg:p-12">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-10">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded-lg">{app.bike?.brand}</span>
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model {app.bike?.modelYear}</span>
                                                </div>
                                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{app.bike?.name || 'Unknown Bike'}</h3>
                                                <div className="flex items-center gap-6 mt-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-orange-600" /> {new Date(app.createdAt).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-2 text-slate-900 border-l pl-6 border-gray-100">Plan: {app.loanDetails?.tenure} Months</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-6 rounded-[30px] border border-gray-100 text-center min-w-[180px]">
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1 italic">Monthly Installment</p>
                                                <p className="text-3xl font-black text-orange-600 tracking-tighter">Rs {app.loanDetails?.monthlyEMI?.toLocaleString() || '0'}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-gray-50">
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Total Amount</p>
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">Rs {app.loanDetails?.totalPrice?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Paid Upfront</p>
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">Rs {app.loanDetails?.downPayment?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Remaining Loan</p>
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">Rs {app.loanDetails?.loanAmount?.toLocaleString() || '0'}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-2">Interest Rate</p>
                                                <p className="text-sm font-black text-gray-900 italic tracking-tight">{app.loanDetails?.interestRate || '0'}% P.A.</p>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex flex-col md:flex-row items-center justify-between gap-6">
                                            {app.remarks ? (
                                                <div className="flex-1 flex gap-4 text-orange-900 bg-orange-50/50 p-6 rounded-[30px] border border-orange-100/50">
                                                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest mb-1">Back-office Notice</p>
                                                        <p className="text-xs font-medium italic leading-relaxed">{app.remarks}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1"></div>
                                            )}

                                            <div className="flex gap-4 w-full md:w-auto">
                                                {app.status === 'Approved' && (
                                                    <button
                                                        onClick={() => handleCompleteEMI(app._id)}
                                                        className="flex-1 md:flex-none bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-900/10 hover:bg-green-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        Mark Completed <CheckCircle2 size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => navigate(`/bike/${app.bike?._id}`)}
                                                    className="flex-1 md:flex-none bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                                >
                                                    View Details <ChevronRight size={16} />
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default MyEMIApplications;
