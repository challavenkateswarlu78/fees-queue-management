// StudentDashboard.js - Single File Version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    FiHome, FiDollarSign, FiClock, FiUser, FiLogOut, FiBook, 
    FiBriefcase, FiMail, FiPhone, FiLock, FiSave, FiCheckCircle, 
    FiAlertCircle, FiCheck, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './styles/StudentDashboard.css';

// Main StudentDashboard Component
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

    // ==============================
    // StudentSidebar Component
    // ==============================
    const StudentSidebar = ({ studentData, activeMenu, onMenuClick, onLogout }) => {
        const getInitial = (name) => {
            return name ? name.charAt(0).toUpperCase() : 'S';
        };

        const menuItems = [
            { id: 'dashboard', label: 'Dashboard', icon: <FiHome /> },
            { id: 'fees-payment', label: 'Fees Payment', icon: <FiDollarSign /> },
            { id: 'queue-status', label: 'Queue Status', icon: <FiClock /> },
            { id: 'update-profile', label: 'Update Profile', icon: <FiUser /> },
        ];

        return (
            <div className="student-sidebar">
                {/* Profile Section */}
                <div className="sidebar-profile">
                    <div className="profile-image">
                        {studentData?.photoUrl ? (
                            <img src={studentData.photoUrl} alt={studentData.name} className="profile-photo" />
                        ) : (
                            <div className="profile-avatar">
                                {getInitial(studentData?.name)}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <h3 className="student-name">{studentData?.name}</h3>
                        <p className="roll-number">{studentData?.rollNumber}</p>
                    </div>
                </div>

                {/* Student Details */}
                <div className="student-details">
                    <div className="detail-item">
                        <FiBook className="detail-icon" />
                        <div>
                            <span className="detail-label">Year</span>
                            <span className="detail-value">{studentData?.year}</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <FiBriefcase className="detail-icon" />
                        <div>
                            <span className="detail-label">Branch</span>
                            <span className="detail-value">{studentData?.branch}</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <FiMail className="detail-icon" />
                        <div>
                            <span className="detail-label">Email</span>
                            <span className="detail-value email">{studentData?.email}</span>
                        </div>
                    </div>
                    <div className="detail-item">
                        <FiPhone className="detail-icon" />
                        <div>
                            <span className="detail-label">Phone</span>
                            <span className="detail-value">{studentData?.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => onMenuClick(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={onLogout}>
                        <FiLogOut className="logout-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        );
    };

    // ==============================
    // DashboardHome Component
    // ==============================
    const DashboardHome = ({ studentData }) => {
        const [dashboardStats, setDashboardStats] = useState({
            totalDue: 0,
            paidAmount: 0,
            pendingAmount: 0,
            queuePosition: 0,
            recentPayments: []
        });
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            fetchDashboardStats();
        }, []);

        const fetchDashboardStats = async () => {
            try {
                // Mock data - replace with actual API call
                const stats = {
                    totalDue: 50000,
                    paidAmount: 25000,
                    pendingAmount: 25000,
                    queuePosition: 3,
                    recentPayments: [
                        { id: 1, date: '2024-01-15', amount: 10000, status: 'completed', type: 'Tuition Fee' },
                        { id: 2, date: '2024-01-20', amount: 15000, status: 'completed', type: 'Hostel Fee' },
                        { id: 3, date: '2024-02-01', amount: 25000, status: 'pending', type: 'Semester Fee' }
                    ]
                };
                setDashboardStats(stats);
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0
            }).format(amount);
        };

        if (loading) {
            return <div className="loading">Loading dashboard...</div>;
        }

        return (
            <div className="dashboard-home">
                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon total-due">
                            <FiDollarSign />
                        </div>
                        <div className="stat-content">
                            <h3>Total Due</h3>
                            <p className="stat-value">{formatCurrency(dashboardStats.totalDue)}</p>
                            <p className="stat-subtitle">Current academic year</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon paid">
                            <FiCheckCircle />
                        </div>
                        <div className="stat-content">
                            <h3>Amount Paid</h3>
                            <p className="stat-value">{formatCurrency(dashboardStats.paidAmount)}</p>
                            <p className="stat-subtitle">Successfully processed</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <FiAlertCircle />
                        </div>
                        <div className="stat-content">
                            <h3>Pending Amount</h3>
                            <p className="stat-value">{formatCurrency(dashboardStats.pendingAmount)}</p>
                            <p className="stat-subtitle">Awaiting payment</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon queue">
                            <FiClock />
                        </div>
                        <div className="stat-content">
                            <h3>Queue Position</h3>
                            <p className="stat-value">#{dashboardStats.queuePosition}</p>
                            <p className="stat-subtitle">In processing queue</p>
                        </div>
                    </div>
                </div>

                {/* Student Information Card */}
                <div className="info-card">
                    <h2 className="card-title">Student Information</h2>
                    <div className="info-grid">
                        <div className="info-item">
                            <label>Full Name</label>
                            <p>{studentData?.name}</p>
                        </div>
                        <div className="info-item">
                            <label>Roll Number</label>
                            <p>{studentData?.rollNumber}</p>
                        </div>
                        <div className="info-item">
                            <label>Email Address</label>
                            <p>{studentData?.email}</p>
                        </div>
                        <div className="info-item">
                            <label>Phone Number</label>
                            <p>{studentData?.phone}</p>
                        </div>
                        <div className="info-item">
                            <label>Year</label>
                            <p>Year {studentData?.year}</p>
                        </div>
                        <div className="info-item">
                            <label>Branch</label>
                            <p>{studentData?.branch}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Payments */}
                <div className="payments-card">
                    <h2 className="card-title">Recent Payments</h2>
                    {dashboardStats.recentPayments.length > 0 ? (
                        <div className="payments-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboardStats.recentPayments.map(payment => (
                                        <tr key={payment.id}>
                                            <td>{payment.date}</td>
                                            <td>{payment.type}</td>
                                            <td>{formatCurrency(payment.amount)}</td>
                                            <td>
                                                <span className={`status-badge ${payment.status}`}>
                                                    {payment.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data">No recent payments found.</p>
                    )}
                </div>
            </div>
        );
    };

    // ==============================
    // FeesPayment Component
    // ==============================
    const FeesPayment = ({ studentData }) => {
        const [formData, setFormData] = useState({
            counterId: '',
            feeTypeId: '',
            amount: '',
            description: ''
        });
        const [counters, setCounters] = useState([]);
        const [feeTypes, setFeeTypes] = useState([]);
        const [loading, setLoading] = useState(false);
        const [generatedToken, setGeneratedToken] = useState(null);
        const [paymentSuccess, setPaymentSuccess] = useState(false);

        useEffect(() => {
            fetchPaymentOptions();
        }, []);

        const fetchPaymentOptions = async () => {
            try {
                // Mock data - replace with API call
                const mockCounters = [
                    { id: 1, counter_name: 'Counter 1', counter_number: 'C001' },
                    { id: 2, counter_name: 'Counter 2', counter_number: 'C002' },
                    { id: 3, counter_name: 'Counter 3', counter_number: 'C003' }
                ];

                const mockFeeTypes = [
                    { id: 1, type_name: 'Tuition Fee' },
                    { id: 2, type_name: 'Exam Fee' },
                    { id: 3, type_name: 'Hostel Fee' },
                    { id: 4, type_name: 'Library Fee' },
                    { id: 5, type_name: 'Other' }
                ];

                setCounters(mockCounters);
                setFeeTypes(mockFeeTypes);
            } catch (error) {
                console.error('Error fetching payment options:', error);
                toast.error('Failed to load payment options');
            }
        };

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        };

        const generateToken = () => {
            const timestamp = Date.now();
            const randomNum = Math.floor(Math.random() * 1000);
            return `TKN${timestamp.toString().slice(-6)}${randomNum.toString().padStart(3, '0')}`;
        };

        const validateForm = () => {
            if (!formData.counterId) {
                toast.error('Please select a counter');
                return false;
            }
            if (!formData.feeTypeId) {
                toast.error('Please select a fee type');
                return false;
            }
            if (!formData.amount || formData.amount <= 0) {
                toast.error('Please enter a valid amount');
                return false;
            }
            return true;
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!validateForm()) return;

            setLoading(true);
            try {
                const tokenNumber = generateToken();
                
                // Create payment data
                const paymentData = {
                    studentId: studentData.id,
                    counterId: formData.counterId,
                    feeTypeId: formData.feeTypeId,
                    amount: parseFloat(formData.amount),
                    description: formData.description,
                    tokenNumber
                };

                // Mock API call
                console.log('Submitting payment:', paymentData);
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1500));

                setGeneratedToken(tokenNumber);
                setPaymentSuccess(true);
                toast.success('Payment request submitted successfully!');
                
                // Reset form
                setFormData({
                    counterId: '',
                    feeTypeId: '',
                    amount: '',
                    description: ''
                });

                // Auto-clear success message after 5 seconds
                setTimeout(() => {
                    setPaymentSuccess(false);
                    setGeneratedToken(null);
                }, 5000);

            } catch (error) {
                console.error('Payment submission error:', error);
                toast.error('Failed to submit payment request');
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="fees-payment">
                <div className="payment-header">
                    <h2>New Payment Request</h2>
                    <p>Submit a new fee payment request and get your queue token</p>
                </div>

                {paymentSuccess && generatedToken && (
                    <div className="success-message">
                        <div className="success-icon">
                            <FiCheck />
                        </div>
                        <div className="success-content">
                            <h3>Payment Request Submitted!</h3>
                            <p className="token-display">Your Token: <strong>{generatedToken}</strong></p>
                            <p className="success-note">
                                Please note your token number. You can track your payment status in the Queue Status section.
                            </p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="payment-form">
                    <div className="form-group">
                        <label htmlFor="counterId">Select Counter *</label>
                        <select
                            id="counterId"
                            name="counterId"
                            value={formData.counterId}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Select Counter --</option>
                            {counters.map(counter => (
                                <option key={counter.id} value={counter.id}>
                                    {counter.counter_name} ({counter.counter_number})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="feeTypeId">Fee Type *</label>
                        <select
                            id="feeTypeId"
                            name="feeTypeId"
                            value={formData.feeTypeId}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Select Fee Type --</option>
                            {feeTypes.map(type => (
                                <option key={type.id} value={type.id}>
                                    {type.type_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Amount (₹) *</label>
                        <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="Enter amount"
                            min="1"
                            step="0.01"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description (Optional)</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Any additional information..."
                            rows="3"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <FiDollarSign />
                                    Submit Payment Request
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="payment-instructions">
                    <h3>Payment Instructions</h3>
                    <ul>
                        <li>Select the appropriate counter for payment processing</li>
                        <li>Choose the correct fee type from the dropdown</li>
                        <li>Enter the exact amount to be paid</li>
                        <li>You will receive a unique token number upon submission</li>
                        <li>Keep your token number safe for tracking purposes</li>
                        <li>Payment processing typically takes 15-30 minutes</li>
                    </ul>
                </div>
            </div>
        );
    };

    // ==============================
    // QueueStatus Component
    // ==============================
    const QueueStatus = ({ studentData }) => {
        const [payments, setPayments] = useState([]);
        const [loading, setLoading] = useState(true);
        const [refreshing, setRefreshing] = useState(false);

        useEffect(() => {
            fetchQueueStatus();
            // Set up auto-refresh every 30 seconds
            const interval = setInterval(fetchQueueStatus, 30000);
            return () => clearInterval(interval);
        }, []);

        const fetchQueueStatus = async () => {
            try {
                setRefreshing(true);
                
                // Mock data - replace with actual API call
                const mockPayments = [
                    {
                        id: 1,
                        token_number: 'TKN' + Date.now().toString().slice(-6),
                        counter_name: 'Counter 1',
                        fee_type_name: 'Tuition Fee',
                        amount: 15000,
                        status: 'processing',
                        queue_position: 3,
                        transaction_date: new Date().toISOString(),
                        estimated_time: '15 minutes'
                    },
                    {
                        id: 2,
                        token_number: 'TKN' + (Date.now() - 86400000).toString().slice(-6),
                        counter_name: 'Counter 2',
                        fee_type_name: 'Hostel Fee',
                        amount: 12000,
                        status: 'pending',
                        queue_position: 8,
                        transaction_date: new Date(Date.now() - 86400000).toISOString(),
                        estimated_time: '40 minutes'
                    }
                ];

                setPayments(mockPayments);
            } catch (error) {
                console.error('Error fetching queue status:', error);
                toast.error('Failed to load queue status');
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        };

        const getStatusIcon = (status) => {
            switch (status) {
                case 'completed': return <FiCheckCircle className="status-icon completed" />;
                case 'processing': return <FiRefreshCw className="status-icon processing" />;
                case 'pending': return <FiClock className="status-icon pending" />;
                default: return <FiAlertCircle className="status-icon" />;
            }
        };

        const getStatusClass = (status) => {
            return `status-${status}`;
        };

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }) + ' ' + date.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 0
            }).format(amount);
        };

        if (loading) {
            return (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading queue status...</p>
                </div>
            );
        }

        return (
            <div className="queue-status">
                <div className="queue-header">
                    <div className="header-left">
                        <h2>Payment Queue Status</h2>
                        <p>Track your payment requests in real-time</p>
                    </div>
                    <button 
                        className="refresh-btn"
                        onClick={fetchQueueStatus}
                        disabled={refreshing}
                    >
                        <FiRefreshCw className={refreshing ? 'spinning' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {payments.length === 0 ? (
                    <div className="empty-state">
                        <FiClock className="empty-icon" />
                        <h3>No Payment Requests</h3>
                        <p>You haven't made any payment requests yet.</p>
                        <p>Go to "Fees Payment" to submit a new request.</p>
                    </div>
                ) : (
                    <div className="payments-list">
                        {payments.map((payment) => (
                            <div key={payment.id} className="payment-card">
                                <div className="payment-header">
                                    <div className="token-info">
                                        <h3>Token: {payment.token_number}</h3>
                                        <span className="fee-type">{payment.fee_type_name}</span>
                                    </div>
                                    <div className={`status-badge ${getStatusClass(payment.status)}`}>
                                        {getStatusIcon(payment.status)}
                                        <span>{payment.status.toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="payment-details">
                                    <div className="detail-row">
                                        <div className="detail-item">
                                            <span className="detail-label">Counter</span>
                                            <span className="detail-value">{payment.counter_name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Amount</span>
                                            <span className="detail-value">{formatCurrency(payment.amount)}</span>
                                        </div>
                                    </div>

                                    <div className="detail-row">
                                        <div className="detail-item">
                                            <span className="detail-label">Request Date</span>
                                            <span className="detail-value">{formatDate(payment.transaction_date)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Queue Position</span>
                                            <span className="detail-value queue-pos">#{payment.queue_position}</span>
                                        </div>
                                    </div>

                                    {payment.estimated_time && (
                                        <div className="estimated-time">
                                            <FiClock className="time-icon" />
                                            <span>Estimated wait: <strong>{payment.estimated_time}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="legend-section">
                    <h4>Status Legend</h4>
                    <div className="legend-items">
                        <div className="legend-item">
                            <div className="legend-dot pending"></div>
                            <span>Pending - Waiting in queue</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot processing"></div>
                            <span>Processing - Currently being processed</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-dot completed"></div>
                            <span>Completed - Payment successful</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==============================
    // UpdateProfile Component
    // ==============================
    const UpdateProfile = ({ studentData, onUpdate }) => {
        const [formData, setFormData] = useState({
            full_name: studentData?.name || '',
            email: studentData?.email || '',
            phone: studentData?.phone || '',
            year: studentData?.year || '',
            branch: studentData?.branch || '',
            current_password: '',
            new_password: '',
            confirm_password: ''
        });
        const [errors, setErrors] = useState({});
        const [updating, setUpdating] = useState(false);

        const validateForm = () => {
            const newErrors = {};

            // Basic validation
            if (!formData.full_name.trim()) {
                newErrors.full_name = 'Full name is required';
            }

            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = 'Email is invalid';
            }

            if (!formData.phone.trim()) {
                newErrors.phone = 'Phone number is required';
            } else if (!/^\d{10}$/.test(formData.phone)) {
                newErrors.phone = 'Phone must be 10 digits';
            }

            if (!formData.year) {
                newErrors.year = 'Year is required';
            }

            if (!formData.branch.trim()) {
                newErrors.branch = 'Branch is required';
            }

            // Password validation (only if changing password)
            if (formData.current_password || formData.new_password || formData.confirm_password) {
                if (!formData.current_password) {
                    newErrors.current_password = 'Current password is required';
                }
                if (!formData.new_password) {
                    newErrors.new_password = 'New password is required';
                } else if (formData.new_password.length < 6) {
                    newErrors.new_password = 'Password must be at least 6 characters';
                }
                if (formData.new_password !== formData.confirm_password) {
                    newErrors.confirm_password = 'Passwords do not match';
                }
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        };

        const handleInputChange = (e) => {
            const { name, value } = e.target;
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
            // Clear error when user types
            if (errors[name]) {
                setErrors(prev => ({ ...prev, [name]: '' }));
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            setUpdating(true);
            try {
                // Prepare update data
                const updateData = {
                    full_name: formData.full_name,
                    email: formData.email,
                    phone: formData.phone,
                    year: formData.year,
                    branch: formData.branch
                };

                // Add password data only if changing password
                if (formData.current_password && formData.new_password) {
                    updateData.current_password = formData.current_password;
                    updateData.new_password = formData.new_password;
                }

                // Mock API call - replace with actual API
                console.log('Updating profile:', updateData);
                await new Promise(resolve => setTimeout(resolve, 1500));

                toast.success('Profile updated successfully!');
                
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));

                // Notify parent to refresh data
                if (onUpdate) {
                    onUpdate();
                }

            } catch (error) {
                console.error('Error updating profile:', error);
                toast.error(error.message || 'Failed to update profile');
            } finally {
                setUpdating(false);
            }
        };

        return (
            <div className="update-profile">
                <div className="profile-header">
                    <h2>Update Your Profile</h2>
                    <p>Keep your information up to date</p>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    {/* Personal Information */}
                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="full_name">
                                    <FiUser /> Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
                                {errors.full_name && <span className="error">{errors.full_name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    <FiMail /> Email Address *
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Enter your email"
                                />
                                {errors.email && <span className="error">{errors.email}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="phone">
                                    <FiPhone /> Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Enter 10-digit phone"
                                    maxLength="10"
                                />
                                {errors.phone && <span className="error">{errors.phone}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="year">Year *</label>
                                <select
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Year</option>
                                    {[1, 2, 3, 4, 5].map(year => (
                                        <option key={year} value={year}>Year {year}</option>
                                    ))}
                                </select>
                                {errors.year && <span className="error">{errors.year}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="branch">Branch *</label>
                                <input
                                    type="text"
                                    id="branch"
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleInputChange}
                                    placeholder="Enter your branch"
                                />
                                {errors.branch && <span className="error">{errors.branch}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Change Password Section */}
                    <div className="form-section">
                        <h3>Change Password</h3>
                        <p className="section-note">Leave blank if you don't want to change password</p>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="current_password">
                                    <FiLock /> Current Password
                                </label>
                                <input
                                    type="password"
                                    id="current_password"
                                    name="current_password"
                                    value={formData.current_password}
                                    onChange={handleInputChange}
                                    placeholder="Enter current password"
                                />
                                {errors.current_password && <span className="error">{errors.current_password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="new_password">
                                    <FiLock /> New Password
                                </label>
                                <input
                                    type="password"
                                    id="new_password"
                                    name="new_password"
                                    value={formData.new_password}
                                    onChange={handleInputChange}
                                    placeholder="Enter new password (min 6 chars)"
                                />
                                {errors.new_password && <span className="error">{errors.new_password}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirm_password">
                                    <FiLock /> Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirm_password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleInputChange}
                                    placeholder="Confirm new password"
                                />
                                {errors.confirm_password && <span className="error">{errors.confirm_password}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="save-btn"
                            disabled={updating}
                        >
                            {updating ? (
                                <>
                                    <span className="spinner"></span>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FiSave />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        );
    };

    // ==============================
    // DashboardContent Component
    // ==============================
    const DashboardContent = ({ activeMenu, studentData, onProfileUpdate }) => {
        const getPageTitle = () => {
            switch (activeMenu) {
                case 'dashboard': return 'Dashboard Overview';
                case 'fees-payment': return 'Fees Payment';
                case 'queue-status': return 'Queue Status';
                case 'update-profile': return 'Update Profile';
                default: return 'Dashboard';
            }
        };

        const getPageDescription = () => {
            switch (activeMenu) {
                case 'dashboard': return 'Welcome to your student dashboard';
                case 'fees-payment': return 'Submit new fee payment requests';
                case 'queue-status': return 'Track your payment queue status';
                case 'update-profile': return 'Update your personal information';
                default: return '';
            }
        };

        const renderContent = () => {
            switch (activeMenu) {
                case 'dashboard':
                    return <DashboardHome studentData={studentData} />;
                case 'fees-payment':
                    return <FeesPayment studentData={studentData} />;
                case 'queue-status':
                    return <QueueStatus studentData={studentData} />;
                case 'update-profile':
                    return <UpdateProfile studentData={studentData} onUpdate={onProfileUpdate} />;
                default:
                    return <DashboardHome studentData={studentData} />;
            }
        };

        return (
            <div className="dashboard-content">
                {/* Header */}
                <header className="content-header">
                    <div className="header-left">
                        <h1 className="page-title">{getPageTitle()}</h1>
                        <p className="page-description">{getPageDescription()}</p>
                    </div>
                    <div className="header-right">
                        <div className="user-welcome">
                            <span>Welcome,</span>
                            <strong>{studentData?.name}</strong>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="content-main">
                    {renderContent()}
                </main>
            </div>
        );
    };

    // ==============================
    // Main Render
    // ==============================
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
            />
        </div>
    );
};

export default StudentDashboard;