import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StudentSidebar from './StudentSidebar';
import DashboardContent from './DashboardContent';
import './styles/StudentDashboard.css';

const StudentDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication
        if (!user || user.role !== 'student') {
            navigate('/login');
            return;
        }
        
        // Fetch student data
        fetchStudentData();
    }, [user, navigate]);

    const fetchStudentData = async () => {
        try {
            // In a real app, you would fetch from API
            // For now, use mock data with actual user info
            const data = {
                id: user.id,
                name: user.details?.full_name || 'Student Name',
                rollNumber: user.roll_number || user.details?.roll_number || 'N/A',
                year: user.details?.year || 'N/A',
                branch: user.details?.branch || 'N/A',
                email: user.details?.college_email || user.email,
                phone: user.details?.phone_number || 'N/A',
                photoUrl: user.details?.photo_url || null
            };
            setStudentData(data);
        } catch (error) {
            console.error('Error fetching student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleProfileUpdate = () => {
        fetchStudentData(); // Refresh student data
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your dashboard...</p>
            </div>
        );
    }

    return (
        <div className="student-dashboard">
            <StudentSidebar
                studentData={studentData}
                activeMenu={activeMenu}
                onMenuClick={handleMenuClick}
                onLogout={handleLogout}
            />
            <DashboardContent
                activeMenu={activeMenu}
                studentData={studentData}
                onProfileUpdate={handleProfileUpdate}
                onLogout={handleLogout}
            />
        </div>
    );
};

export default StudentDashboard;