import React, { useState, useEffect } from 'react';
import { Mail, Check, Bell, Loader2, Trash2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import Header from '../components/layout/Header';
import SellerLayout from '../components/layout/SellerLayout';
import AdminLayout from '../components/layout/AdminLayout';
import { useAuth } from '../context/AuthContext';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/notifications');
            setNotifications(res.data.data || []);
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            toast.error('Failed to update notification');
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch (err) {
            toast.error('Failed to update notifications');
        }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/api/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Notification removed');
        } catch (err) {
            toast.error('Failed to delete notification');
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const content = (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Your Notifications</h1>
                    <p className="text-slate-500 italic">Stay updated with rental requests, payments, and account alerts.</p>
                </div>
                {notifications.some(n => !n.isRead) && (
                    <button 
                        onClick={markAllRead}
                        className="bg-orange-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20"
                    >
                        Mark All as Read <Check size={14} />
                    </button>
                )}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-4">
                        <Loader2 className="animate-spin text-orange-600" size={40} />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Notifications...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="py-40 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                            <Mail className="text-slate-200" size={40} />
                        </div>
                        <p className="font-black uppercase text-slate-400 text-sm tracking-widest">No notifications found</p>
                        <p className="text-xs text-slate-300 font-bold mt-2">Check back later for new updates.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                            <div 
                                key={n._id}
                                className={`p-8 hover:bg-slate-50 transition-all flex gap-6 relative group ${!n.isRead ? 'bg-orange-50/10' : ''}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-xl shadow-sm ${
                                    !n.isRead ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {n.type === 'payment' ? '💰' : n.type === 'message' ? '💬' : '🔔'}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className={`text-lg font-black uppercase tracking-tight ${!n.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                                            {n.title}
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-slate-400 italic">
                                                {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <button 
                                                onClick={() => deleteNotification(n._id)}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-600 transition-all rounded-xl hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed mb-4 max-w-2xl">
                                        {n.message}
                                    </p>
                                    {!n.isRead && (
                                        <button 
                                            onClick={() => markAsRead(n._id)}
                                            className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:text-orange-700 flex items-center gap-1.5"
                                        >
                                            <Check size={12} /> Mark as seen
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    if (user?.isAdmin) {
        return <AdminLayout>{content}</AdminLayout>;
    }

    if (user?.role === 'seller') {
        return <SellerLayout>{content}</SellerLayout>;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main className="container mx-auto px-6 py-12">
                {content}
            </main>
        </div>
    );
};

export default Notifications;
