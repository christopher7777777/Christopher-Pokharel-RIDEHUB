import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, MessageSquare } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const PaymentFailure = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-6 pt-32 pb-20">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center animate-zoomIn border border-gray-100">
                    <div className="space-y-6">
                        <div className="w-24 h-24 bg-red-100 rounded-[35px] flex items-center justify-center mx-auto text-red-600 shadow-xl shadow-red-50">
                            <XCircle size={48} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">Payment Failed</h2>
                            <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] bg-red-50 py-1 px-4 rounded-full inline-block">Transaction Cancelled</p>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            Something went wrong with your payment request. You might have cancelled the transaction or there was a technical glitch.
                        </p>
                        <div className="pt-4 space-y-3">
                            <button
                                onClick={() => navigate('/browse')}
                                className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 group"
                            >
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Try Another Bike
                            </button>
                            <button
                                onClick={() => navigate('/contact')}
                                className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3"
                            >
                                <MessageSquare size={18} />
                                Talk To Support
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentFailure;
