import {
    AlertCircle,
    ArrowRight,
    User,
    Calculator,
    Bell,
    Check,
    Mail,
    ChevronDown,
    LogOut,
    Settings,
    Shield,
    Heart,
    Menu,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Header = () => {
    const { logout, user, loadUser, loading: authLoading } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

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

    useEffect(() => {
        if (user) {
            loadUser();
        }
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/dashboard' },
        { name: 'Browse', path: '/browse' },
        ...(user?.role === 'seller'
            ? []
            : [{ name: 'Sell Bike', path: '/sell' }]
        ),
        { name: 'EMI', path: '/emi-calculator' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || (user && user.kycStatus !== 'verified')
                    ? 'bg-orange-500 shadow-[0_4px_30px_rgba(249,115,22,0.1)] py-3'
                    : 'bg-orange-400 py-4 border-b border-orange-300/30'
                }`}
        >
            {/* KYC Notification Banner */}
            {!authLoading && user && user.role !== 'admin' && user.kycStatus !== 'verified' && (
                <div className="absolute top-0 left-0 right-0 bg-orange-700 text-white overflow-hidden py-1.5 px-4 h-8 flex items-center">
                    <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Shield size={12} />
                            <p className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap text-white/90">
                                {user.kycStatus === 'pending' ? "Verification in Progress" : "Identity Verification Required"}
                            </p>
                        </div>
                        {user.kycStatus !== 'pending' && (
                            <Link to="/kyc-verification" className="text-[9px] font-bold uppercase tracking-widest bg-white text-orange-700 px-3 py-1 rounded-full hover:bg-orange-50 transition-colors">
                                Verify Now
                            </Link>
                        )}
                    </div>
                </div>
            )}

            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300 ${user && user.kycStatus !== 'verified' ? 'mt-8' : ''}`}>
                {/* Logo - Flex 1 for centering nav */}
                <div className="flex items-center justify-start flex-1">
                    <Link to="/dashboard" className="flex items-center group">
                        <img
                            src="/image5.png"
                            alt="RIDEHUB Logo"
                            className={`transition-all duration-500 ${isScrolled ? 'h-10' : 'h-14'} w-auto object-contain`}
                        />
                    </Link>
                </div>

                {/* Navigation - Locked Middle */}
                <nav className="hidden lg:flex items-center justify-center gap-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`px-5 py-2 text-base font-bold tracking-tight transition-all duration-300 relative group overflow-hidden ${isActive(link.path)
                                    ? 'text-white'
                                    : 'text-orange-50 hover:text-white'
                                }`}
                        >
                            <span>{link.name}</span>
                            <span className={`absolute bottom-0 left-0 w-full h-1 bg-white transform transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${isActive(link.path) ? 'scale-x-100' : ''}`}></span>
                        </Link>
                    ))}
                </nav>

                {/* Right Area - Flex 1 for centering nav */}
                <div className="flex items-center justify-end flex-1 gap-6">
                    {!authLoading && (
                        user ? (
                            <div className="flex items-center gap-5">
                                {/* Notification Bell */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsNotifOpen(!isNotifOpen)}
                                        className="p-2 text-white hover:text-orange-100 transition-colors relative"
                                    >
                                        <Bell size={20} />
                                        {notifications.some(n => !n.isRead) && (
                                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </button>

                                    {isNotifOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-4 w-80 z-50 animate-fadeInScale group">
                                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                                                    <div className="px-5 py-4 border-b border-gray-50 flex justify-between items-center bg-slate-50/50">
                                                        <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Notifications</h4>
                                                        <button onClick={markAllRead} className="text-[10px] font-bold text-orange-600 uppercase hover:underline">Mark all read</button>
                                                    </div>
                                                    <div className="max-h-[350px] overflow-y-auto">
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
                                                                    className={`px-5 py-4 border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer ${!n.isRead ? 'bg-orange-50/20' : ''}`}
                                                                >
                                                                    <h5 className={`text-xs font-bold uppercase tracking-tight ${!n.isRead ? 'text-slate-800' : 'text-slate-500'}`}>{n.title}</h5>
                                                                    <p className="text-[11px] text-gray-500 font-medium mt-1 leading-relaxed">{n.message}</p>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                    <Link to="/notifications" className="block text-center p-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-slate-800 border-t" onClick={() => setIsNotifOpen(false)}>
                                                        View All
                                                    </Link>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-3 group px-2 py-1.5 rounded-full hover:bg-white/10 transition-all"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center border border-white/50 overflow-hidden shadow-md">
                                            {user.kycStatus === 'verified' && user.kycId?.userPhoto ? (
                                                <img src={user.kycId.userPhoto} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-orange-600 font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-bold text-white group-hover:text-orange-50 transition-colors leading-none">
                                                {user.name.split(' ')[0]}
                                            </span>
                                            <span className="text-[10px] font-bold text-white/70 uppercase tracking-tighter mt-1">Account</span>
                                        </div>
                                        <ChevronDown size={14} className={`text-white transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                            <div className="absolute right-0 top-full mt-4 w-52 z-50 animate-fadeInScale">
                                                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 py-2">
                                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Navigation</p>
                                                    </div>
                                                    {[
                                                        { label: 'Profile Settings', icon: User, path: '/profile' },
                                                        { label: 'My EMI Plans', icon: Calculator, path: '/my-emi' }
                                                    ].map((item) => (
                                                        <Link
                                                            key={item.label}
                                                            to={item.path}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                                                            onClick={() => setIsProfileOpen(false)}
                                                        >
                                                            <item.icon size={14} /> {item.label}
                                                        </Link>
                                                    ))}
                                                    <div className="h-px bg-slate-50 my-2"></div>
                                                    <button
                                                        onClick={logout}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                    >
                                                        <LogOut size={14} /> Logout
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors">Login</Link>
                                <Link to="/register" className="px-6 py-2.5 bg-orange-600 text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-orange-700 hover:shadow-lg transition-all active:scale-95 shadow-md">Join Now</Link>
                            </div>
                        )
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden p-2 text-slate-600 hover:text-orange-600 transition-colors ml-2"
                    >
                        {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-100 animate-fadeIn overflow-hidden">
                    <div className="px-6 py-8 space-y-6">
                        <div className="space-y-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block text-xl font-bold ${isActive(link.path) ? 'text-orange-500' : 'text-slate-800'}`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                        <div className="h-px bg-slate-100"></div>
                        {user ? (
                            <button onClick={logout} className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold uppercase text-xs tracking-widest">Logout</button>
                        ) : (
                            <Link to="/register" className="block w-full py-4 bg-orange-600 text-white rounded-xl text-center font-bold uppercase text-xs tracking-widest shadow-lg">Join RideHub</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
