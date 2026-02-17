import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Calendar,
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
        { icon: Package, label: 'INVENTORY', path: '/seller/inventory' },
        { icon: Calendar, label: 'BIKES', path: '/seller/bikes' },
        { icon: TrendingUp, label: 'SALES', path: '/seller/purchase-hub' },
        { icon: CreditCard, label: 'PAYMENT', path: '/seller/payments' },
        { icon: MessageSquare, label: 'MESSAGE MANAGEMENT', path: '/seller/messages' },
        { icon: User, label: 'KYC VERIFICATION', path: '/seller/kyc' },
    ];

    return (
        <aside
            className={`h-screen bg-white border-r border-gray-200 text-gray-800 transition-all duration-300 flex flex-col ${isOpen ? 'w-[260px]' : 'w-[80px]'}`}
        >
            {/* Branding */}
            <div className="h-20 flex items-center justify-center border-b border-gray-100">
                <Link to="/dashboard" className="flex items-center justify-center">
                    <img
                        src="/image5.png"
                        alt="RIDEHUB Logo"
                        className={`transition-all duration-300 ${isOpen ? 'h-14 px-4' : 'h-10 px-2'}`}
                    />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item, idx) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={idx}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                ? 'bg-orange-50 text-orange-600 font-bold'
                                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium'
                                }`}
                        >
                            <Icon size={20} />
                            {isOpen && <span className="uppercase text-xs tracking-wide">{item.label}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 space-y-2">
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-all font-bold ${!isOpen && 'justify-center'}`}
                >
                    <LogOut size={20} />
                    {isOpen && <span className="uppercase text-xs tracking-wide">Logout</span>}
                </button>

                {toggleSidebar && (
                    <button
                        onClick={toggleSidebar}
                        className="w-full h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-all"
                    >
                        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default SellerSidebar;
