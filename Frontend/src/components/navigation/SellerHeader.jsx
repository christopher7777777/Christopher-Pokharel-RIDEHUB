import {
    Menu, Bell, Check, Mail
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const SellerHeader = ({ onMenuToggle }) => {
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await api.get('/api/notifications');
            setNotifications(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
            setNotifications([]);
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
            const interval = setInterval(fetchNotifications, 15000); // 15s polling
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-20 px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors md:hidden"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                    Seller Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-6">
                {/* Notifications */}
                {user && (
                    <div className="relative">
                        <button 
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="p-2 text-gray-500 hover:text-orange-600 transition-colors relative"
                        >
                            <Bell size={20} />
                            {notifications.some(n => !n.isRead) && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-600 rounded-full border-2 border-white"></span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isNotifOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-50 cursor-default" 
                                    onClick={() => setIsNotifOpen(false)}
                                ></div>
                                <div className="absolute right-0 top-full pt-2 z-[60] w-80 animate-fadeInScale">
                                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</h4>
                                            <button 
                                                onClick={markAllRead}
                                                className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline"
                                            >
                                                Mark all read
                                            </button>
                                        </div>
                                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="py-10 text-center text-gray-400">
                                                    <Mail size={32} className="mx-auto mb-2 opacity-10" />
                                                    <p className="text-[10px] font-bold uppercase tracking-widest">No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div 
                                                        key={n._id}
                                                        onClick={() => markAsRead(n._id)}
                                                        className={`px-5 py-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-orange-50/30' : ''}`}
                                                    >
                                                        {!n.isRead && (
                                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                                                        )}
                                                        <div className="flex justify-between items-start gap-2">
                                                            <h5 className={`text-xs font-black uppercase tracking-tight ${!n.isRead ? 'text-slate-800' : 'text-slate-500'}`}>
                                                                {n.title}
                                                            </h5>
                                                            <span className="text-[9px] text-gray-400 font-medium whitespace-nowrap">
                                                                {new Date(n.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-3 bg-slate-50 border-t border-gray-100 text-center">
                                            <Link 
                                                to="/notifications" 
                                                className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-800"
                                                onClick={() => setIsNotifOpen(false)}
                                            >
                                                View All Notifications
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
                
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-3 p-1.5 md:pr-4 rounded-full border border-gray-100 hover:shadow-md transition-all bg-white"
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                            {user?.kycStatus === 'verified' && user?.kycId?.userPhoto ? (
                                <img
                                    src={user.kycId.userPhoto}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name?.charAt(0).toUpperCase()
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block">
                            {user?.name}
                        </span>
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-fadeIn">
                            <div className="px-4 py-3">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default SellerHeader;
