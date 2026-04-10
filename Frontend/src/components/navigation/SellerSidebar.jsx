import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Calendar,
    Truck,
    TrendingUp,
    CreditCard,
    MessageSquare,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bike,
    ShoppingCart,
    User,
    UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SellerSidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const { logout } = useAuth();

    const menuItems = [
        { icon: LayoutDashboard, label: 'DASHBOARD', path: '/dashboard' },
        { icon: Package, label: 'PRODUCT', path: '/seller/inventory' },
        { icon: Calendar, label: 'BIKES', path: '/seller/bikes' },
        { icon: Truck, label: 'SHIPMENTS', path: '/seller/sales' },
        { icon: TrendingUp, label: 'SALES', path: '/seller/purchase-hub' },
        { icon: CreditCard, label: 'PAYMENT', path: '/seller/payments' },
        { icon: MessageSquare, label: 'MESSAGE', path: '/seller/messages' },
        { icon: User, label: 'KYC VERIFICATION', path: '/seller/kyc' },
    ];

    return (
        <aside
            className={`h-screen bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col ${isOpen ? 'w-[260px]' : 'w-[80px]'}`}
        >
            {/* Branding */}
            <div className="h-24 flex items-center justify-center border-b border-slate-800/50">
                <Link to="/dashboard" className="flex items-center justify-center">
                    <img
                        src="/image5.png"
                        alt="RIDEHUB Logo"
                        className={`transition-all duration-300 ${isOpen ? 'h-16 px-4' : 'h-10 px-2'}`}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={idx}
                            to={item.path}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-slate-800 text-white shadow-lg'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                }`}
                        >
                            <Icon size={22} className={isActive ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'} />
                            {isOpen && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-slate-800/50 space-y-4">
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
                        className="w-full h-12 flex items-center justify-center bg-slate-800/50 text-slate-500 rounded-xl hover:bg-slate-800 hover:text-slate-300 transition-all"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default SellerSidebar;
