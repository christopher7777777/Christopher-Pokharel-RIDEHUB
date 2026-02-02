import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, []);

    const loadUser = async () => {
        try {
            const res = await api.get('/api/auth/me');
            setUser(res.data.data);
        } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        try {
            const res = await api.post('/api/auth/register', formData);
            return res.data;
        } catch (error) {
            throw error.response?.data || { message: 'Registration failed' };
        }
    };

    const login = async (formData) => {
        try {
            const res = await api.post('/api/auth/login', formData);
            if (res.data.data.token) {
                localStorage.setItem('token', res.data.data.token);
                setUser(res.data.data);
            }
            return res.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = {
        user,
        loading,
        register,
        login,
        logout,
        loadUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};