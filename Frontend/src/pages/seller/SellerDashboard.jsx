import React, { useState, useEffect } from 'react';
import SellerLayout from '../../components/SellerLayout';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    ShoppingBag,
    Bike,
    Clock,
    Plus,
    Filter,
    MessageSquare,
    Loader2,
    Mail,
    Phone,
    AlertCircle,
    ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, trend, isPositive, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                } `}>
                {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {trend}
            </div>
        </div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black text-gray-900">{value}</h3>
    </div>
);

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await api.get('/api/messages');
                setMessages(response.data.data);
            } catch (err) {
                console.error('Failed to fetch messages', err);
            } finally {
                setLoadingMessages(false);
            }
        };

        fetchMessages();
    }, []);

    return (
        <SellerLayout>
            <div className="animate-fadeIn">
                {/* KYC Notification Banner */}
                {user?.kycStatus !== 'verified' && (
                    <div className="mb-8 bg-orange-600 text-white p-4 rounded-3xl shadow-lg shadow-orange-900/10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-3 rounded-2xl">
                                    <AlertCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-lg font-black tracking-tight uppercase">Account Verification Required</p>
                                    <p className="text-sm text-orange-100 italic">
                                        {user?.kycStatus === 'pending'
                                            ? "Your identity documents are being reviewed. You'll be notified via email soon."
                                            : "Please complete your KYC to unlock all seller features including bike listings and rent management."}
                                    </p>
                                </div>
                            </div>
                            {user?.kycStatus !== 'pending' && (
                                <Link
                                    to="/seller/kyc"
                                    className="bg-white text-orange-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-50 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    Verify Now <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>
                    </div>
                )}

                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
                        <p className="text-gray-500 text-sm italic">Welcome back! Here's what's happening today.</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
                            <Filter size={18} /> Filters
                        </button>
                        <button
                            onClick={() => navigate('/seller/inventory')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-900/20 transform active:scale-95 transition-all"
                        >
                            <Plus size={18} /> Add New Ride
                        </button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Earnings"
                        value="RS 0"
                        trend="0 %"
                        isPositive={true}
                        icon={TrendingUp}
                        color="bg-green-600"
                    />
                    <StatCard
                        title="Active Listings"
                        value="0"
                        trend="0"
                        isPositive={true}
                        icon={Bike}
                        color="bg-orange-600"
                    />
                    <StatCard
                        title="New Orders"
                        value="0"
                        trend="0%"
                        isPositive={false}
                        icon={ShoppingBag}
                        color="bg-blue-600"
                    />
                    <div onClick={() => navigate('/seller/messages')} className="cursor-pointer">
                        <StatCard
                            title="Inquiries"
                            value={messages.length}
                            trend="New"
                            isPositive={true}
                            icon={MessageSquare}
                            color="bg-purple-600"
                        />
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Orders Section */}
                    <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
                            <button
                                onClick={() => navigate('/seller/bikes')}
                                className="text-orange-600 text-[10px] font-black uppercase tracking-widest hover:underline italic"
                            >
                                View all transactions
                            </button>
                        </div>

                        <div className="space-y-6">
                            {[
                                { bike: 'Ducati Panigale V4', customer: 'John Doe', type: 'Sale', amount: 'RS 24,000', status: 'Processing', time: '2h ago' },
                                { bike: 'Vespa Sprint 150', customer: 'Sarah Smith', type: 'Rental', amount: 'RS 450/day', status: 'Completed', time: '5h ago' },
                                { bike: 'BMW R1250 GS', customer: 'Mike Johnson', type: 'Exchange', amount: 'N/A', status: 'Pending', time: '1d ago' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 rounded-3xl hover:bg-gray-50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                                            🏍️
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{item.bike}</h4>
                                            <p className="text-[11px] text-gray-500 font-medium">{item.customer} • {item.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 mb-1">{item.amount}</p>
                                        <div className="flex items-center justify-end gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                item.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'
                                                } `}>
                                                {item.status}
                                            </span>
                                            <span className="text-[10px] text-gray-400 italic">{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Messages & Alerts */}
                    <div className="flex flex-col gap-8">
                        {/* Messages Section */}
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                <MessageSquare size={20} className="text-purple-600" /> Client Inquiries
                            </h3>

                            {loadingMessages ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="animate-spin text-purple-600" />
                                </div>
                            ) : messages.length === 0 ? (
                                <p className="text-center text-gray-400 text-xs italic py-8">No messages yet.</p>
                            ) : (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                    {messages.map((msg) => (
                                        <div key={msg._id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="text-sm font-black text-gray-900">{msg.name}</h4>
                                                <span className="text-[10px] text-gray-400 italic">
                                                    {new Date(msg.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-2 mb-3 italic">"{msg.message}"</p>
                                            <div className="flex items-center gap-3">
                                                <a href={`mailto:${msg.email}`} className="text-purple-600 hover:text-purple-700 transition-colors">
                                                    <Mail size={14} />
                                                </a>
                                                <a href={`tel:${msg.phone}`} className="text-purple-600 hover:text-purple-700 transition-colors">
                                                    <Phone size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                <Clock size={20} className="text-orange-600" /> Urgent Alerts
                            </h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                    <p className="text-[11px] font-bold text-orange-700 uppercase mb-1">Stock Alert</p>
                                    <p className="text-xs text-gray-600">Your rental 'Honda CBR' is overbooked for next weekend.</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                    <p className="text-[11px] font-bold text-blue-700 uppercase mb-1">New Message</p>
                                    <p className="text-xs text-gray-600">{messages.length > 0 ? `${messages.length} potential buyers are waiting for a response.` : 'No new messages.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
};

export default SellerDashboard;