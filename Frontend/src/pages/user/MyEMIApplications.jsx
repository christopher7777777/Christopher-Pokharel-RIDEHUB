import React, { useState, useEffect } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import api from '../../utils/api';
import { Loader2, FileText, Bike, Calendar, Clock, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';

const MyEMIApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/emi/my-applications');
                setApplications(response.data.data);
            } catch (err) {
                setError('Failed to fetch EMI applications');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'text-green-600 bg-green-50 border-green-100';
            case 'Rejected': return 'text-red-600 bg-red-50 border-red-100';
            case 'Pending': return 'text-orange-600 bg-orange-50 border-orange-100';
            default: return 'text-blue-600 bg-blue-50 border-blue-100';
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
        <div className="min-h-screen bg-white">
            <Header />
            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">My EMI Applications</h1>
                    <p className="text-gray-500 font-medium italic">Track your bike financing requests and status here.</p>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-gray-50 rounded-[40px] p-16 text-center border border-gray-100">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <FileText size={32} className="text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-4">No Applications Yet</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto italic">Looks like you haven't applied for financing on any bikes. Browse our bikes to get started!</p>
                        <a href="/browse" className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-orange-700 transition-all inline-block">Explore Bikes</a>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {applications.map((app) => (
                            <div key={app._id} className="bg-white rounded-[35px] border border-gray-100 shadow-xl hover:shadow-2xl transition-all overflow-hidden group">
                                <div className="flex flex-col md:flex-row">
                                    {/* Bike Preview */}
                                    <div className="w-full md:w-64 h-48 md:h-auto relative overflow-hidden">
                                        <img
                                            src={app.bike.images[0]}
                                            alt={app.bike.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusColor(app.status)} backdrop-blur-md`}>
                                            {app.status}
                                        </div>
                                    </div>

                                    {/* Application Details */}
                                    <div className="flex-1 p-8">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black text-gray-900 mb-1">{app.bike.name}</h3>
                                                <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(app.createdAt).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1.5"><Clock size={12} /> Applied {new Date(app.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Monthly Cost</p>
                                                <p className="text-2xl font-black text-orange-600">Rs {app.loanDetails.monthlyEMI.toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-50">
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Bike Price</p>
                                                <p className="text-sm font-black text-gray-900 italic">Rs {app.loanDetails.totalPrice.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Down Payment</p>
                                                <p className="text-sm font-black text-gray-900 italic">Rs {app.loanDetails.downPayment.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Tenure</p>
                                                <p className="text-sm font-black text-gray-900 italic">{app.loanDetails.tenure} Months</p>
                                            </div>
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mb-1">Interest Rate</p>
                                                <p className="text-sm font-black text-gray-900 italic">{app.loanDetails.interestRate}% P.A.</p>
                                            </div>
                                        </div>

                                        {app.remarks && (
                                            <div className="mt-6 flex gap-3 text-orange-800 bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                                <AlertCircle size={18} className="flex-shrink-0" />
                                                <p className="text-[10px] font-medium italic"><strong>Admin Remarks:</strong> {app.remarks}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-center p-6 bg-gray-50 md:border-l border-gray-100">
                                        <button className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 hover:text-orange-600 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                            <ChevronRight size={24} />
                                        </button>
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
