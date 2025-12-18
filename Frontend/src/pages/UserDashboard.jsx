import React from 'react';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="card">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900">Landing Page</h1>
                            <button
                                onClick={logout}
                                className="btn btn-secondary"
                            >
                                Logout
                            </button>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Welcome, {user.name}!
                            </h3>
                            <p className="text-blue-700">Email: {user.email}</p>
                            <p className="text-blue-700">Role: {user.role}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;