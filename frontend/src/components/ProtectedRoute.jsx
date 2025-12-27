import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const [localUser, setLocalUser] = useState(null);
    
    // Check localStorage on mount
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                setLocalUser(JSON.parse(userStr));
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }
    }, []);
    
    console.log('🔐 ProtectedRoute Debug:');
    console.log('   - AuthContext user:', user);
    console.log('   - localStorage user:', localUser);
    console.log('   - loading:', loading);
    console.log('   - allowedRoles:', allowedRoles);
    
    // Use either AuthContext user or localStorage user
    const currentUser = user || localUser;
    
    if (loading && !currentUser) {
        console.log('🔐 Still loading, showing spinner');
        return <div>Loading...</div>;
    }
    
    if (!currentUser) {
        console.log('🔐 No user found, redirecting to login');
        return <Navigate to="/login" replace />;
    }
    
    if (!allowedRoles.includes(currentUser.role)) {
        console.log(`🔐 Role ${currentUser.role} not in ${allowedRoles}, redirecting`);
        return <Navigate to="/login" replace />;
    }
    
    console.log('🔐 Access granted for role:', currentUser.role);
    return children;
};

export default ProtectedRoute;