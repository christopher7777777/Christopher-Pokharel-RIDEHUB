import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const [success, setSuccess] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP, resendOTP } = useAuth();
    
    // Get email from query params
    const email = new URLSearchParams(location.search).get('email');

    useEffect(() => {
        if (!email) {
            navigate('/register');
        }
    }, [email, navigate]);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;
        
        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.some(char => isNaN(char))) return;

        const newOtp = [...otp];
        pastedData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        
        // Focus last filled or next empty
        const lastIndex = Math.min(pastedData.length, 5);
        document.getElementById(`otp-${lastIndex}`)?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpString = otp.join('');
        
        if (otpString.length < 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setError('');
        setLoading(true);

        try {
            const result = await verifyOTP(email, otpString);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 1500);
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        
        setResending(true);
        setError('');
        try {
            await resendOTP(email);
            setTimer(60);
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col pt-16 md:pt-20">
                <Header />
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Verified!</h2>
                        <p className="text-slate-500 mb-8 font-medium">Your account has been successfully verified. Redirecting you to login...</p>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-8">
                            <div className="bg-green-500 h-full animate-[progress_1.5s_linear]"></div>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-16 md:pt-20">
            <Header />
            <div className="flex-grow flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-100/40 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/40 rounded-full blur-[120px] -z-10 -translate-x-1/3 translate-y-1/3"></div>

                <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white p-8 md:p-12">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-600/20 transform -rotate-6">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight mb-3">Verify Email</h2>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            We've sent a 6-digit code to <br />
                            <span className="text-slate-900 font-bold">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl mb-8 text-xs font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex justify-between gap-2 md:gap-3">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={handlePaste}
                                    className="w-full h-14 md:h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.some(d => !d)}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-slate-800 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center shadow-lg"
                        >
                            {loading ? (
                                <RefreshCw className="w-5 h-5 animate-spin" />
                            ) : (
                                'Verify Account'
                            )}
                        </button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={timer > 0 || resending}
                                className="text-sm font-bold text-orange-600 hover:text-orange-700 disabled:text-slate-400 transition-colors uppercase tracking-widest flex items-center justify-center mx-auto gap-2"
                            >
                                {resending ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : timer > 0 ? (
                                    `Resend code in ${timer}s`
                                ) : (
                                    'Resend Code'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                            Wrong email address?{' '}
                            <button onClick={() => navigate('/register')} className="text-orange-600 hover:underline">
                                Change it
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default VerifyOTP;
