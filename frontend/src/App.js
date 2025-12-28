// App.js
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
                        <Route path="/student/*" element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentDashboard />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/admin/*" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/accountant/*" element={
                            <ProtectedRoute allowedRoles={['accountant']}>
                                <AccountantDashboard />
                            </ProtectedRoute>
                        } />
                        
                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        
                        {/* 404 Page */}
                        <Route path="*" element={
                            <div className="not-found-page">
                                <h1>404</h1>
                                <h2>Page Not Found</h2>
                                <a href="/login" className="back-to-login">
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