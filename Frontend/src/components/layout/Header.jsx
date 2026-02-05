import { AlertCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
    const { logout, user, loadUser, loading: authLoading } = useAuth();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            loadUser(); // Periodically refresh user data 
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
                            <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                {user.kycStatus === 'pending'
                                    ? "KYC Under Review"
                                    : "Identity Verification Required"}
                            </p>
                            <span className="hidden md:inline text-[10px] text-orange-100 opacity-80">
                                {user.kycStatus === 'pending'
                                    ? "Your documents are being reviewed by our team. Please wait 24-48 hours."
                                    : "Please complete your KYC to unlock all features including bike listings and management."}
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
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-orange-200 shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                        <span className={`text-2xl font-black tracking-tighter ${isScrolled ? 'text-gray-900' : 'text-gray-800'}`}>
                            RIDE<span className="text-orange-600">HUB</span>
                        </span>
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

                    {/* User Profile & Logout */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="relative group/profile">
                            <Link to="/profile" className="flex items-center gap-2 group">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-200 group-hover:border-orange-500 transition-all">
                                    <span className="text-orange-600 font-bold text-xs">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors">
                                    Profile
                                </span>
                            </Link>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover/profile:opacity-100 group-hover/profile:visible transition-all duration-300">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 w-48 overflow-hidden">
                                    <Link to="/profile" className="block px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 uppercase tracking-wider transition-colors">
                                        My Profile
                                    </Link>
                                    {user?.role !== 'seller' && (
                                        <>
                                            <Link to="/kyc-verification" className="block px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 uppercase tracking-wider transition-colors border-b border-gray-50">
                                                Identity Verification
                                            </Link>
                                            <Link to="/my-selling" className="block px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 uppercase tracking-wider transition-colors">
                                                My Selling Status
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={logout}
                                        className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 uppercase tracking-wider transition-colors"
                                    >
                                        Logout
                                    </button>
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
            {isMobileMenuOpen && (
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
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                                    <span className="text-orange-600 font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
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
            )}
        </header>
    );
};

export default Header;
