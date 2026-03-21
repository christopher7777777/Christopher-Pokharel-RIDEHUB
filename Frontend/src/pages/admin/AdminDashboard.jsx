import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, Bike, CheckCircle, CreditCard, Loader2, TrendingUp, ArrowUpRight, Activity } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: Users, color: 'bg-blue-600', key: 'totalUsers' },
        { label: 'Total Bikes', value: '0', icon: Bike, color: 'bg-orange-600', key: 'totalBikes' },
        { label: 'Pending KYC', value: '0', icon: CheckCircle, color: 'bg-purple-600', key: 'pendingKYC' },
        { label: 'Revenue', value: 'Rs 0', icon: CreditCard, color: 'bg-emerald-600', key: 'revenue' },
    ]);
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [targetedRevenue, setTargetedRevenue] = useState(0);
    const [activeInquiries, setActiveInquiries] = useState(0);

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " mins ago";
        return Math.floor(seconds) + " seconds ago";
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/stats');
            const data = res.data.data;

            setStats(prevStats => prevStats.map(stat => ({
                ...stat,
                value: stat.key === 'revenue'
                    ? `Rs ${data[stat.key].toLocaleString()}`
                    : data[stat.key].toString()
            })));

            if (data.chartData) setChartData(data.chartData);
            if (data.recentActivities) setRecentActivities(data.recentActivities);
            if (data.targetRevenue) setTargetedRevenue(data.targetRevenue);
            if (data.activeInquiries) setActiveInquiries(data.activeInquiries);
            
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch dashboard stats');
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-10 py-6 animate-fadeIn">
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-500 font-medium italic">Monitor system performance and growth metrics in real-time.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <TrendingUp size={20} />
                        </div>
                        <div className="pr-4">
                            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Market Trend</p>
                            <p className="text-sm font-black text-emerald-700">+12.5% Growth</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <Loader2 className="animate-spin text-orange-600" size={48} />
                            <div className="absolute inset-0 bg-orange-600/10 rounded-full blur-xl animate-pulse" />
                        </div>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Syncing Analytics Data...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between group hover:-translate-y-2 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`${stat.color} p-4 rounded-2xl text-white shadow-xl shadow-${stat.color.split('-')[1]}-200 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={28} />
                                    </div>
                                    <div className="text-emerald-500 bg-emerald-100/50 p-1.5 rounded-lg">
                                        <ArrowUpRight size={14} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <p className="text-3xl font-black text-slate-800 tracking-tighter">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Performance Chart Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 bg-white p-10 rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-slate-100 flex flex-col min-h-[500px]">
                        <div className="flex items-start justify-between mb-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-xs font-black text-orange-600 uppercase tracking-widest">
                                    <Activity size={14} />
                                    SYSTEM OVERVIEW
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Growth Performance</h2>
                            </div>
                            <select className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-black text-slate-600 outline-none focus:border-orange-500 transition-all cursor-pointer">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>This Year</option>
                            </select>
                        </div>
                        
                        <div className="flex-1 w-full h-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '20px', 
                                            border: 'none', 
                                            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                            padding: '15px'
                                        }}
                                        itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                                        labelStyle={{ color: '#64748b', marginBottom: '5px', fontWeight: 900, fontSize: '10px', textTransform: 'uppercase' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#f97316" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-50 flex flex-wrap gap-8 items-center justify-between">
                            <div className="flex gap-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-600 shadow-md shadow-orange-600/30" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Target Revenue</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-800 leading-none">Rs {targetedRevenue.toLocaleString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-slate-200 shadow-sm" />
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Active Inquiries</span>
                                    </div>
                                    <p className="text-lg font-black text-slate-800 leading-none">{activeInquiries}</p>
                                </div>
                            </div>
                            <div className="bg-orange-50 text-orange-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:bg-orange-100 transition-colors">
                                View Full Analytics
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 border-b-8 border-slate-800 text-white space-y-8 h-full">
                            <h3 className="text-xl font-black tracking-tight uppercase">Recent Activity</h3>
                            <div className="space-y-8">
                                {recentActivities.length === 0 ? (
                                    <p className="text-slate-500 text-xs italic font-bold">No recent activities found.</p>
                                ) : (
                                    recentActivities.map((activity, i) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className={`w-1.5 h-12 rounded-full transition-colors shrink-0 ${
                                                activity.type === 'kyc' ? 'bg-purple-600' : 
                                                activity.type === 'payment' ? 'bg-emerald-600' : 'bg-orange-600'
                                            }`} />
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-200 leading-tight">{activity.text}</p>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{formatTimeAgo(activity.time)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="pt-4">
                                <button 
                                    onClick={fetchStats}
                                    className="w-full py-4 bg-slate-800 hover:bg-slate-700 transition-colors rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-700"
                                >
                                    Refresh Activity
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
