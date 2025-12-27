import React, { useState } from 'react';
import {
    Menu,
    Search,
    Bell,
    Plus,
    ChevronDown,
    LayoutGrid,
    DollarSign,
    MessageCircle,
    ShoppingBag,
    HelpCircle,
    User,
    LogOut,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const SellerHeader = ({ onMenuToggle, isSidebarOpen }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isStoreActive, setIsStoreActive] = useState(true);

    // Dynamic breadcrumbs based on path
    const pathnames = location.pathname.split('/').filter((x) => x);

    return (
        <header className="fixed top-0 right-0 h-20 bg-white/80 backdrop-blur-md z-40 border-b border-gray-100 px-6 flex items-center justify-between transition-all duration-300 left-0 md:left-[80px]" style={{ left: isSidebarOpen ? '260px' : '' }}>
            {/* Left Section: Breadcrumbs & Toggle */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                    <Menu size={20} />
                </button>

                <nav className="hidden lg:flex items-center gap-2 text-sm">
                    <Link to="/dashboard" className="text-gray-400 hover:text-orange-600 transition-colors font-medium uppercase tracking-wider text-[10px]">Portal</Link>
                    {pathnames.map((name, index) => (
                        <React.Fragment key={index}>
                            <span className="text-gray-300">/</span>
                            <span className={`font-semibold capitalize text-xs ${index === pathnames.length - 1 ? 'text-gray-900' : 'text-gray-400'}`}>
                                {name.replace(/-/g, ' ')}
                            </span>
                        </React.Fragment>
                    ))}
                </nav>
            </div>

            {/* Center Section: Search & Quick Stats */}
            <div className="hidden xl:flex flex-1 max-w-2xl mx-12 items-center gap-6">
                <div className="relative flex-1 group">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search inventory, orders, customers..."
                        className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-600 outline-none transition-all placeholder:text-gray-400"
                    />
                    <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-400">⌘K</kbd>
                </div>
            </div>

            {/* Right Section: Actions & Profile */}
            <div className="flex items-center gap-3">
                {/* Store Toggle */}
                <button
                    onClick={() => setIsStoreActive(!isStoreActive)}
                    className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isStoreActive
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                >
                    {isStoreActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    <span className="text-[10px] font-black uppercase tracking-wider">{isStoreActive ? 'Online' : 'Offline'}</span>
                </button>

                <div className="h-8 w-px bg-gray-100 hidden sm:block mx-1"></div>

                <button className="relative p-2 text-gray-500 hover:bg-gray-50 hover:text-orange-600 rounded-xl transition-all">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                </button>

                <button className="hidden sm:flex p-2 text-gray-500 hover:bg-gray-50 hover:text-orange-600 rounded-xl transition-all">
                    <Plus size={20} />
                </button>

                {/* User Menu */}
                <div className="relative ml-2">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-3 p-1.5 pl-3 bg-gray-50 hover:bg-orange-50 rounded-2xl border border-transparent hover:border-orange-100 transition-all group"
                    >
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-bold text-gray-900 group-hover:text-orange-600 leading-none mb-1">{user?.name}</p>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/10">
                            <User size={18} className="text-white" />
                        </div>
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-[24px] shadow-2xl overflow-hidden border border-gray-100 animate-fadeInScale transform origin-top-right">
                            <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                    {user?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                    <p className="text-[11px] text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                            <div className="p-2">
                                <Link to="/seller/settings/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-all">
                                    <User size={16} /> My Profile
                                </Link>
                                <div className="h-px bg-gray-50 my-2 mx-2"></div>
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={16} /> Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default SellerHeader;
