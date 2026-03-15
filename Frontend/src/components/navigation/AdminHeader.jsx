import React, { useState, useEffect } from 'react';
import { Bell, Check, Mail, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Link } from 'react-router-dom';

const AdminHeader = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/api/notifications');
            setNotifications(res.data.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read:', err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors"
                >
                    <Menu size={20} />
                </button>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight hidden md:block">
                    Administrator Control Panel
                </h2>
            </div>

            <div className="flex items-center gap-6">
                {/* Notifications */}
                <div className="relative">
                    <button 
                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                        className="p-2.5 text-slate-400 hover:text-orange-600 transition-all relative bg-slate-50 rounded-xl"
                    >
                        <Bell size={20} />
                        {notifications.some(n => !n.isRead) && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-orange-600 rounded-full border-2 border-white"></span>
                        )}
                    </button>

                    {isNotifOpen && (
                        <div className="absolute right-0 top-full pt-3 z-[60] w-96 animate-fadeInScale">
                            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Admin Notifications</h4>
                                    <button 
                                        onClick={markAllRead}
                                        className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline"
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="py-12 text-center text-slate-300">
                                            <Mail size={40} className="mx-auto mb-3 opacity-20" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Everything is up to date</p>
                                        </div>
                                    ) : (
                                        notifications.map((n) => (
                                            <div 
                                                key={n._id}
                                                onClick={() => markAsRead(n._id)}
                                                className={`px-6 py-5 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-orange-50/20' : ''}`}
                                            >
                                                {!n.isRead && (
                                                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                                                )}
                                                <div className="flex justify-between items-start gap-2">
                                                    <h5 className={`text-xs font-black uppercase tracking-tight ${!n.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {n.title}
                                                    </h5>
                                                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium mt-1.5 leading-relaxed">
                                                    {n.message}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                                    <Link 
                                        to="/admin/notifications" 
                                        className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800"
                                        onClick={() => setIsNotifOpen(false)}
                                    >
                                        View System Logs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="relative">
                    <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                    >
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                            AD
                        </div>
                    </button>

                    {isProfileOpen && (
                        <div className="absolute right-0 top-full pt-3 z-[60] w-56 animate-fadeInScale">
                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 overflow-hidden">
                                <div className="px-5 py-3 border-b border-slate-50 mb-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admin User</p>
                                    <p className="text-xs font-bold text-slate-800 truncate">{user?.email}</p>
                                </div>
                                <button 
                                    onClick={logout}
                                    className="w-full text-left px-5 py-3 text-xs font-black text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3 uppercase tracking-widest"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
