import React, { useState } from 'react';
import {
    Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SellerHeader = ({ onMenuToggle }) => {
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-100 h-20 px-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="p-2 hover:bg-gray-50 rounded-lg text-gray-500 transition-colors md:hidden"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold text-gray-800 hidden sm:block">
                    Seller Dashboard
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-3 p-1.5 md:pr-4 rounded-full border border-gray-100 hover:shadow-md transition-all bg-white"
                    >
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-gray-700 hidden md:block">
                            {user?.name}
                        </span>
                    </button>

                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 animate-fadeIn">
                            <div className="px-4 py-3">
                                <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default SellerHeader;
