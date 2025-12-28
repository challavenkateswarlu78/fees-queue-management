// AuthContext.jsx - Corrected version
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

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
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check for existing session on mount
        const checkAuthStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const userStr = localStorage.getItem('user');
                
                if (token && userStr) {
                    try {
                        const userData = JSON.parse(userStr);
                        console.log('🔄 Restoring session for user:', userData);
                        setUser(userData);
                    } catch (err) {
                        console.error('❌ Failed to restore session:', err);
                        localStorage.clear();
                    }
                }
            } catch (error) {
                console.error('❌ Auth initialization error:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    // In AuthContext.jsx - Update the login function
const login = async (identifier, password) => {
    try {
        setLoading(true);
        setError(null);
        
        console.log('🔐 AuthContext - login called:', identifier);
        
        const response = await authAPI.login(identifier, password);
        console.log('🔐 AuthContext - API response:', response);
        
        // Check response structure - handle different formats
        let token, user;
        
        // Format 1: Direct properties
        if (response.token && response.user) {
            token = response.token;
            user = response.user;
        }
        // Format 2: Nested in data property
        else if (response.data && response.data.token && response.data.user) {
            token = response.data.token;
            user = response.data.user;
        }
        // Format 3: Success property
        else if (response.success && response.data && response.data.token) {
            token = response.data.token;
            user = response.data.user || response.data;
        }
        // Format 4: Just returns user with token property
        else if (response.token && response.id) {
            token = response.token;
            user = response;
        }
        else {
            console.error('🔐 Invalid response structure:', response);
            return { 
                success: false, 
                message: response.message || 'Invalid server response format' 
            };
        }
        
        // Ensure user has required properties
        if (!user.id) {
            console.error('🔐 User missing ID:', user);
            return { success: false, message: 'Invalid user data received' };
        }
        
        // Ensure user has a role
        if (!user.role) {
            user.role = 'student'; // Default role
            console.warn('⚠️ User role not specified, defaulting to student');
        }
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        console.log('✅ Login successful!');
        console.log('✅ User role:', user.role);
        console.log('✅ User data:', user);
        console.log('✅ Token stored:', token ? 'Yes' : 'No');
        
        return { 
            success: true, 
            user: user,
            token: token,
            redirectTo: getDashboardRoute(user.role)
        };
        
    } catch (error) {
        console.error('❌ AuthContext - Login error details:', error);
        
        // Extract error message
        let errorMsg = 'Login failed';
        if (typeof error === 'string') {
            errorMsg = error;
        } else if (error.message) {
            errorMsg = error.message;
        } else if (error.response?.data?.message) {
            errorMsg = error.response.data.message;
        }
        
        console.error('❌ AuthContext - Login error message:', errorMsg);
        setError(errorMsg);
        
        return { 
            success: false, 
            message: errorMsg 
        };
    } finally {
        setLoading(false);
    }
};

    const registerStudent = async (studentData) => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('📝 Student registration:', studentData);
            const response = await authAPI.registerStudent(studentData);
            
            if (response.success) {
                console.log('✅ Registration successful');
                return { 
                    success: true, 
                    data: response.data,
                    message: response.message 
                };
            } else {
                throw new Error(response.message || 'Registration failed');
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Registration failed';
            console.error('❌ Registration error:', errorMsg);
            setError(errorMsg);
            return { 
                success: false, 
                message: errorMsg 
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = (redirectToLogin = true) => {
        console.log('🚪 Logging out user:', user?.email);
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear state
        setUser(null);
        setError(null);
        
        console.log('✅ Logout successful');
        
        // Redirect to login page
        if (redirectToLogin) {
            window.location.href = '/login';
        }
    };

    const updateUser = (userData) => {
        try {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            console.log('✅ User updated:', updatedUser);
        } catch (error) {
            console.error('❌ Failed to update user:', error);
        }
    };

    const getDashboardRoute = (role) => {
        switch (role) {
            case 'admin':
                return '/admin';
            case 'accountant':
                return '/accountant';
            case 'student':
                return '/student';
            default:
                return '/login';
        }
    };

    const isAuthenticated = () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        return !!(token && userStr && user);
    };

    const hasRole = (role) => {
        return user?.role === role;
    };

    const getToken = () => {
        return localStorage.getItem('token');
    };

    const value = {
        user,
        loading,
        error,
        login,
        registerStudent,
        logout,
        updateUser,
        isAuthenticated: isAuthenticated(),
        hasRole,
        getToken,
        getDashboardRoute // Added this to expose the function if needed
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading ? children : (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}>
                    <div style={{
                        textAlign: 'center',
                        color: 'white'
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            borderTop: '3px solid white',
                            borderRadius: '50%',
                            margin: '0 auto 20px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p>Loading authentication...</p>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};