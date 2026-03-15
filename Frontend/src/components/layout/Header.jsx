import { AlertCircle, ArrowRight, User, Calculator, Bell, Check, Mail } from 'lucide-react';
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
            const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || (user && user.kycStatus !== 'verified') ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
                }`}
        >
            {/* KYC Notification Banner */}
            {!authLoading && user && user.role !== 'admin' && user.kycStatus !== 'verified' && (
                <div className="bg-orange-600 text-white py-2">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            <p className="text-[11px] md:text-sm font-bold tracking-tight">
                                {user.kycStatus === 'pending'
                                    ? "Verification in Progress"
                                    : "Complete Identity Verification"}
                            </p>
                            <span className="hidden md:inline text-[11px] text-orange-100 font-medium">
                                {user.kycStatus === 'pending'
                                    ? "Our team is reviewing your documents. Usually takes 24-48 hours."
                                    : "Unlock full selling features by verifying your identity."}
                            </span>
                        </div>
                        {user.kycStatus !== 'pending' && (
                            <Link
                                to="/kyc-verification"
                                className="bg-white text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-orange-50 transition-all flex items-center gap-1"
                            >
                                Verify Now <ArrowRight size={10} />
                            </Link>
                        )}
                    </div>
                </div>
            )}
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-5'}`}>
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center group">
                        <img
                            src="/image5.png"
                            alt="RIDEHUB Logo"
                            className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-14'} w-auto object-contain`}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-sm font-semibold transition-colors duration-200 hover:text-orange-600 ${isActive(link.path) ? 'text-orange-600' : 'text-gray-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* User Profile, Notifications & Logout */}
                    <div className="hidden md:flex items-center gap-6">
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
                                                            {!n.isRead && (
                                                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <span className="text-[9px] font-black text-orange-600 uppercase tracking-tighter flex items-center gap-1">
                                                                        <Check size={10} /> Mark as read
                                                                    </span>
                                                                </div>
                                                            )}
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
                                )}
                            </div>
                        )}

                        <div className="relative group/profile">
                            <Link to="/profile" className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-200 group-hover:border-orange-500 transition-all overflow-hidden">
                                    {user?.kycStatus === 'verified' && user?.kycId?.userPhoto ? (
                                        <img
                                            src={user.kycId.userPhoto}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-orange-600 font-bold text-xs">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">
                                    {user?.name?.split(' ')[0] || 'Account'}
                                </span>
                            </Link>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-52 overflow-hidden animate-fadeInScale">
                                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Account</p>
                                    </div>
                                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                        View Profile
                                    </Link>
                                    {user?.role !== 'seller' && (
                                        <>
                                            <Link to="/kyc-verification" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                                Verify Identity
                                            </Link>
                                            <Link to="/my-selling" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                                Listing Status
                                            </Link>
                                            <Link to="/my-emi" className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                                EMI Applications
                                            </Link>
                                        </>
                                    )}
                                    <div className="mt-2 pt-2 border-t border-gray-50">
                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-orange-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 animate-fadeIn">
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-3 rounded-lg text-base font-medium ${isActive(link.path) ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                <Link
                                    to="/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2 text-gray-600"
                                >
                                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                                        {user?.kycStatus === 'verified' && user?.kycId?.userPhoto ? (
                                            <img
                                                src={user.kycId.userPhoto}
                                                alt={user.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-orange-600 font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </header >
    );
};

export default Header;
