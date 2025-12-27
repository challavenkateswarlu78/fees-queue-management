import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user from localStorage on app start
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        
        console.log('🔍 App start - Token exists:', !!token);
        console.log('🔍 App start - User string:', userStr);
        
        if (token && userStr) {
            try {
                const userData = JSON.parse(userStr);
                console.log('🔍 Setting user from localStorage:', userData);
                setUser(userData);
            } catch (error) {
                console.error('🔍 Error parsing user:', error);
                localStorage.clear();
            }
        }
        
        setLoading(false);
    }, []);

    const login = async (identifier, password) => {
        try {
            console.log('🔍 Login attempt:', identifier);
            
            const response = await authAPI.login(identifier, password);
            console.log('🔍 Login response:', response);
            
            if (response.success && response.token && response.user) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                setUser(response.user);
                
                console.log('🔍 Login successful, user:', response.user);
                return { success: true, user: response.user };
            } else {
                return { success: false, message: response.message || 'Login failed' };
            }
        } catch (error) {
            console.error('🔍 Login error:', error);
            return { 
                success: false, 
                message: error.message || 'Login failed' 
            };
        }
    };

    const registerStudent = async (studentData) => {
        try {
            const response = await authAPI.registerStudent(studentData);
            return { success: true, data: response.data };
        } catch (error) {
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const value = {
        user,
        loading,
        login,
        registerStudent,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};