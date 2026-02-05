import React, { useState } from 'react';
import AdminSidebar from '../navigation/AdminSidebar';

const AdminLayout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-slate-50">
            <AdminSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <main className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
