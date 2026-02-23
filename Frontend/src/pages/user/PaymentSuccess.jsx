import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, XCircle, ArrowRight } from 'lucide-react';
import api from '../../utils/api';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your payment with eSewa...');

    const paymentId = searchParams.get('paymentId');
    const data = searchParams.get('data');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!data) {
                setStatus('error');
                setMessage('Missing payment verification data. Please contact support.');
                setVerifying(false);
                return;
            }

            try {
                // We prioritize paymentId if present, but the backend now handles lookups via data payload too
                const url = paymentId
                    ? `/api/payment/verify?paymentId=${paymentId}&data=${data}`
                    : `/api/payment/verify?data=${data}`;

                const response = await api.get(url);
                if (response.data.success) {
                    setStatus('success');
                    setMessage('Your payment has been successfully verified! Your booking is now confirmed.');
                } else {
                    setStatus('error');
                    setMessage(response.data.message || 'Verification failed. Please contact support.');
                }
            } catch (err) {
                console.error('Verification error:', err);
                setStatus('error');
                const errorMsg = err.response?.data?.message || 'Error connecting to verification server.';
                const statusCode = err.response?.status ? `(Status: ${err.response.status})` : '';
                setMessage(`${errorMsg} ${statusCode}`);
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [paymentId, data]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-grow flex items-center justify-center p-6 pt-32 pb-20">
                <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl p-10 text-center animate-zoomIn border border-gray-100">
                    {verifying ? (
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto text-orange-600 animate-pulse">
                                <Loader2 size={40} className="animate-spin" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Verifying</h2>
                            <p className="text-gray-500 font-medium italic">{message}</p>
                        </div>
                    ) : status === 'success' ? (
                        <div className="space-y-6">
                            <div className="w-24 h-24 bg-green-500 rounded-[35px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-green-200">
                                <CheckCircle2 size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">Payment Success!</h2>
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] bg-green-50 py-1 px-4 rounded-full inline-block">Transaction Verified</p>
                            </div>
                            <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
                            <button
                                onClick={() => navigate('/browse')}
                                className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3 group"
                            >
                                Browse More Bikes
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="w-24 h-24 bg-red-500 rounded-[35px] flex items-center justify-center mx-auto text-white shadow-2xl shadow-red-200">
                                <XCircle size={48} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none">Uh Oh!</h2>
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em] bg-red-50 py-1 px-4 rounded-full inline-block">Verification Problem</p>
                            </div>
                            <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={() => navigate('/browse')}
                                    className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-orange-700 transition-all"
                                >
                                    Return To Browse
                                </button>
                                <button
                                    onClick={() => navigate('/contact')}
                                    className="w-full bg-gray-100 text-gray-600 py-4 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all border border-gray-200"
                                >
                                    Contact Support
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PaymentSuccess;
