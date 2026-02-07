import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { Users, Bike, CheckCircle, CreditCard, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: Users, color: 'bg-blue-500', key: 'totalUsers' },
        { label: 'Total Bikes', value: '0', icon: Bike, color: 'bg-orange-500', key: 'totalBikes' },
        { label: 'Pending KYC', value: '0', icon: CheckCircle, color: 'bg-purple-500', key: 'pendingKYC' },
        { label: 'Revenue', value: 'Rs 0', icon: CreditCard, color: 'bg-green-500', key: 'revenue' },
    ]);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        } catch (error) {
            toast.error('Failed to fetch dashboard stats');
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading stats...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-all">
                                <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-100`}>
                                    <stat.icon size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                    <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Future sections */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[300px] flex flex-col">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">System Overview</h2>
                    <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                        <div className="text-center">
                            <p className="font-medium text-slate-500">Analytics coming soon</p>
                            <p className="text-xs mt-1">Detailed activity logs and growth charts are in development.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
