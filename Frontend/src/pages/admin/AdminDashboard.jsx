import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Users, Bike, CheckCircle, CreditCard } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Users', value: '0', icon: Users, color: 'bg-blue-500' },
        { label: 'Total Bikes', value: '0', icon: Bike, color: 'bg-orange-500' },
        { label: 'Pending KYC', value: '0', icon: CheckCircle, color: 'bg-purple-500' },
        { label: 'Revenue', value: 'Rs. 0', icon: CreditCard, color: 'bg-green-500' },
    ]);
    const [loading, setLoading] = useState(false);
    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Admin Dashboard</h1>
                    <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                            <div className={`${stat.color} p-3 rounded-xl text-white`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional sections like Recent Activity or Charts can go here */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px]">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">System Overview</h2>
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <p>Dashboard charts and detailed activity logs will appear here.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
