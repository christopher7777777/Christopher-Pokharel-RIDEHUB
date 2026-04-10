import React, { useState } from 'react';
import AdminSidebar from '../navigation/AdminSidebar';
import AdminHeader from '../navigation/AdminHeader';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            <main
                className="flex-1 flex flex-col transition-all duration-300 min-h-screen overflow-hidden"
            >
                <AdminHeader
                    toggleSidebar={toggleSidebar}
                />

                <div className="flex-1 overflow-y-auto p-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
