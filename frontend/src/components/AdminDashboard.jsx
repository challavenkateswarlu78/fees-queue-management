// AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    FiHome, FiUsers, FiDollarSign, FiSettings, FiLogOut, 
    FiBarChart2, FiUserPlus, FiFileText, FiCheckCircle,
    FiAlertCircle, FiClock, FiEdit2, FiTrash2, FiSearch,
    FiFilter, FiDownload, FiEye, FiPlus, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        
        fetchAdminData();
    }, [user, navigate]);

    const fetchAdminData = async () => {
        try {
            const data = {
                id: user.id,
                name: user.details?.full_name || 'Admin User',
                email: user.email,
                role: 'Administrator',
                department: 'Finance & Administration',
                photoUrl: user.details?.photo_url || null
            };
            setAdminData(data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
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

    // AdminSidebar Component
    const AdminSidebar = ({ adminData, activeMenu, onMenuClick, onLogout }) => {
        const getInitial = (name) => {
            return name ? name.charAt(0).toUpperCase() : 'A';
        };

        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
            { id: 'students', label: 'Student Management', icon: <FiUsers /> },
            { id: 'accountants', label: 'Accountant Management', icon: <FiUserPlus /> },
            { id: 'payments', label: 'Payments Overview', icon: <FiDollarSign /> },
            { id: 'counters', label: 'Counter Management', icon: <FiFileText /> },
            { id: 'reports', label: 'Reports & Analytics', icon: <FiBarChart2 /> },
            { id: 'settings', label: 'System Settings', icon: <FiSettings /> },
        ];

        return (
            <div className="admin-sidebar" id="admin-sidebar">
                {/* Profile Section */}
                <div className="sidebar-profile" id="sidebar-profile">
                    <div className="profile-image" id="profile-image">
                        {adminData?.photoUrl ? (
                            <img 
                                src={adminData.photoUrl} 
                                alt={adminData.name} 
                                className="profile-photo" 
                                id="profile-photo"
                            />
                        ) : (
                            <div className="profile-avatar admin" id="profile-avatar">
                                {getInitial(adminData?.name)}
                            </div>
                        )}
                    </div>
                    <div className="profile-info" id="profile-info">
                        <h3 className="admin-name" id="admin-name">{adminData?.name}</h3>
                        <p className="admin-role" id="admin-role">{adminData?.role}</p>
                        <p className="admin-department" id="admin-department">{adminData?.department}</p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav" id="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            id={`nav-item-${item.id}`}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => onMenuClick(item.id)}
                            data-menu={item.id}
                        >
                            <span className="nav-icon" id={`nav-icon-${item.id}`}>{item.icon}</span>
                            <span className="nav-label" id={`nav-label-${item.id}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="sidebar-footer" id="sidebar-footer">
                    <button 
                        className="logout-btn" 
                        id="logout-btn"
                        onClick={onLogout}
                        aria-label="Logout"
                    >
                        <FiLogOut className="logout-icon" id="logout-icon" />
                        <span id="logout-text">Logout</span>
                    </button>
                </div>
            </div>
        );
    };

    // DashboardContent Component
    const DashboardContent = ({ activeMenu, adminData }) => {
        const getPageTitle = () => {
            switch (activeMenu) {
                case 'dashboard': return 'Admin Dashboard';
                case 'students': return 'Student Management';
                case 'accountants': return 'Accountant Management';
                case 'payments': return 'Payments Overview';
                case 'counters': return 'Counter Management';
                case 'reports': return 'Reports & Analytics';
                case 'settings': return 'System Settings';
                default: return 'Admin Dashboard';
            }
        };

        const getPageDescription = () => {
            switch (activeMenu) {
                case 'dashboard': return 'Welcome to the administration panel';
                case 'students': return 'Manage student accounts and information';
                case 'accountants': return 'Manage accountant users and permissions';
                case 'payments': return 'View and manage all payment transactions';
                case 'counters': return 'Configure payment counters and settings';
                case 'reports': return 'Generate reports and view analytics';
                case 'settings': return 'Configure system settings and preferences';
                default: return '';
            }
        };

        const renderContent = () => {
            switch (activeMenu) {
                case 'dashboard':
                    return <AdminDashboardHome adminData={adminData} />;
                case 'students':
                    return <StudentManagement />;
                case 'accountants':
                    return <AccountantManagement />;
                case 'payments':
                    return <PaymentsOverview />;
                case 'counters':
                    return <CounterManagement />;
                case 'reports':
                    return <ReportsAnalytics />;
                case 'settings':
                    return <SystemSettings />;
                default:
                    return <AdminDashboardHome adminData={adminData} />;
            }
        };

        return (
            <div className="dashboard-content" id="dashboard-content">
                {/* Header */}
                <header className="content-header" id="content-header">
                    <div className="header-left" id="header-left">
                        <h1 className="page-title" id="page-title">{getPageTitle()}</h1>
                        <p className="page-description" id="page-description">{getPageDescription()}</p>
                    </div>
                    <div className="header-right" id="header-right">
                        <div className="admin-welcome" id="admin-welcome">
                            <span id="welcome-role">Administrator</span>
                            <strong id="welcome-name">{adminData?.name}</strong>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="content-main" id="content-main">
                    {renderContent()}
                </main>
            </div>
        );
    };

    // AdminDashboardHome Component
    const AdminDashboardHome = ({ adminData }) => {
        const [dashboardStats, setDashboardStats] = useState({
            totalStudents: 0,
            totalAccountants: 0,
            totalPayments: 0,
            pendingPayments: 0,
            activeCounters: 0,
            todayTransactions: 0,
            revenueToday: 0,
            revenueMonth: 0
        });
        const [recentActivity, setRecentActivity] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchDashboardData();
        }, []);

        const fetchDashboardData = async () => {
            try {
                const stats = {
                    totalStudents: 1250,
                    totalAccountants: 25,
                    totalPayments: 3850,
                    pendingPayments: 42,
                    activeCounters: 8,
                    todayTransactions: 156,
                    revenueToday: 1250000,
                    revenueMonth: 18500000
                };

                const activity = [
                    { id: 1, type: 'payment', user: 'John Doe', details: 'Tuition Fee - ₹15,000', time: '10:30 AM', status: 'completed' },
                    { id: 2, type: 'registration', user: 'Alice Smith', details: 'New student registered', time: '9:45 AM', status: 'success' },
                    { id: 3, type: 'payment', user: 'Robert Johnson', details: 'Hostel Fee - ₹12,000', time: '9:15 AM', status: 'pending' },
                    { id: 4, type: 'account', user: 'System', details: 'New accountant account created', time: 'Yesterday', status: 'info' },
                    { id: 5, type: 'counter', user: 'Admin', details: 'Counter 3 activated', time: 'Yesterday', status: 'success' }
                ];

                setDashboardStats(stats);
                setRecentActivity(activity);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        };

        const formatNumber = (num) => {
            return new Intl.NumberFormat('en-IN').format(num);
        };

        if (loading) {
            return <div className="loading" id="dashboard-loading">Loading dashboard...</div>;
        }

        return (
            <div className="admin-dashboard-home" id="admin-dashboard-home">
                {/* Stats Overview */}
                <div className="stats-overview" id="stats-overview">
                    <div className="section-header" id="stats-header">
                        <h2 id="stats-title">System Overview</h2>
                        <button 
                            className="refresh-btn" 
                            id="refresh-stats-btn"
                            onClick={fetchDashboardData}
                            aria-label="Refresh dashboard statistics"
                        >
                            <FiRefreshCw id="refresh-icon" /> Refresh
                        </button>
                    </div>
                    
                    <div className="stats-grid" id="stats-grid-1">
                        <div className="stat-card" id="stat-card-students" data-stat="students">
                            <div className="stat-icon students" id="stat-icon-students">
                                <FiUsers id="stat-icon-students-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-students">
                                <h3 id="stat-title-students">Total Students</h3>
                                <p className="stat-value" id="stat-value-students">{formatNumber(dashboardStats.totalStudents)}</p>
                                <p className="stat-subtitle" id="stat-subtitle-students">Registered accounts</p>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-card-accountants" data-stat="accountants">
                            <div className="stat-icon accountants" id="stat-icon-accountants">
                                <FiUserPlus id="stat-icon-accountants-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-accountants">
                                <h3 id="stat-title-accountants">Accountants</h3>
                                <p className="stat-value" id="stat-value-accountants">{formatNumber(dashboardStats.totalAccountants)}</p>
                                <p className="stat-subtitle" id="stat-subtitle-accountants">Active staff</p>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-card-payments" data-stat="payments">
                            <div className="stat-icon payments" id="stat-icon-payments">
                                <FiDollarSign id="stat-icon-payments-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-payments">
                                <h3 id="stat-title-payments">Total Payments</h3>
                                <p className="stat-value" id="stat-value-payments">{formatNumber(dashboardStats.totalPayments)}</p>
                                <p className="stat-subtitle" id="stat-subtitle-payments">Transactions processed</p>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-card-pending" data-stat="pending">
                            <div className="stat-icon pending" id="stat-icon-pending">
                                <FiClock id="stat-icon-pending-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-pending">
                                <h3 id="stat-title-pending">Pending Payments</h3>
                                <p className="stat-value" id="stat-value-pending">{formatNumber(dashboardStats.pendingPayments)}</p>
                                <p className="stat-subtitle" id="stat-subtitle-pending">Awaiting processing</p>
                            </div>
                        </div>
                    </div>

                    <div className="stats-grid" id="stats-grid-2">
                        <div className="stat-card" id="stat-card-counters" data-stat="counters">
                            <div className="stat-icon counters" id="stat-icon-counters">
                                <FiFileText id="stat-icon-counters-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-counters">
                                <h3 id="stat-title-counters">Active Counters</h3>
                                <p className="stat-value" id="stat-value-counters">{dashboardStats.activeCounters}/10</p>
                                <p className="stat-subtitle" id="stat-subtitle-counters">Currently operational</p>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-card-transactions" data-stat="transactions">
                            <div className="stat-icon transactions" id="stat-icon-transactions">
                                <FiBarChart2 id="stat-icon-transactions-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-transactions">
                                <h3 id="stat-title-transactions">Today's Transactions</h3>
                                <p className="stat-value" id="stat-value-transactions">{formatNumber(dashboardStats.todayTransactions)}</p>
                                <p className="stat-subtitle" id="stat-subtitle-transactions">Payment requests</p>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-card-revenue-day" data-stat="revenue-day">
                            <div className="stat-icon revenue-day" id="stat-icon-revenue-day">
                                <FiDollarSign id="stat-icon-revenue-day-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-revenue-day">
                                <h3 id="stat-title-revenue-day">Today's Revenue</h3>
                                <p className="stat-value" id="stat-value-revenue-day">{formatCurrency(dashboardStats.revenueToday)}</p>
                                <p className="stat-subtitle" id="stat-subtitle-revenue-day">Total collected today</p>
                            </div>
                        </div>

                        <div className="stat-card" id="stat-card-revenue-month" data-stat="revenue-month">
                            <div className="stat-icon revenue-month" id="stat-icon-revenue-month">
                                <FiBarChart2 id="stat-icon-revenue-month-svg" />
                            </div>
                            <div className="stat-content" id="stat-content-revenue-month">
                                <h3 id="stat-title-revenue-month">Monthly Revenue</h3>
                                <p className="stat-value" id="stat-value-revenue-month">{formatCurrency(dashboardStats.revenueMonth)}</p>
                                <p className="stat-subtitle" id="stat-subtitle-revenue-month">This month's total</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions" id="quick-actions">
                    <h2 id="quick-actions-title">Quick Actions</h2>
                    <div className="actions-grid" id="actions-grid">
                        <button 
                            className="action-btn" 
                            id="action-add-student"
                            onClick={() => setActiveMenu('students')}
                            data-action="add-student"
                        >
                            <FiUserPlus id="action-icon-add-student" />
                            <span id="action-label-add-student">Add New Student</span>
                        </button>
                        <button 
                            className="action-btn" 
                            id="action-manage-accountants"
                            onClick={() => setActiveMenu('accountants')}
                            data-action="manage-accountants"
                        >
                            <FiUsers id="action-icon-manage-accountants" />
                            <span id="action-label-manage-accountants">Manage Accountants</span>
                        </button>
                        <button 
                            className="action-btn" 
                            id="action-view-payments"
                            onClick={() => setActiveMenu('payments')}
                            data-action="view-payments"
                        >
                            <FiDollarSign id="action-icon-view-payments" />
                            <span id="action-label-view-payments">View All Payments</span>
                        </button>
                        <button 
                            className="action-btn" 
                            id="action-generate-report"
                            onClick={() => setActiveMenu('reports')}
                            data-action="generate-report"
                        >
                            <FiDownload id="action-icon-generate-report" />
                            <span id="action-label-generate-report">Generate Report</span>
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity" id="recent-activity">
                    <h2 id="recent-activity-title">Recent Activity</h2>
                    <div className="activity-list" id="activity-list">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="activity-item" id={`activity-item-${activity.id}`}>
                                <div className={`activity-icon ${activity.type}`} id={`activity-icon-${activity.id}`}>
                                    {activity.type === 'payment' && <FiDollarSign id={`activity-icon-svg-${activity.id}`} />}
                                    {activity.type === 'registration' && <FiUserPlus id={`activity-icon-svg-${activity.id}`} />}
                                    {activity.type === 'account' && <FiUsers id={`activity-icon-svg-${activity.id}`} />}
                                    {activity.type === 'counter' && <FiSettings id={`activity-icon-svg-${activity.id}`} />}
                                </div>
                                <div className="activity-content" id={`activity-content-${activity.id}`}>
                                    <h4 id={`activity-details-${activity.id}`}>{activity.details}</h4>
                                    <p id={`activity-meta-${activity.id}`}>By {activity.user} • {activity.time}</p>
                                </div>
                                <div className={`activity-status ${activity.status}`} id={`activity-status-${activity.id}`}>
                                    {activity.status === 'completed' && <FiCheckCircle id={`activity-status-icon-${activity.id}`} />}
                                    {activity.status === 'pending' && <FiClock id={`activity-status-icon-${activity.id}`} />}
                                    {activity.status === 'success' && <FiCheckCircle id={`activity-status-icon-${activity.id}`} />}
                                    {activity.status === 'info' && <FiAlertCircle id={`activity-status-icon-${activity.id}`} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // StudentManagement Component
    const StudentManagement = () => {
        const [students, setStudents] = useState([]);
        const [filteredStudents, setFilteredStudents] = useState([]);
        const [loading, setLoading] = useState(true);
        const [searchTerm, setSearchTerm] = useState('');
        const [showAddModal, setShowAddModal] = useState(false);
        const [showEditModal, setShowEditModal] = useState(false);
        const [selectedStudent, setSelectedStudent] = useState(null);
        const [currentPage, setCurrentPage] = useState(1);
        const itemsPerPage = 10;

        const [newStudent, setNewStudent] = useState({
            full_name: '',
            roll_number: '',
            email: '',
            phone: '',
            year: '',
            branch: '',
            password: ''
        });

        useEffect(() => {
            fetchStudents();
        }, []);

        useEffect(() => {
            const filtered = students.filter(student =>
                student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredStudents(filtered);
        }, [searchTerm, students]);

        const fetchStudents = async () => {
            try {
                // Mock data
                const mockStudents = Array.from({ length: 50 }, (_, i) => ({
                    id: i + 1,
                    full_name: `Student ${i + 1}`,
                    roll_number: `ROLL${String(i + 1).padStart(4, '0')}`,
                    email: `student${i + 1}@college.edu`,
                    phone: `98765432${String(i).padStart(2, '0')}`,
                    year: Math.floor(Math.random() * 4) + 1,
                    branch: ['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'][Math.floor(Math.random() * 5)],
                    status: ['active', 'active', 'active', 'inactive'][Math.floor(Math.random() * 4)],
                    registration_date: new Date(Date.now() - Math.random() * 31536000000).toISOString()
                }));
                setStudents(mockStudents);
                setFilteredStudents(mockStudents);
            } catch (error) {
                console.error('Error fetching students:', error);
                toast.error('Failed to load students');
            } finally {
                setLoading(false);
            }
        };

        const handleAddStudent = async () => {
            try {
                // Validate form
                if (!newStudent.full_name || !newStudent.roll_number || !newStudent.email) {
                    toast.error('Please fill in all required fields');
                    return;
                }

                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                const student = {
                    id: students.length + 1,
                    ...newStudent,
                    status: 'active',
                    registration_date: new Date().toISOString()
                };
                
                setStudents([student, ...students]);
                setNewStudent({
                    full_name: '',
                    roll_number: '',
                    email: '',
                    phone: '',
                    year: '',
                    branch: '',
                    password: ''
                });
                setShowAddModal(false);
                toast.success('Student added successfully!');
            } catch (error) {
                console.error('Error adding student:', error);
                toast.error('Failed to add student');
            }
        };

        const handleEditStudent = async () => {
            try {
                if (!selectedStudent) return;

                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setStudents(students.map(s => 
                    s.id === selectedStudent.id ? { ...s, ...selectedStudent } : s
                ));
                
                setShowEditModal(false);
                setSelectedStudent(null);
                toast.success('Student updated successfully!');
            } catch (error) {
                console.error('Error updating student:', error);
                toast.error('Failed to update student');
            }
        };

        const handleDeleteStudent = async (id) => {
            if (!window.confirm('Are you sure you want to delete this student?')) return;

            try {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setStudents(students.filter(s => s.id !== id));
                toast.success('Student deleted successfully!');
            } catch (error) {
                console.error('Error deleting student:', error);
                toast.error('Failed to delete student');
            }
        };

        const handleToggleStatus = async (id) => {
            try {
                // Mock API call
                await new Promise(resolve => setTimeout(resolve, 500));
                
                setStudents(students.map(s => 
                    s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
                ));
                
                toast.success('Student status updated!');
            } catch (error) {
                console.error('Error updating status:', error);
                toast.error('Failed to update status');
            }
        };

        // Pagination
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
        const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

        if (loading) {
            return <div className="loading" id="students-loading">Loading students...</div>;
        }

        return (
            <div className="student-management" id="student-management">
                <div className="section-header" id="students-header">
                    <div className="header-left" id="students-header-left">
                        <h2 id="students-title">Student Management</h2>
                        <p id="students-description">Manage all student accounts and information</p>
                    </div>
                    <button 
                        className="add-btn" 
                        id="add-student-btn"
                        onClick={() => setShowAddModal(true)}
                        aria-label="Add new student"
                    >
                        <FiPlus id="add-student-icon" /> Add New Student
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="search-filters" id="student-search-filters">
                    <div className="search-box" id="student-search-box">
                        <FiSearch id="student-search-icon" />
                        <input
                            type="text"
                            id="student-search-input"
                            placeholder="Search by name, roll number, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            aria-label="Search students"
                        />
                    </div>
                    <div className="filter-buttons" id="student-filter-buttons">
                        <button className="filter-btn" id="student-filter-btn" aria-label="Filter students">
                            <FiFilter id="filter-icon" /> Filter
                        </button>
                        <button className="export-btn" id="student-export-btn" aria-label="Export students">
                            <FiDownload id="export-icon" /> Export
                        </button>
                    </div>
                </div>

                {/* Students Table */}
                <div className="students-table" id="students-table">
                    <table id="students-table-content">
                        <thead id="students-table-header">
                            <tr id="students-table-header-row">
                                <th id="header-roll">Roll No.</th>
                                <th id="header-name">Name</th>
                                <th id="header-email">Email</th>
                                <th id="header-phone">Phone</th>
                                <th id="header-year">Year</th>
                                <th id="header-branch">Branch</th>
                                <th id="header-status">Status</th>
                                <th id="header-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="students-table-body">
                            {currentStudents.map((student) => (
                                <tr key={student.id} id={`student-row-${student.id}`} className="student-row" data-student-id={student.id}>
                                    <td id={`student-roll-${student.id}`}>{student.roll_number}</td>
                                    <td id={`student-name-cell-${student.id}`}>
                                        <div className="student-info" id={`student-info-${student.id}`}>
                                            <div className="student-name" id={`student-name-${student.id}`}>{student.full_name}</div>
                                        </div>
                                    </td>
                                    <td id={`student-email-${student.id}`}>{student.email}</td>
                                    <td id={`student-phone-${student.id}`}>{student.phone}</td>
                                    <td id={`student-year-${student.id}`}>Year {student.year}</td>
                                    <td id={`student-branch-${student.id}`}>{student.branch}</td>
                                    <td id={`student-status-cell-${student.id}`}>
                                        <span className={`status-badge ${student.status}`} id={`student-status-${student.id}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td id={`student-actions-${student.id}`}>
                                        <div className="action-buttons" id={`action-buttons-${student.id}`}>
                                            <button 
                                                className="action-btn view"
                                                id={`view-student-${student.id}`}
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setShowEditModal(true);
                                                }}
                                                aria-label={`View student ${student.full_name}`}
                                            >
                                                <FiEye id={`view-icon-${student.id}`} />
                                            </button>
                                            <button 
                                                className="action-btn toggle"
                                                id={`toggle-status-${student.id}`}
                                                onClick={() => handleToggleStatus(student.id)}
                                                aria-label={`Toggle status for ${student.full_name}`}
                                            >
                                                {student.status === 'active' ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button 
                                                className="action-btn delete"
                                                id={`delete-student-${student.id}`}
                                                onClick={() => handleDeleteStudent(student.id)}
                                                aria-label={`Delete student ${student.full_name}`}
                                            >
                                                <FiTrash2 id={`delete-icon-${student.id}`} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination" id="students-pagination">
                        <button 
                            id="pagination-prev"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            Previous
                        </button>
                        <span id="pagination-info">Page {currentPage} of {totalPages}</span>
                        <button 
                            id="pagination-next"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            Next
                        </button>
                    </div>
                )}

                {/* Add Student Modal */}
                {showAddModal && (
                    <div className="modal-overlay" id="add-student-modal-overlay">
                        <div className="modal" id="add-student-modal">
                            <div className="modal-header" id="add-student-modal-header">
                                <h3 id="add-student-modal-title">Add New Student</h3>
                                <button 
                                    className="close-btn" 
                                    id="close-add-student-modal"
                                    onClick={() => setShowAddModal(false)}
                                    aria-label="Close modal"
                                >×</button>
                            </div>
                            <div className="modal-body" id="add-student-modal-body">
                                <div className="form-grid" id="add-student-form-grid">
                                    <div className="form-group" id="form-group-name">
                                        <label htmlFor="student-full-name">Full Name *</label>
                                        <input
                                            type="text"
                                            id="student-full-name"
                                            value={newStudent.full_name}
                                            onChange={(e) => setNewStudent({...newStudent, full_name: e.target.value})}
                                            placeholder="Enter full name"
                                            aria-required="true"
                                        />
                                    </div>
                                    <div className="form-group" id="form-group-roll">
                                        <label htmlFor="student-roll-number">Roll Number *</label>
                                        <input
                                            type="text"
                                            id="student-roll-number"
                                            value={newStudent.roll_number}
                                            onChange={(e) => setNewStudent({...newStudent, roll_number: e.target.value})}
                                            placeholder="Enter roll number"
                                            aria-required="true"
                                        />
                                    </div>
                                    <div className="form-group" id="form-group-email">
                                        <label htmlFor="student-email">Email *</label>
                                        <input
                                            type="email"
                                            id="student-email"
                                            value={newStudent.email}
                                            onChange={(e) => setNewStudent({...newStudent, email: e.target.value})}
                                            placeholder="Enter email"
                                            aria-required="true"
                                        />
                                    </div>
                                    <div className="form-group" id="form-group-phone">
                                        <label htmlFor="student-phone">Phone</label>
                                        <input
                                            type="tel"
                                            id="student-phone"
                                            value={newStudent.phone}
                                            onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    <div className="form-group" id="form-group-year">
                                        <label htmlFor="student-year">Year</label>
                                        <select
                                            id="student-year"
                                            value={newStudent.year}
                                            onChange={(e) => setNewStudent({...newStudent, year: e.target.value})}
                                        >
                                            <option value="">Select Year</option>
                                            {[1, 2, 3, 4].map(year => (
                                                <option key={year} value={year} id={`year-option-${year}`}>Year {year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" id="form-group-branch">
                                        <label htmlFor="student-branch">Branch</label>
                                        <select
                                            id="student-branch"
                                            value={newStudent.branch}
                                            onChange={(e) => setNewStudent({...newStudent, branch: e.target.value})}
                                        >
                                            <option value="">Select Branch</option>
                                            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(branch => (
                                                <option key={branch} value={branch} id={`branch-option-${branch}`}>{branch}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" id="form-group-password">
                                        <label htmlFor="student-password">Password *</label>
                                        <input
                                            type="password"
                                            id="student-password"
                                            value={newStudent.password}
                                            onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                                            placeholder="Enter password"
                                            aria-required="true"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" id="add-student-modal-footer">
                                <button 
                                    className="btn-secondary" 
                                    id="cancel-add-student"
                                    onClick={() => setShowAddModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn-primary" 
                                    id="submit-add-student"
                                    onClick={handleAddStudent}
                                >
                                    Add Student
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Student Modal */}
                {showEditModal && selectedStudent && (
                    <div className="modal-overlay" id="edit-student-modal-overlay">
                        <div className="modal" id="edit-student-modal">
                            <div className="modal-header" id="edit-student-modal-header">
                                <h3 id="edit-student-modal-title">Edit Student</h3>
                                <button 
                                    className="close-btn" 
                                    id="close-edit-student-modal"
                                    onClick={() => setShowEditModal(false)}
                                    aria-label="Close modal"
                                >×</button>
                            </div>
                            <div className="modal-body" id="edit-student-modal-body">
                                <div className="form-grid" id="edit-student-form-grid">
                                    <div className="form-group" id="edit-form-group-name">
                                        <label htmlFor="edit-student-full-name">Full Name</label>
                                        <input
                                            type="text"
                                            id="edit-student-full-name"
                                            value={selectedStudent.full_name}
                                            onChange={(e) => setSelectedStudent({...selectedStudent, full_name: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group" id="edit-form-group-email">
                                        <label htmlFor="edit-student-email">Email</label>
                                        <input
                                            type="email"
                                            id="edit-student-email"
                                            value={selectedStudent.email}
                                            onChange={(e) => setSelectedStudent({...selectedStudent, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group" id="edit-form-group-phone">
                                        <label htmlFor="edit-student-phone">Phone</label>
                                        <input
                                            type="tel"
                                            id="edit-student-phone"
                                            value={selectedStudent.phone}
                                            onChange={(e) => setSelectedStudent({...selectedStudent, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group" id="edit-form-group-year">
                                        <label htmlFor="edit-student-year">Year</label>
                                        <select
                                            id="edit-student-year"
                                            value={selectedStudent.year}
                                            onChange={(e) => setSelectedStudent({...selectedStudent, year: e.target.value})}
                                        >
                                            {[1, 2, 3, 4].map(year => (
                                                <option key={year} value={year} id={`edit-year-option-${year}`}>Year {year}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" id="edit-form-group-branch">
                                        <label htmlFor="edit-student-branch">Branch</label>
                                        <select
                                            id="edit-student-branch"
                                            value={selectedStudent.branch}
                                            onChange={(e) => setSelectedStudent({...selectedStudent, branch: e.target.value})}
                                        >
                                            {['CSE', 'ECE', 'EEE', 'MECH', 'CIVIL'].map(branch => (
                                                <option key={branch} value={branch} id={`edit-branch-option-${branch}`}>{branch}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group" id="edit-form-group-status">
                                        <label htmlFor="edit-student-status">Status</label>
                                        <select
                                            id="edit-student-status"
                                            value={selectedStudent.status}
                                            onChange={(e) => setSelectedStudent({...selectedStudent, status: e.target.value})}
                                        >
                                            <option value="active" id="status-option-active">Active</option>
                                            <option value="inactive" id="status-option-inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer" id="edit-student-modal-footer">
                                <button 
                                    className="btn-secondary" 
                                    id="cancel-edit-student"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="btn-primary" 
                                    id="submit-edit-student"
                                    onClick={handleEditStudent}
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // AccountantManagement Component
    const AccountantManagement = () => {
        const [accountants, setAccountants] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchAccountants();
        }, []);

        const fetchAccountants = async () => {
            try {
                // Mock data
                const mockAccountants = Array.from({ length: 15 }, (_, i) => ({
                    id: i + 1,
                    name: `Accountant ${i + 1}`,
                    email: `accountant${i + 1}@college.edu`,
                    assigned_counter: `Counter ${(i % 5) + 1}`,
                    status: ['active', 'active', 'on_leave'][Math.floor(Math.random() * 3)],
                    last_login: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                    total_transactions: Math.floor(Math.random() * 1000) + 100
                }));
                setAccountants(mockAccountants);
            } catch (error) {
                console.error('Error fetching accountants:', error);
            } finally {
                setLoading(false);
            }
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        };

        if (loading) {
            return <div className="loading" id="accountants-loading">Loading accountants...</div>;
        }

        return (
            <div className="accountant-management" id="accountant-management">
                <div className="section-header" id="accountants-header">
                    <div className="header-left" id="accountants-header-left">
                        <h2 id="accountants-title">Accountant Management</h2>
                        <p id="accountants-description">Manage accountant users and their permissions</p>
                    </div>
                    <button className="add-btn" id="add-accountant-btn" aria-label="Add new accountant">
                        <FiPlus id="add-accountant-icon" /> Add Accountant
                    </button>
                </div>

                <div className="accountants-grid" id="accountants-grid">
                    {accountants.map((accountant) => (
                        <div key={accountant.id} className="accountant-card" id={`accountant-card-${accountant.id}`} data-accountant-id={accountant.id}>
                            <div className="accountant-header" id={`accountant-header-${accountant.id}`}>
                                <div className="accountant-avatar" id={`accountant-avatar-${accountant.id}`}>
                                    {accountant.name.charAt(0)}
                                </div>
                                <div className="accountant-info" id={`accountant-info-${accountant.id}`}>
                                    <h3 id={`accountant-name-${accountant.id}`}>{accountant.name}</h3>
                                    <p id={`accountant-email-${accountant.id}`}>{accountant.email}</p>
                                </div>
                                <span className={`status-badge ${accountant.status}`} id={`accountant-status-${accountant.id}`}>
                                    {accountant.status.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="accountant-details" id={`accountant-details-${accountant.id}`}>
                                <div className="detail-item" id={`detail-counter-${accountant.id}`}>
                                    <span className="label" id={`label-counter-${accountant.id}`}>Assigned Counter:</span>
                                    <span className="value" id={`value-counter-${accountant.id}`}>{accountant.assigned_counter}</span>
                                </div>
                                <div className="detail-item" id={`detail-transactions-${accountant.id}`}>
                                    <span className="label" id={`label-transactions-${accountant.id}`}>Total Transactions:</span>
                                    <span className="value" id={`value-transactions-${accountant.id}`}>{accountant.total_transactions}</span>
                                </div>
                                <div className="detail-item" id={`detail-last-login-${accountant.id}`}>
                                    <span className="label" id={`label-last-login-${accountant.id}`}>Last Login:</span>
                                    <span className="value" id={`value-last-login-${accountant.id}`}>{formatDate(accountant.last_login)}</span>
                                </div>
                            </div>
                            <div className="accountant-actions" id={`accountant-actions-${accountant.id}`}>
                                <button className="action-btn" id={`edit-accountant-${accountant.id}`} aria-label={`Edit ${accountant.name}`}>
                                    <FiEdit2 id={`edit-accountant-icon-${accountant.id}`} /> Edit
                                </button>
                                <button className="action-btn" id={`view-accountant-${accountant.id}`} aria-label={`View ${accountant.name}`}>
                                    <FiEye id={`view-accountant-icon-${accountant.id}`} /> View
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // PaymentsOverview Component
    const PaymentsOverview = () => {
        const [payments, setPayments] = useState([]);
        const [filter, setFilter] = useState('all');
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchPayments();
        }, []);

        const fetchPayments = async () => {
            try {
                // Mock data
                const mockPayments = Array.from({ length: 50 }, (_, i) => ({
                    id: i + 1,
                    student_name: `Student ${i + 1}`,
                    roll_number: `ROLL${String(i + 1).padStart(4, '0')}`,
                    amount: Math.floor(Math.random() * 50000) + 5000,
                    fee_type: ['Tuition', 'Hostel', 'Exam', 'Library', 'Other'][Math.floor(Math.random() * 5)],
                    counter: `Counter ${(i % 5) + 1}`,
                    status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
                    date: new Date(Date.now() - Math.random() * 604800000).toISOString(),
                    token: `TKN${String(i + 1).padStart(6, '0')}`
                }));
                setPayments(mockPayments);
            } catch (error) {
                console.error('Error fetching payments:', error);
            } finally {
                setLoading(false);
            }
        };

        const filteredPayments = payments.filter(payment => {
            if (filter === 'all') return true;
            return payment.status === filter;
        });

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0
            }).format(amount);
        };

        const formatDate = (dateString) => {
            return new Date(dateString).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        if (loading) {
            return <div className="loading" id="payments-loading">Loading payments...</div>;
        }

        return (
            <div className="payments-overview" id="payments-overview">
                <div className="section-header" id="payments-header">
                    <h2 id="payments-title">Payments Overview</h2>
                    <div className="filter-tabs" id="payments-filter-tabs">
                        <button 
                            className={`tab-btn ${filter === 'all' ? 'active' : ''}`}
                            id="filter-all"
                            onClick={() => setFilter('all')}
                            aria-label="Show all payments"
                        >
                            All Payments
                        </button>
                        <button 
                            className={`tab-btn ${filter === 'completed' ? 'active' : ''}`}
                            id="filter-completed"
                            onClick={() => setFilter('completed')}
                            aria-label="Show completed payments"
                        >
                            Completed
                        </button>
                        <button 
                            className={`tab-btn ${filter === 'pending' ? 'active' : ''}`}
                            id="filter-pending"
                            onClick={() => setFilter('pending')}
                            aria-label="Show pending payments"
                        >
                            Pending
                        </button>
                        <button 
                            className={`tab-btn ${filter === 'failed' ? 'active' : ''}`}
                            id="filter-failed"
                            onClick={() => setFilter('failed')}
                            aria-label="Show failed payments"
                        >
                            Failed
                        </button>
                    </div>
                </div>

                <div className="payments-table" id="payments-table">
                    <table id="payments-table-content">
                        <thead id="payments-table-header">
                            <tr id="payments-table-header-row">
                                <th id="header-token">Token</th>
                                <th id="header-student">Student</th>
                                <th id="header-amount">Amount</th>
                                <th id="header-fee-type">Fee Type</th>
                                <th id="header-counter">Counter</th>
                                <th id="header-status">Status</th>
                                <th id="header-date">Date & Time</th>
                                <th id="header-payment-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="payments-table-body">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} id={`payment-row-${payment.id}`} className="payment-row" data-payment-id={payment.id}>
                                    <td id={`payment-token-${payment.id}`}>
                                        <span className="token-badge" id={`token-badge-${payment.id}`}>{payment.token}</span>
                                    </td>
                                    <td id={`payment-student-${payment.id}`}>
                                        <div className="student-info" id={`payment-student-info-${payment.id}`}>
                                            <div className="student-name" id={`payment-student-name-${payment.id}`}>{payment.student_name}</div>
                                            <div className="student-roll" id={`payment-student-roll-${payment.id}`}>{payment.roll_number}</div>
                                        </div>
                                    </td>
                                    <td className="amount" id={`payment-amount-${payment.id}`}>{formatCurrency(payment.amount)}</td>
                                    <td id={`payment-fee-type-${payment.id}`}>{payment.fee_type}</td>
                                    <td id={`payment-counter-${payment.id}`}>{payment.counter}</td>
                                    <td id={`payment-status-cell-${payment.id}`}>
                                        <span className={`status-badge ${payment.status}`} id={`payment-status-${payment.id}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td id={`payment-date-${payment.id}`}>{formatDate(payment.date)}</td>
                                    <td id={`payment-actions-${payment.id}`}>
                                        <button className="action-btn" id={`view-payment-${payment.id}`} aria-label={`View payment ${payment.token}`}>
                                            <FiEye id={`view-payment-icon-${payment.id}`} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // CounterManagement Component
    const CounterManagement = () => {
        const [counters, setCounters] = useState([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchCounters();
        }, []);

        const fetchCounters = async () => {
            try {
                // Mock data
                const mockCounters = Array.from({ length: 10 }, (_, i) => ({
                    id: i + 1,
                    counter_number: `C${String(i + 1).padStart(3, '0')}`,
                    counter_name: `Counter ${i + 1}`,
                    status: i < 8 ? 'active' : 'inactive',
                    current_queue: Math.floor(Math.random() * 20),
                    assigned_accountant: i < 8 ? `Accountant ${(i % 5) + 1}` : 'Not Assigned',
                    fee_types: ['Tuition', 'Hostel', 'Exam'].slice(0, Math.floor(Math.random() * 3) + 1),
                    last_active: new Date(Date.now() - Math.random() * 3600000).toISOString()
                }));
                setCounters(mockCounters);
            } catch (error) {
                console.error('Error fetching counters:', error);
            } finally {
                setLoading(false);
            }
        };

        const handleToggleStatus = (id) => {
            setCounters(counters.map(counter => 
                counter.id === id 
                    ? { ...counter, status: counter.status === 'active' ? 'inactive' : 'active' }
                    : counter
            ));
        };

        if (loading) {
            return <div className="loading" id="counters-loading">Loading counters...</div>;
        }

        return (
            <div className="counter-management" id="counter-management">
                <div className="section-header" id="counters-header">
                    <h2 id="counters-title">Counter Management</h2>
                    <button className="add-btn" id="add-counter-btn" aria-label="Add new counter">
                        <FiPlus id="add-counter-icon" /> Add Counter
                    </button>
                </div>

                <div className="counters-grid" id="counters-grid">
                    {counters.map((counter) => (
                        <div key={counter.id} className="counter-card" id={`counter-card-${counter.id}`} data-counter-id={counter.id}>
                            <div className="counter-header" id={`counter-header-${counter.id}`}>
                                <div className="counter-info" id={`counter-info-${counter.id}`}>
                                    <h3 id={`counter-name-${counter.id}`}>{counter.counter_name}</h3>
                                    <span className="counter-number" id={`counter-number-${counter.id}`}>{counter.counter_number}</span>
                                </div>
                                <div className={`status-indicator ${counter.status}`} id={`counter-status-${counter.id}`}>
                                    {counter.status === 'active' ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                            <div className="counter-details" id={`counter-details-${counter.id}`}>
                                <div className="detail-item" id={`detail-queue-${counter.id}`}>
                                    <span className="label" id={`label-queue-${counter.id}`}>Current Queue:</span>
                                    <span className="value queue" id={`value-queue-${counter.id}`}>{counter.current_queue} people</span>
                                </div>
                                <div className="detail-item" id={`detail-accountant-${counter.id}`}>
                                    <span className="label" id={`label-accountant-${counter.id}`}>Assigned Accountant:</span>
                                    <span className="value" id={`value-accountant-${counter.id}`}>{counter.assigned_accountant}</span>
                                </div>
                                <div className="detail-item" id={`detail-fee-types-${counter.id}`}>
                                    <span className="label" id={`label-fee-types-${counter.id}`}>Fee Types:</span>
                                    <div className="fee-tags" id={`fee-tags-${counter.id}`}>
                                        {counter.fee_types.map((type, idx) => (
                                            <span key={idx} className="fee-tag" id={`fee-tag-${counter.id}-${idx}`}>{type}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="counter-actions" id={`counter-actions-${counter.id}`}>
                                <button 
                                    className={`toggle-btn ${counter.status === 'active' ? 'deactivate' : 'activate'}`}
                                    id={`toggle-counter-${counter.id}`}
                                    onClick={() => handleToggleStatus(counter.id)}
                                    aria-label={`${counter.status === 'active' ? 'Deactivate' : 'Activate'} counter ${counter.counter_number}`}
                                >
                                    {counter.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>
                                <button className="edit-btn" id={`edit-counter-${counter.id}`} aria-label={`Edit counter ${counter.counter_number}`}>
                                    <FiEdit2 id={`edit-counter-icon-${counter.id}`} /> Edit
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // ReportsAnalytics Component
    const ReportsAnalytics = () => {
        const [reportType, setReportType] = useState('daily');
        const [startDate, setStartDate] = useState('');
        const [endDate, setEndDate] = useState('');
        const [generating, setGenerating] = useState(false);

        const handleGenerateReport = async () => {
            setGenerating(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 2000));
                toast.success('Report generated successfully!');
                // In real app, this would download the report
            } catch (error) {
                toast.error('Failed to generate report');
            } finally {
                setGenerating(false);
            }
        };

        return (
            <div className="reports-analytics" id="reports-analytics">
                <div className="section-header" id="reports-header">
                    <h2 id="reports-title">Reports & Analytics</h2>
                </div>

                <div className="report-options" id="report-options">
                    <div className="option-card" id="generate-report-card">
                        <h3 id="generate-report-title">Generate Report</h3>
                        <div className="form-group" id="form-group-report-type">
                            <label htmlFor="report-type-select">Report Type</label>
                            <select 
                                id="report-type-select"
                                value={reportType} 
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option value="daily" id="option-daily">Daily Report</option>
                                <option value="weekly" id="option-weekly">Weekly Report</option>
                                <option value="monthly" id="option-monthly">Monthly Report</option>
                                <option value="custom" id="option-custom">Custom Period</option>
                            </select>
                        </div>
                        {reportType === 'custom' && (
                            <div className="date-range" id="date-range">
                                <div className="form-group" id="form-group-start-date">
                                    <label htmlFor="start-date">Start Date</label>
                                    <input 
                                        type="date" 
                                        id="start-date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                    />
                                </div>
                                <div className="form-group" id="form-group-end-date">
                                    <label htmlFor="end-date">End Date</label>
                                    <input 
                                        type="date" 
                                        id="end-date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                        <div className="form-group" id="form-group-format">
                            <label htmlFor="format-select">Format</label>
                            <select id="format-select" defaultValue="pdf">
                                <option value="pdf" id="option-pdf">PDF</option>
                                <option value="excel" id="option-excel">Excel</option>
                                <option value="csv" id="option-csv">CSV</option>
                            </select>
                        </div>
                        <button 
                            className="generate-btn"
                            id="generate-report-btn"
                            onClick={handleGenerateReport}
                            disabled={generating}
                            aria-label="Generate report"
                        >
                            {generating ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>

                    <div className="option-card" id="quick-reports-card">
                        <h3 id="quick-reports-title">Quick Reports</h3>
                        <div className="quick-reports" id="quick-reports-list">
                            <button className="report-btn" id="report-today" aria-label="Download today's transactions report">
                                <FiDownload id="report-icon-today" /> Today's Transactions
                            </button>
                            <button className="report-btn" id="report-monthly" aria-label="Download monthly revenue report">
                                <FiDownload id="report-icon-monthly" /> Monthly Revenue
                            </button>
                            <button className="report-btn" id="report-student-payments" aria-label="Download student payments report">
                                <FiDownload id="report-icon-student-payments" /> Student Payments
                            </button>
                            <button className="report-btn" id="report-counter-performance" aria-label="Download counter performance report">
                                <FiDownload id="report-icon-counter-performance" /> Counter Performance
                            </button>
                        </div>
                    </div>
                </div>

                <div className="analytics-section" id="analytics-section">
                    <h3 id="analytics-title">Analytics Overview</h3>
                    <div className="charts-placeholder" id="charts-placeholder">
                        <div className="chart" id="chart-revenue">
                            <h4 id="chart-revenue-title">Revenue Trends</h4>
                            <p id="chart-revenue-placeholder">Chart would display here</p>
                        </div>
                        <div className="chart" id="chart-status">
                            <h4 id="chart-status-title">Payment Status Distribution</h4>
                            <p id="chart-status-placeholder">Chart would display here</p>
                        </div>
                        <div className="chart" id="chart-performance">
                            <h4 id="chart-performance-title">Counter Performance</h4>
                            <p id="chart-performance-placeholder">Chart would display here</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // SystemSettings Component
    const SystemSettings = () => {
        const [settings, setSettings] = useState({
            system_name: 'College Fee Management System',
            currency: 'INR',
            auto_logout: 30,
            max_queue_size: 50,
            enable_email_notifications: true,
            maintenance_mode: false,
            receipt_prefix: 'CFMS'
        });

        const [saving, setSaving] = useState(false);

        const handleSaveSettings = async () => {
            setSaving(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 1000));
                toast.success('Settings saved successfully!');
            } catch (error) {
                toast.error('Failed to save settings');
            } finally {
                setSaving(false);
            }
        };

        return (
            <div className="system-settings" id="system-settings">
                <div className="section-header" id="settings-header">
                    <h2 id="settings-title">System Settings</h2>
                </div>

                <div className="settings-form" id="settings-form">
                    <div className="settings-section" id="general-settings">
                        <h3 id="general-settings-title">General Settings</h3>
                        <div className="form-grid" id="general-settings-form">
                            <div className="form-group" id="form-group-system-name">
                                <label htmlFor="system-name-input">System Name</label>
                                <input 
                                    type="text" 
                                    id="system-name-input"
                                    value={settings.system_name}
                                    onChange={(e) => setSettings({...settings, system_name: e.target.value})}
                                />
                            </div>
                            <div className="form-group" id="form-group-currency">
                                <label htmlFor="currency-select">Currency</label>
                                <select 
                                    id="currency-select"
                                    value={settings.currency}
                                    onChange={(e) => setSettings({...settings, currency: e.target.value})}
                                >
                                    <option value="INR" id="currency-inr">Indian Rupee (₹)</option>
                                    <option value="USD" id="currency-usd">US Dollar ($)</option>
                                    <option value="EUR" id="currency-eur">Euro (€)</option>
                                </select>
                            </div>
                            <div className="form-group" id="form-group-auto-logout">
                                <label htmlFor="auto-logout-input">Auto Logout (minutes)</label>
                                <input 
                                    type="number" 
                                    id="auto-logout-input"
                                    min="1"
                                    max="120"
                                    value={settings.auto_logout}
                                    onChange={(e) => setSettings({...settings, auto_logout: parseInt(e.target.value) || 30})}
                                />
                            </div>
                            <div className="form-group" id="form-group-max-queue">
                                <label htmlFor="max-queue-input">Max Queue Size</label>
                                <input 
                                    type="number" 
                                    id="max-queue-input"
                                    min="10"
                                    max="100"
                                    value={settings.max_queue_size}
                                    onChange={(e) => setSettings({...settings, max_queue_size: parseInt(e.target.value) || 50})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="settings-section" id="notification-settings">
                        <h3 id="notification-settings-title">Notification Settings</h3>
                        <div className="toggle-group" id="toggle-group">
                            <div className="toggle-item" id="toggle-email">
                                <label htmlFor="email-notifications-toggle">Email Notifications</label>
                                <div className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        id="email-notifications-toggle"
                                        checked={settings.enable_email_notifications}
                                        onChange={(e) => setSettings({...settings, enable_email_notifications: e.target.checked})}
                                    />
                                    <label htmlFor="email-notifications-toggle" className="toggle-label" id="toggle-label-email"></label>
                                </div>
                            </div>
                            <div className="toggle-item" id="toggle-maintenance">
                                <label htmlFor="maintenance-mode-toggle">Maintenance Mode</label>
                                <div className="toggle-switch">
                                    <input 
                                        type="checkbox" 
                                        id="maintenance-mode-toggle"
                                        checked={settings.maintenance_mode}
                                        onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked})}
                                    />
                                    <label htmlFor="maintenance-mode-toggle" className="toggle-label" id="toggle-label-maintenance"></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section" id="receipt-settings">
                        <h3 id="receipt-settings-title">Receipt Settings</h3>
                        <div className="form-group" id="form-group-receipt-prefix">
                            <label htmlFor="receipt-prefix-input">Receipt Prefix</label>
                            <input 
                                type="text" 
                                id="receipt-prefix-input"
                                value={settings.receipt_prefix}
                                onChange={(e) => setSettings({...settings, receipt_prefix: e.target.value})}
                                maxLength="10"
                            />
                        </div>
                    </div>

                    <div className="settings-actions" id="settings-actions">
                        <button className="btn-secondary" id="reset-settings-btn">
                            Reset to Default
                        </button>
                        <button 
                            className="btn-primary"
                            id="save-settings-btn"
                            onClick={handleSaveSettings}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ============ MAIN RENDER ============
    if (loading) {
        return (
            <div className="loading-container" id="admin-loading-container">
                <div className="spinner" id="admin-spinner"></div>
                <p id="admin-loading-text">Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard" id="admin-dashboard">
            <AdminSidebar
                adminData={adminData}
                activeMenu={activeMenu}
                onMenuClick={handleMenuClick}
                onLogout={handleLogout}
            />
            <DashboardContent
                activeMenu={activeMenu}
                adminData={adminData}
            />
        </div>
    );
};

export default AdminDashboard;