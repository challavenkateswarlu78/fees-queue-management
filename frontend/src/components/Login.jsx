import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('student');
    const [isLoading, setIsLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();

    const testBackendConnection = async () => {
        try {
            toast.loading('Testing backend connection...');
            const response = await authAPI.testConnection();
            toast.dismiss();
            toast.success(`✅ Backend connected! Origin: ${response.origin}`);
            console.log('Backend test response:', response);
        } catch (error) {
            toast.dismiss();
            toast.error(`❌ Backend connection failed: ${error.message}`);
        }
    };

    const testHealth = async () => {
        try {
            const response = await authAPI.healthCheck();
            toast.success(`✅ ${response.message}`);
        } catch (error) {
            toast.error(`❌ Health check failed: ${error.message}`);
        }
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    console.log('🔍 Login attempt:', identifier, userType);
    
    try {
        // ============ HARDCODED USERS WITH CORRECT PASSWORDS ============
        const hardcodedUsers = {
            // Admin - uses admin123
            'admin@college.edu': {
                password: 'admin123', // Correct password
                user: {
                    id: 1,
                    username: 'admin',
                    email: 'admin@college.edu',
                    role: 'admin',
                    details: {
                        full_name: 'System Administrator',
                        department: 'Administration',
                        photo_url: null,
                        college_email: 'admin@college.edu'
                    }
                }
            },
            'admin': {
                password: 'admin123', // Correct password
                user: {
                    id: 1,
                    username: 'admin',
                    email: 'admin@college.edu',
                    role: 'admin',
                    details: {
                        full_name: 'System Administrator',
                        department: 'Administration',
                        photo_url: null,
                        college_email: 'admin@college.edu'
                    }
                }
            },
            
            // Accountant - uses accountant123
            'accountant@college.edu': {
                password: 'accountant123', // Correct password
                user: {
                    id: 2,
                    username: 'accountant',
                    email: 'accountant@college.edu',
                    role: 'accountant',
                    details: {
                        full_name: 'Accountant User',
                        department: 'Finance',
                        photo_url: null,
                        college_email: 'accountant@college.edu'
                    }
                }
            },
            'accountant': {
                password: 'accountant123', // Correct password
                user: {
                    id: 2,
                    username: 'accountant',
                    email: 'accountant@college.edu',
                    role: 'accountant',
                    details: {
                        full_name: 'Accountant User',
                        department: 'Finance',
                        photo_url: null,
                        college_email: 'accountant@college.edu'
                    }
                }
            },
            
            // Test Student - uses student123
            'student@college.edu': {
                password: 'student123', // Correct password
                user: {
                    id: 3,
                    username: 'student',
                    email: 'student@college.edu',
                    role: 'student',
                    details: {
                        full_name: 'Test Student',
                        roll_number: 'ROLL001',
                        year: '3',
                        branch: 'CSE',
                        college_email: 'student@college.edu',
                        phone_number: '9876543210',
                        photo_url: null
                    }
                }
            },
            'roll001': {
                password: 'student123', // Correct password
                user: {
                    id: 3,
                    username: 'student',
                    email: 'student@college.edu',
                    role: 'student',
                    details: {
                        full_name: 'Test Student',
                        roll_number: 'ROLL001',
                        year: '3',
                        branch: 'CSE',
                        college_email: 'student@college.edu',
                        phone_number: '9876543210',
                        photo_url: null
                    }
                }
            }
        };

        const userKey = identifier.toLowerCase();
        console.log('🔍 Checking for user:', userKey);
        
        // Check if it's a hardcoded user (admin/accountant/test student)
        if (hardcodedUsers[userKey] && hardcodedUsers[userKey].password === password) {
            const userData = hardcodedUsers[userKey].user;
            
            console.log('✅ Hardcoded user matched:', userData);
            console.log('✅ User role:', userData.role);
            
            // Clear any existing data first
            localStorage.clear();
            
            // Store in localStorage
            localStorage.setItem('token', `demo-token-${userData.role}-${Date.now()}`);
            localStorage.setItem('user', JSON.stringify(userData));
            
            console.log('✅ Stored in localStorage');
            console.log('Token:', localStorage.getItem('token'));
            console.log('User:', localStorage.getItem('user'));
            
            toast.success(`✅ Login successful as ${userData.role}!`);
            
            // Force redirect based on role
            setTimeout(() => {
                console.log('🔄 Redirecting to dashboard...');
                
                if (userData.role === 'admin') {
                    window.location.href = '/admin';
                } else if (userData.role === 'accountant') {
                    window.location.href = '/accountant';
                } else if (userData.role === 'student') {
                    window.location.href = '/student';
                }
            }, 300);
            
        } else {
            console.log('❌ Not a hardcoded user, trying API login for registered students');
            
            // ============ API LOGIN FOR REGISTERED STUDENTS ============
            const result = await login(identifier, password);
            console.log('🔍 API Login result:', result);
            
            if (result.success) {
                toast.success('Login successful!');
                
                // Registered students should go to student dashboard
                setTimeout(() => {
                    console.log('🔍 Navigating registered student...');
                    window.location.href = '/student';
                }, 300);
                
            } else {
                console.error('❌ API Login failed:', result.message);
                
                // If API fails, check if it might be a hardcoded user with wrong password
                if (hardcodedUsers[userKey]) {
                    toast.error(`Wrong password for ${userKey}. Try: ${hardcodedUsers[userKey].password}`);
                } else {
                    toast.error(result.message || 'Login failed. Check your credentials.');
                }
            }
        }
    } catch (error) {
        console.error('🔍 Login error:', error);
        toast.error(error.message || 'Connection error');
    } finally {
        setIsLoading(false);
    }
};
    

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1>Fees Queue Management</h1>
                    <p>Sign in to your account</p>
                </div>

                {/* Test Buttons */}
                <div className="test-buttons">
                    <button type="button" onClick={testBackendConnection} className="test-btn">
                        Test Backend Connection
                    </button>
                    <button type="button" onClick={testHealth} className="test-btn">
                        Health Check
                    </button>
                </div>

                {/* Rest of your login form remains the same */}
                <div className="user-type-selector">
                    <button type="button" className={`user-type-btn ${userType === 'student' ? 'active' : ''}`}
                        onClick={() => setUserType('student')}>
                        Student
                    </button>
                    <button type="button" className={`user-type-btn ${userType === 'admin' ? 'active' : ''}`}
                        onClick={() => setUserType('admin')}>
                        Admin
                    </button>
                    <button type="button" className={`user-type-btn ${userType === 'accountant' ? 'active' : ''}`}
                        onClick={() => setUserType('accountant')}>
                        Accountant
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder={userType === 'student' ? 'Email or Roll Number' : 'Email'}
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={isLoading}>
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>

                    {userType === 'student' && (
                        <div className="register-link">
                            <p>Don't have an account? <Link to="/register">Create Account</Link></p>
                        </div>
                    )}
                </form>

                <div className="demo-credentials">
    <h3>Demo Credentials:</h3>
    <p><strong>Admin:</strong> admin@college.edu / admin123</p>
    <p><strong>Accountant:</strong> accountant@college.edu / accountant123</p>
    <p><strong>Test Student:</strong> student@college.edu / student123</p>
    <p><strong>Test Student Roll No:</strong> ROLL001 / student123</p>
    <p><strong>Registered Students:</strong> Use your registered email and password</p>
</div>
<div style={{ 
    marginTop: '20px', 
    padding: '15px', 
    background: '#ffebee', 
    borderRadius: '8px',
    border: '2px solid #f44336'
}}>
    <h4 style={{ color: '#d32f2f', marginTop: 0 }}>Emergency Admin Login</h4>
    <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
        Use if regular admin login doesn't work
    </p>
    
    <button 
        onClick={() => {
            console.log('🚨 Emergency Admin Login');
            
            const adminUser = {
                id: 1,
                email: 'admin@college.edu',
                role: 'admin',
                username: 'admin',
                details: {
                    full_name: 'System Administrator',
                    department: 'Administration'
                }
            };
            
            localStorage.clear();
            localStorage.setItem('token', 'emergency-admin-token');
            localStorage.setItem('user', JSON.stringify(adminUser));
            
            toast.success('Emergency admin login! Redirecting...');
            
            setTimeout(() => {
                window.location.href = '/admin';
            }, 500);
        }}
        style={{
            background: '#d32f2f',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
        }}
    >
        Emergency Admin Login
    </button>
</div>
            </div>
        </div>
    );
};

export default Login;