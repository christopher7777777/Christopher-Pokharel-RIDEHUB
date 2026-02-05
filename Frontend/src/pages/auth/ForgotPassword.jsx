import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await api.post('/api/auth/forgotpassword', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
            <Header />
            <main className="flex-1 flex items-center justify-center p-6 bg-slate-50/50">
                <div className="w-full max-w-md animate-fadeIn">
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-orange-100/50 border border-gray-100 overflow-hidden">
                        <div className="p-8 lg:p-12">
                            <div className="mb-10">
                                <h1 className="text-3xl font-black text-gray-900 mb-3">Forgot Password?</h1>
                                <p className="text-gray-500 font-medium">Enter your email and we'll send you a link to reset your password.</p>
                            </div>

                            {message ? (
                                <div className="text-center py-6 animate-zoomIn">
                                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 size={40} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h3>
                                    <p className="text-gray-500 mb-8">{message}</p>
                                    <Link
                                        to="/login"
                                        className="inline-flex items-center gap-2 text-orange-600 font-black uppercase tracking-widest text-sm hover:gap-3 transition-all"
                                    >
                                        <ArrowLeft size={16} /> Back to Login
                                    </Link>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-bold animate-shake">
                                            {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-1">
                                            Email Address
                                        </label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-14 pr-6 py-5 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                                                placeholder="Enter your email"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 disabled:bg-gray-400 transition-all shadow-xl shadow-orange-900/20 uppercase tracking-widest text-sm flex items-center justify-center gap-3 transform active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Sending Link...
                                            </>
                                        ) : (
                                            'Send Reset Link'
                                        )}
                                    </button>

                                    <div className="text-center pt-4">
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center gap-2 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-orange-600 transition-colors"
                                        >
                                            <ArrowLeft size={14} /> Back to Login
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
