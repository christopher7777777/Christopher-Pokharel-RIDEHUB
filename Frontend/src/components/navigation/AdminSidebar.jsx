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
    ChevronRight
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
        { icon: Bike, label: 'Bike List', path: '/admin/bikes' },
    ];

    return (
        <aside
            className={`h-screen bg-slate-900 border-r border-slate-800 text-white transition-all duration-300 flex flex-col sticky top-0 ${isOpen ? 'w-[260px]' : 'w-[80px]'}`}
        >
            {/* Branding */}
            <div className="h-20 flex items-center justify-center border-b border-slate-800 shrink-0">
                <Link to="/admin/dashboard" className="flex items-center justify-center">
                    <img
                        src="/image5.png"
                        alt="RIDEHUB Logo"
                        className={`transition-all duration-300 ${isOpen ? 'h-14 px-4' : 'h-10 px-2'}`}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item, idx) => {
                    // Precise match or sub-path match for active state
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-orange-600 text-white font-bold'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                                }`}
                        >
                            <Icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                            {isOpen && (
                                <span className="text-sm tracking-wide">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-800 space-y-2 shrink-0">
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-all font-bold ${!isOpen && 'justify-center'}`}
                >
                    <LogOut size={20} />
                    {isOpen && <span className="text-sm tracking-wide">Logout</span>}
                </button>

                {toggleSidebar && (
                    <button
                        onClick={toggleSidebar}
                        className="w-full h-10 flex items-center justify-center bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-all"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default AdminSidebar;
