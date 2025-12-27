import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import components
import Login from './components/Login';
import StudentRegister from './components/StudentRegister';
import StudentDashboard from './components/student/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import AccountantDashboard from './components/AccountantDashboard';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                iconTheme: {
                                    primary: '#4CAF50',
                                    secondary: '#fff',
                                },
                            },
                            error: {
                                duration: 4000,
                                iconTheme: {
                                    primary: '#e74c3c',
                                    secondary: '#fff',
                                },
                            },
                        }}
                    />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<StudentRegister />} />
                        
                        {/* Protected routes */}
                        <Route path="/student" element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/accountant" element={
                            <ProtectedRoute allowedRoles={['accountant']}>
                                <AccountantDashboard />
                            </ProtectedRoute>
                        } />
                        
                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        
                        {/* 404 Page */}
                        <Route path="*" element={
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '50px',
                                backgroundColor: '#f5f7fa',
                                minHeight: '100vh',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <h1 style={{ fontSize: '48px', color: '#2c3e50', marginBottom: '20px' }}>404</h1>
                                <h2 style={{ color: '#7f8c8d', marginBottom: '20px' }}>Page Not Found</h2>
                                <a href="/login" style={{
                                    padding: '12px 30px',
                                    backgroundColor: '#667eea',
                                    color: 'white',
                                    textDecoration: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    marginTop: '20px',
                                    display: 'inline-block'
                                }}>
                                    Go to Login
                                </a>
                            </div>
                        } />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;