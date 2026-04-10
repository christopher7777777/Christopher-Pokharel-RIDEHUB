import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            const result = await register(formData);
            if (result.success) {
                toast.success('Registration successful! Please verify your email.');
                navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
            }
        } catch (err) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Subtle background orange glow */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[120px] -z-10 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[120px] -z-10 translate-x-1/2 translate-y-1/2"></div>

            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden bg-white border border-gray-100">
                {/* Left Side - Branding */}
                <div className="bg-slate-900 p-12 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-600/20 to-transparent"></div>

                    <div className="relative z-10">
                        <h1 className="text-4xl font-extrabold text-white mb-4 uppercase tracking-tight">
                            Your Journey <br />
                            <span className="text-orange-500">Starts Here</span>
                        </h1>
                        <p className="text-slate-400 mb-10 leading-relaxed font-semibold">
                            Connect with us, take ownership, and discover amazing experiences. Join thousands of motorcycle enthusiasts on RIDEHUB
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                                    <svg className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Find Riding Partners</h3>
                                    <p className="text-sm text-slate-400">Connect with fellow riders who share your road adventures together</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                                    <svg className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Discover Routes</h3>
                                    <p className="text-sm text-slate-400">Explore scenic paths and trails other riders absolutely love navigating</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 group">
                                <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                                    <svg className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white mb-1">Join Community</h3>
                                    <p className="text-sm text-slate-400">Be part of a diverse community of motorcycle enthusiasts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Register Form */}
                <div className="bg-white p-12 flex flex-col justify-center overflow-y-auto max-h-[90vh] custom-scrollbar">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-6">
                            <img
                                src="/image5.png"
                                alt="RIDEHUB Logo"
                                className="h-16 w-auto object-contain hover:scale-105 transition-transform duration-300"
                            />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-tight mb-1">Welcome</h2>
                        <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider opacity-60 italic">Create an account to get started</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 text-xs font-semibold uppercase tracking-widest text-center shadow-sm">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-slate-700 text-[11px] font-semibold uppercase tracking-widest mb-2 ml-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-[11px] font-semibold uppercase tracking-widest mb-2 ml-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-slate-700 text-[11px] font-semibold uppercase tracking-widest mb-2 ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm"
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-[11px] font-semibold uppercase tracking-widest mb-2 ml-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-sm"
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-orange-600 transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-700 text-[11px] font-semibold uppercase tracking-widest mb-2 ml-1">
                                Register as
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 font-semibold uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all text-[11px] appearance-none cursor-pointer"
                            >
                                <option value="user">Customer</option>
                                <option value="seller">Seller</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 text-white py-4 px-6 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/20 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center shadow-lg shadow-orange-600/10 mt-2"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white mr-3"></div>
                                    Registering...
                                </div>
                            ) : (
                                'REGISTER'
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                                Already have an account?{' '}
                                <Link to="/login" className="text-orange-600 hover:text-orange-700 hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
