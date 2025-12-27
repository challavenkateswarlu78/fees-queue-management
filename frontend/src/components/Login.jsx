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
    
    try {
        const result = await login(identifier, password);
        console.log('🔍 Login result:', result);
        
        if (result.success) {
            toast.success('Login successful!');
            
            // Wait a bit for AuthContext to update
            setTimeout(() => {
                console.log('🔍 Navigating after delay...');
                navigate('/student');
            }, 100);
            
        } else {
            toast.error(result.message || 'Login failed');
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
                    <p><strong>Accountant:</strong> accountant@college.edu / admin123</p>
                    <p><strong>Student:</strong> student@college.edu / student123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;