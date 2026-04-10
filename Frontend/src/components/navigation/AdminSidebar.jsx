import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    UserCheck,
    Settings,
    Users,
    CreditCard,
    Bike,
    LogOut,
    ChevronLeft,
    ChevronRight,
    FileText,
    Star,
    Wallet
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { logout } = useAuth();

    // Ensure paths exactly match App.jsx routes
    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
        { icon: UserCheck, label: 'KYC Verify', path: '/admin/kyc' },
        { icon: Settings, label: 'Valuation Rules', path: '/admin/valuation' },
        { icon: Users, label: 'User Management', path: '/admin/users' },
        { icon: CreditCard, label: 'Payments', path: '/admin/payments' },
        { icon: Wallet, label: 'Escrow Payouts', path: '/admin/escrow' },
        { icon: Bike, label: 'Bike List', path: '/admin/bikes' },
        { icon: FileText, label: 'EMI Leads', path: '/admin/emi' },
        { icon: Star, label: 'Service Reviews', path: '/admin/reviews' },
    ];

    return (
        <aside
            className={`h-screen bg-[#0f172a] border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col sticky top-0 ${isOpen ? 'w-[260px]' : 'w-[80px]'}`}
        >
            {/* Branding */}
            <div className="h-24 flex items-center justify-center border-b border-slate-800/50 shrink-0">
                <Link to="/admin/dashboard" className="flex items-center justify-center">
                    <img
                        src="/image5.png"
                        alt="RIDEHUB Logo"
                        className={`transition-all duration-300 ${isOpen ? 'h-16 px-4' : 'h-10 px-2'}`}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                {menuItems.map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-slate-800/50 text-sky-400 shadow-sm'
                                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                                }`}
                        >
                            <Icon size={22} className={isActive ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'} />
                            {isOpen && (
                                <span className="text-sm font-bold tracking-tight">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-800/50 space-y-4 shrink-0">
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-400 hover:bg-red-400/5 hover:text-red-300 transition-all font-bold ${!isOpen && 'justify-center'}`}
                >
                    <LogOut size={22} />
                    {isOpen && <span className="text-sm font-bold tracking-tight">LOGOUT</span>}
                </button>

                {toggleSidebar && (
                    <button
                        onClick={toggleSidebar}
                        className="w-full h-12 flex items-center justify-center bg-slate-800/30 text-slate-500 rounded-xl hover:bg-slate-800 hover:text-slate-300 transition-all"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default AdminSidebar;
