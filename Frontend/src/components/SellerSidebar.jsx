import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Bike,
    Calendar,
    DollarSign,
    Users,
    BarChart3,
    Settings,
    ChevronLeft,
    ChevronRight,
    PlusCircle,
    ClipboardList,
    Receipt,
    MessageSquare,
    Star,
    Bell,
    User,
    Store,
    PieChart,
    ChevronDown
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, path, badge, isOpen, subItems }) => {
    const location = useLocation();
    const isActive = location.pathname === path || (subItems && subItems.some(sub => location.pathname === sub.path));
    const [isSubOpen, setIsSubOpen] = useState(false);

    useEffect(() => {
        if (isActive && subItems) setIsSubOpen(true);
    }, [isActive, subItems]);

    return (
        <div className="mb-1">
            <Link
                to={path}
                onClick={(e) => {
                    if (subItems && isOpen) {
                        e.preventDefault();
                        setIsSubOpen(!isSubOpen);
                    }
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                    ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={20} className={isActive ? 'text-white' : 'group-hover:text-orange-500'} />
                    {isOpen && <span className="text-sm font-medium whitespace-nowrap">{label}</span>}
                </div>
                {isOpen && (
                    <div className="flex items-center gap-2">
                        {badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-orange-500/20 text-orange-500'
                                }`}>
                                {badge}
                            </span>
                        )}
                        {subItems && (
                            <ChevronDown size={14} className={`transition-transform duration-200 ${isSubOpen ? 'rotate-180' : ''}`} />
                        )}
                    </div>
                )}
            </Link>

            {isOpen && subItems && isSubOpen && (
                <div className="mt-1 ml-9 space-y-1 animate-fadeIn">
                    {subItems.map((sub, idx) => (
                        <Link
                            key={idx}
                            to={sub.path}
                            className={`block px-3 py-2 rounded-lg text-xs font-medium transition-colors ${location.pathname === sub.path
                                ? 'text-orange-500'
                                : 'text-gray-500 hover:text-gray-300'
                                }`}
                        >
                            {sub.label}
                        </Link>
                    ))}
                </div>
            )}

            {!isOpen && badge && (
                <div className="absolute left-10 mt-[-35px]">
                    <span className="w-2 h-2 bg-orange-500 rounded-full border-2 border-gray-900 shadow-sm"></span>
                </div>
            )}
        </div>
    );
};

const SellerSidebar = ({ isOpen, toggleSidebar }) => {
    const menuItems = [
        { icon: LayoutDashboard, label: 'DASHBOARD', path: '/dashboard' },
        {
            icon: Bike,
            label: 'INVENTORY',
            path: '/seller/inventory'
        },
        {
            icon: Calendar,
            label: 'RENTALS',
            path: '/seller/rentals'
        },
        {
            icon: DollarSign,
            label: 'SALES',
            path: '/seller/sales',
            subItems: [
                { label: 'Orders', path: '/seller/sales/orders' },
                { label: 'Exchanges', path: '/seller/sales/exchanges' }
            ]
        },
        {
            icon: Receipt,
            label: 'FINANCE',
            path: '/seller/finance',
            subItems: [
                { label: 'Earnings', path: '/seller/finance/earnings' },
                { label: 'Payments', path: '/seller/finance/methods' }
            ]
        },
        {
            icon: MessageSquare,
            label: 'CUSTOMERS',
            path: '/seller/customers',
            badge: '3',
            subItems: [
                { label: 'Messages', path: '/seller/customers/messages' },
                { label: 'Reviews', path: '/seller/customers/reviews' }
            ]
        },
        { icon: BarChart3, label: 'ANALYTICS', path: '/seller/analytics' },
        {
            icon: Settings,
            label: 'SETTINGS',
            path: '/seller/settings',
            subItems: [
                { label: 'Profile', path: '/seller/settings/profile' },
                { label: 'Shop Settings', path: '/seller/settings/shop' },
                { label: 'Notifications', path: '/seller/settings/notifications' }
            ]
        },
    ];

    return (
        <aside
            className={`h-full bg-[#1F2937] text-gray-400 transition-all duration-300 flex flex-col ${isOpen ? 'w-[260px]' : 'w-[80px]'
                }`}
        >
            {/* Branding */}
            <div className="h-20 flex items-center px-6 border-b border-gray-800">
                <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-900/40">
                        <Bike size={24} className="text-white" />
                    </div>
                    {isOpen && (
                        <span className="text-xl font-black text-white tracking-tighter animate-fadeIn">
                            RIDE<span className="text-orange-500">HUB</span>
                        </span>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 custom-scrollbar">
                {menuItems.map((item, idx) => (
                    <SidebarItem key={idx} {...item} isOpen={isOpen} />
                ))}
            </div>

            {/* Collapse Toggle */}
            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={toggleSidebar}
                    className="w-full h-10 flex items-center justify-center bg-gray-800/50 rounded-xl hover:bg-gray-800 hover:text-white transition-all group"
                >
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>
        </aside>
    );
};

export default SellerSidebar;
