import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Box,
    PlusCircle,
    MessageSquare,
    User,
    Settings
} from 'lucide-react';

const MobileNavItem = ({ icon: Icon, label, path }) => {
    const location = useLocation();
    const isActive = location.pathname === path;

    return (
        <Link
            to={path}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300 relative ${isActive ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                }`}
        >
            <div className={`transition-all duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {label}
            </span>
            {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-orange-600 rounded-b-full shadow-[0_0_10px_rgba(234,88,12,0.5)]"></div>
            )}
        </Link>
    );
};

const SellerMobileNav = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center justify-between px-2 md:hidden z-50 rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            <MobileNavItem icon={Home} label="Home" path="/dashboard" />
            <MobileNavItem icon={Box} label="Listings" path="/seller/inventory" />

            <div className="flex-1 flex justify-center -mt-10">
                <Link
                    to="/seller/inventory"
                    className="w-16 h-16 bg-orange-600 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-orange-900/40 transform hover:scale-110 active:scale-95 transition-all border-4 border-white"
                >
                    <PlusCircle size={32} />
                </Link>
            </div>

            <MobileNavItem icon={MessageSquare} label="Chats" path="/seller/customers/messages" />
            <MobileNavItem icon={User} label="Profile" path="/seller/settings/profile" />
        </nav>
    );
};

export default SellerMobileNav;
