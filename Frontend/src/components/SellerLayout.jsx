import React, { useState, useEffect } from 'react';
import SellerSidebar from './SellerSidebar';
import SellerHeader from './SellerHeader';
import SellerMobileNav from './SellerMobileNav';
import { X } from 'lucide-react';

const SellerLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

    // Close mobile drawer on resize if screen becomes large
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileDrawerOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleMobileDrawer = () => setIsMobileDrawerOpen(!isMobileDrawerOpen);

    return (
        <div className="min-h-screen bg-[#F9FAFB] flex scroll-smooth">
            {/* Desktop Sidebar */}
            <div className="fixed top-0 left-0 h-full z-[60] shadow-2xl hidden md:flex">
                <SellerSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            </div>

            {/* Mobile Sidebar (Drawer) */}
            <div
                className={`fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[70] transition-opacity duration-300 md:hidden ${isMobileDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={toggleMobileDrawer}
            />
            <div
                className={`fixed top-0 left-0 h-full w-[280px] bg-[#1F2937] z-[80] shadow-2xl transition-transform duration-300 md:hidden flex flex-col ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 flex items-center justify-between border-b border-gray-800">
                    <span className="text-xl font-black text-white">RIDE<span className="text-orange-500">HUB</span></span>
                    <button onClick={toggleMobileDrawer} className="p-2 text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {/* Reusing the sidebar inner logic would be cleaner, but for now I'll use a simplified version or just share the component */}
                    <SellerSidebar isOpen={true} />
                </div>
            </div>

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 min-w-0 ${isSidebarOpen ? 'md:ml-[260px]' : 'md:ml-[80px]'
                    }`}
            >
                <SellerHeader
                    onMenuToggle={window.innerWidth < 768 ? toggleMobileDrawer : toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                />

                <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <SellerMobileNav />
        </div>
    );
};

export default SellerLayout;
