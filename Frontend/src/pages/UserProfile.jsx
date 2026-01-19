import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import {
    User as UserIcon,
    Mail,
    Calendar,
    ShieldCheck,
    ShieldAlert,
    Key,
    UserCircle,
    CheckCircle2,
    XCircle,
    ArrowRight,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';

const UserProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Mock KYC status - in a real app, this would come from the user object
    const isKYCVerified = user?.isKYCVerified || false;

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onSavePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await api.put('/api/auth/updatepassword', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password updated successfully' });
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (err) {
            setMessage({
                type: 'error',
                text: err.response?.data?.message || 'Failed to update password'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
                        <div className="animate-fadeIn">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
                            <p className="text-gray-500 text-sm italic">Manage your personal information, security, and verification status.</p>
                        </div>

                        {/* Avatar Section */}
                        <div className="relative animate-zoomIn">
                            <div className="w-24 h-24 bg-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200">
                                <span className="text-4xl font-black text-white">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Profile Summary Card */}
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp">
                            <div className="mb-8">
                                <h2 className="text-xl font-black text-gray-900 mb-1">Profile Summary</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your basic account details.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Full Name</p>
                                    <p className="text-sm font-bold text-gray-900">{user?.name || 'User Name'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Email Address</p>
                                    <p className="text-sm font-bold text-gray-900">{user?.email || 'user@example.com'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Role</p>
                                    <p className="text-sm font-bold text-gray-900 capitalize">{user?.role || 'User'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 leading-none">Joined On</p>
                                    <p className="text-sm font-bold text-gray-900">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        }) : 'January 15, 2023'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp" style={{ animationDelay: '0.1s' }}>
                            <div className="mb-8">
                                <h2 className="text-xl font-black text-gray-900 mb-1">Change Password</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Update your password regularly for security.</p>
                            </div>

                            {message.text && (
                                <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 border ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                    <p className="text-sm font-bold">{message.text}</p>
                                </div>
                            )}

                            <form onSubmit={onSavePassword} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 leading-none">Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter current password"
                                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 leading-none">New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter new password"
                                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2 leading-none">Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Confirm new password"
                                        className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : 'Save Password'}
                                </button>
                            </form>
                        </div>

                        {/* KYC Verification Card */}
                        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 animate-slideInUp" style={{ animationDelay: '0.2s' }}>
                            <div className="mb-6">
                                <h2 className="text-xl font-black text-gray-900 mb-1">KYC Verification Status</h2>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Your Know Your Customer (KYC) status.</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-6 rounded-3xl bg-gray-50/50 border border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isKYCVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {isKYCVerified ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-gray-900">Status:</span>
                                            <div className="flex items-center gap-1.5">
                                                {isKYCVerified ? (
                                                    <>
                                                        <CheckCircle2 size={16} className="text-green-600" />
                                                        <span className="text-xs font-black text-green-600 uppercase tracking-widest">Verified</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle size={16} className="text-red-600" />
                                                        <span className="text-xs font-black text-red-600 uppercase tracking-widest">Not Verified</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 italic">
                                            {isKYCVerified
                                                ? "Your identity verification is currently complete and approved."
                                                : "Please complete your KYC verification to access all features."}
                                        </p>
                                    </div>
                                </div>

                                {!isKYCVerified && (
                                    <Link
                                        to="/kyc-verification"
                                        className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-orange-500 hover:text-orange-600 transition-all flex items-center justify-center gap-2 group shadow-sm"
                                    >
                                        VERIFY NOW <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default UserProfile;
