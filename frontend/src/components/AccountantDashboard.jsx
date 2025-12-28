// AccountantDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    FiUser, FiDollarSign, FiClock, FiLogOut, FiCheckCircle, 
    FiAlertCircle, FiSkipForward, FiXCircle, FiPrinter, 
    FiRefreshCw, FiUsers, FiHome, FiSettings, FiTrendingUp,
    FiDownload, FiEye, FiEdit2, FiTrash2, FiCheck, FiX,
    FiBriefcase, FiMail, FiPhone, FiBook, FiLock
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AccountantDashboard.css';

const AccountantDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('queue');
    const [accountantData, setAccountantData] = useState(null);
    const [counterData, setCounterData] = useState(null);
    const [queue, setQueue] = useState([]);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showReceiptModal, setShowReceiptModal] = useState(false);
    const [receiptData, setReceiptData] = useState(null);
    const [showSkipConfirm, setShowSkipConfirm] = useState(false);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
    const [selectedQueueId, setSelectedQueueId] = useState(null);
    const [queueStats, setQueueStats] = useState({
        queueCount: 0,
        processedToday: 0,
        avgProcessingTime: 0,
        revenueToday: 0,
        successRate: 95
    });
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Initialize data
    useEffect(() => {
        if (!user || user.role !== 'accountant') {
            navigate('/login');
            return;
        }
        fetchAccountantData();
        // Set up auto-refresh every 10 seconds
        const interval = setInterval(fetchQueue, 10000);
        return () => clearInterval(interval);
    }, [user, navigate]);

    // Fetch accountant and counter data
    const fetchAccountantData = async () => {
        try {
            setLoading(true);
            // Fetch accountant details from database
            const response = await fetch(`/api/accountants/${user.id}`);
            const data = await response.json();
            
            setAccountantData({
                id: data.id,
                name: data.full_name || 'Accountant',
                uniqueId: data.unique_id,
                email: data.email,
                counterId: data.assigned_counter_id,
                photoUrl: data.photo_url || null
            });

            // Fetch counter details
            if (data.assigned_counter_id) {
                const counterResponse = await fetch(`/api/counters/${data.assigned_counter_id}`);
                const counterData = await counterResponse.json();
                setCounterData(counterData);
                fetchQueue(counterData.id);
                fetchQueueStats(counterData.id);
            }
        } catch (error) {
            console.error('Error fetching accountant data:', error);
            toast.error('Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Fetch queue for assigned counter
    const fetchQueue = async (counterId = counterData?.id) => {
        if (!counterId) return;
        
        try {
            setRefreshing(true);
            const response = await fetch(`/api/queue/counter/${counterId}`);
            const queueData = await response.json();
            
            setQueue(queueData);
            // Set current student (first in queue)
            if (queueData.length > 0) {
                setCurrentStudent(queueData[0]);
            } else {
                setCurrentStudent(null);
            }
        } catch (error) {
            console.error('Error fetching queue:', error);
            toast.error('Failed to load queue');
        } finally {
            setRefreshing(false);
        }
    };

    // Fetch queue statistics
    const fetchQueueStats = async (counterId = counterData?.id) => {
        if (!counterId) return;
        
        try {
            const response = await fetch(`/api/queue/stats/${counterId}`);
            const stats = await response.json();
            setQueueStats(stats);
        } catch (error) {
            console.error('Error fetching queue stats:', error);
        }
    };

    // Process payment - Mark as paid
    const handleProcessPayment = async () => {
        if (!currentStudent) return;

        setProcessing(true);
        try {
            // Create payment record
            const paymentResponse = await fetch('/api/payments/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queueId: currentStudent.queue_id,
                    studentId: currentStudent.student_id,
                    counterId: counterData.id,
                    accountantId: accountantData.id,
                    tokenNumber: currentStudent.token_number,
                    totalAmount: currentStudent.total_amount,
                    feeDetails: currentStudent.fee_details,
                    paymentMethod: 'cash'
                })
            });

            const paymentResult = await paymentResponse.json();
            
            // Generate receipt
            const receipt = {
                receiptNumber: `REC${Date.now().toString().slice(-8)}`,
                studentName: currentStudent.full_name,
                rollNumber: currentStudent.roll_number,
                counterName: counterData.counter_name,
                counterNumber: counterData.counter_number,
                accountantName: accountantData.name,
                tokenNumber: currentStudent.token_number,
                paymentDate: new Date().toISOString(),
                feeDetails: currentStudent.fee_details,
                totalAmount: currentStudent.total_amount,
                paymentId: paymentResult.paymentId
            };
            
            setReceiptData(receipt);
            setShowReceiptModal(true);
            
            toast.success('Payment processed successfully!');
            
            // Update student queue status
            await fetch('/api/queue/update-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queueId: currentStudent.queue_id,
                    status: 'completed'
                })
            });
            
            // Refresh queue and stats
            fetchQueue();
            fetchQueueStats();
            
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    // Skip student (move to end of queue)
    const handleSkipStudent = async () => {
        if (!selectedQueueId) return;

        try {
            await fetch('/api/queue/skip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queueId: selectedQueueId,
                    counterId: counterData.id
                })
            });
            
            toast.success('Student moved to end of queue');
            setShowSkipConfirm(false);
            setSelectedQueueId(null);
            fetchQueue();
            
            // Notify student (in real app, this would be via WebSocket or push notification)
            console.log(`Student with queue ID ${selectedQueueId} was skipped`);
            
        } catch (error) {
            console.error('Error skipping student:', error);
            toast.error('Failed to skip student');
        }
    };

    // Remove student from queue
    const handleRemoveStudent = async (reason) => {
        if (!selectedQueueId) return;

        try {
            await fetch('/api/queue/remove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    queueId: selectedQueueId,
                    counterId: counterData.id,
                    reason: reason
                })
            });
            
            toast.success('Student removed from queue');
            setShowRemoveConfirm(false);
            setSelectedQueueId(null);
            fetchQueue();
            
            // Notify student
            console.log(`Student with queue ID ${selectedQueueId} was removed. Reason: ${reason}`);
            
        } catch (error) {
            console.error('Error removing student:', error);
            toast.error('Failed to remove student');
        }
    };

    // Print receipt
    const handlePrintReceipt = () => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payment Receipt - ${receiptData?.receiptNumber}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 30px; }
                        .receipt { max-width: 500px; margin: 0 auto; border: 2px solid #000; padding: 20px; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
                        .college-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
                        .receipt-number { font-size: 14px; color: #666; }
                        .details { margin: 20px 0; }
                        .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #eee; }
                        .detail-label { font-weight: bold; color: #555; }
                        .fee-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        .fee-table th { background: #f5f5f5; padding: 10px; text-align: left; }
                        .fee-table td { padding: 10px; border-bottom: 1px solid #eee; }
                        .total-row { font-weight: bold; font-size: 18px; }
                        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; border-top: 2px solid #000; padding-top: 20px; }
                        .signature { margin-top: 40px; }
                        .print-btn { display: none; }
                        @media print {
                            body { padding: 0; }
                            .print-btn { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="receipt">
                        <div class="header">
                            <div class="college-name">COLLEGE FEE MANAGEMENT SYSTEM</div>
                            <div>Official Payment Receipt</div>
                            <div class="receipt-number">Receipt No: ${receiptData?.receiptNumber}</div>
                        </div>
                        
                        <div class="details">
                            <div class="detail-row">
                                <span class="detail-label">Student Name:</span>
                                <span>${receiptData?.studentName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Roll Number:</span>
                                <span>${receiptData?.rollNumber}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Counter:</span>
                                <span>${receiptData?.counterName} (${receiptData?.counterNumber})</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Accountant:</span>
                                <span>${receiptData?.accountantName}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Token No:</span>
                                <span>${receiptData?.tokenNumber}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Date & Time:</span>
                                <span>${new Date(receiptData?.paymentDate).toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <table class="fee-table">
                            <thead>
                                <tr>
                                    <th>Fee Type</th>
                                    <th>Amount (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${receiptData?.feeDetails?.map(fee => `
                                    <tr>
                                        <td>${fee.type}</td>
                                        <td>${formatCurrency(fee.amount)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <td>Total Amount</td>
                                    <td>${formatCurrency(receiptData?.totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        
                        <div class="footer">
                            <div class="signature">
                                <div style="margin-top: 50px;">_________________________</div>
                                <div>Authorized Signature</div>
                            </div>
                            <div style="margin-top: 20px;">
                                <p>This is a computer generated receipt.</p>
                                <p>Thank you for your payment!</p>
                            </div>
                        </div>
                    </div>
                    
                    <button class="print-btn" onclick="window.print()">Print Receipt</button>
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() {
                                window.close();
                            }, 1000);
                        };
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Helper functions
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatTime = (minutes) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
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

    // Menu click handler
    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
    };

    // Logout handler
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading accountant dashboard...</p>
            </div>
        );
    }

    // If no counter assigned
    if (!counterData) {
        return (
            <div className="error-container">
                <h2>No Counter Assigned</h2>
                <p>You have not been assigned to any counter. Please contact administrator.</p>
                <button onClick={handleLogout} className="btn-primary">
                    Logout
                </button>
            </div>
        );
    }

    // ==============================
    // AccountantSidebar Component
    // ==============================
    const AccountantSidebar = () => {
        const getInitial = (name) => {
            return name ? name.charAt(0).toUpperCase() : 'A';
        };

        const menuItems = [
            { id: 'queue', label: 'Queue Management', icon: <FiUsers /> },
            { id: 'transactions', label: 'Transactions', icon: <FiDollarSign /> },
            { id: 'history', label: 'Payment History', icon: <FiClock /> },
            { id: 'settings', label: 'Settings', icon: <FiSettings /> },
        ];

        return (
            <div className="accountant-sidebar">
                {/* Profile Section */}
                <div className="sidebar-profile">
                    <div className="profile-image">
                        {accountantData?.photoUrl ? (
                            <img 
                                src={accountantData.photoUrl} 
                                alt={accountantData.name}
                                className="profile-photo"
                            />
                        ) : (
                            <div className="profile-avatar accountant">
                                {getInitial(accountantData?.name)}
                            </div>
                        )}
                    </div>
                    <div className="profile-info">
                        <h3 className="accountant-name">{accountantData?.name}</h3>
                        <p className="accountant-role">Accountant</p>
                        <div className="counter-badge">
                            <FiHome className="counter-icon" />
                            <span>{counterData?.counter_name}</span>
                        </div>
                    </div>
                </div>

                {/* Counter Details */}
                <div className="counter-details-section">
                    <h4>Counter Information</h4>
                    <div className="counter-details">
                        <div className="counter-detail-item">
                            <span className="detail-label">Counter No:</span>
                            <span className="detail-value">{counterData?.counter_number}</span>
                        </div>
                        <div className="counter-detail-item">
                            <span className="detail-label">Fee Types:</span>
                            <div className="fee-tags">
                                {counterData?.fee_types?.split(',').map((type, index) => (
                                    <span key={index} className="fee-tag">{type.trim()}</span>
                                ))}
                            </div>
                        </div>
                        <div className="counter-detail-item">
                            <span className="detail-label">Queue Capacity:</span>
                            <span className="detail-value">50</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeMenu === item.id ? 'active' : ''}`}
                            onClick={() => handleMenuClick(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Stats */}
                <div className="sidebar-stats">
                    <div className="stat-item">
                        <FiUsers className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-value">{queueStats.queueCount}</span>
                            <span className="stat-label">In Queue</span>
                        </div>
                    </div>
                    <div className="stat-item">
                        <FiDollarSign className="stat-icon" />
                        <div className="stat-content">
                            <span className="stat-value">{queueStats.processedToday}</span>
                            <span className="stat-label">Today</span>
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        <FiLogOut className="logout-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        );
    };

    // ==============================
    // Queue Management Component
    // ==============================
    const QueueManagement = () => {
        return (
            <div className="queue-management">
                {/* Current Student Card */}
                <div className="current-student-card">
                    <div className="card-header">
                        <h2>
                            <FiUser className="header-icon" />
                            Current Student
                        </h2>
                        <div className="token-badge">
                            Token: <strong>{currentStudent?.token_number || 'N/A'}</strong>
                        </div>
                    </div>

                    {currentStudent ? (
                        <>
                            <div className="student-info">
                                <div className="info-section">
                                    <div className="info-row">
                                        <div className="info-item">
                                            <span className="label">Name:</span>
                                            <span className="value">{currentStudent.full_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Roll No:</span>
                                            <span className="value">{currentStudent.roll_number}</span>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-item">
                                            <span className="label">Year & Branch:</span>
                                            <span className="value">
                                                Year {currentStudent.year} - {currentStudent.branch}
                                            </span>
                                        </div>
                                        <div className="info-item">
                                            <span className="label">Queue Position:</span>
                                            <span className="value queue-position">#{currentStudent.queue_position}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Fee Details */}
                                <div className="fee-details-section">
                                    <h3>
                                        <FiDollarSign className="section-icon" />
                                        Fee Details
                                    </h3>
                                    <div className="fee-items">
                                        {currentStudent.fee_details?.map((fee, index) => (
                                            <div key={index} className="fee-item">
                                                <span className="fee-type">{fee.type}</span>
                                                <span className="fee-amount">{formatCurrency(fee.amount)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="fee-total">
                                        <span>Total Amount:</span>
                                        <span className="total-amount">
                                            {formatCurrency(currentStudent.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="action-buttons">
                                    <button
                                        className="btn-primary process-btn"
                                        onClick={handleProcessPayment}
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <>
                                                <span className="spinner"></span>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FiCheck />
                                                Mark as Paid & Print
                                            </>
                                        )}
                                    </button>

                                    <div className="secondary-actions">
                                        <button
                                            className="btn-secondary skip-btn"
                                            onClick={() => {
                                                setSelectedQueueId(currentStudent.queue_id);
                                                setShowSkipConfirm(true);
                                            }}
                                        >
                                            <FiSkipForward />
                                            Skip Student
                                        </button>
                                        <button
                                            className="btn-danger remove-btn"
                                            onClick={() => {
                                                setSelectedQueueId(currentStudent.queue_id);
                                                setShowRemoveConfirm(true);
                                            }}
                                        >
                                            <FiXCircle />
                                            Remove Student
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-student">
                            <FiAlertCircle className="empty-icon" />
                            <h3>No Students in Queue</h3>
                            <p>Waiting for new payment requests...</p>
                        </div>
                    )}
                </div>

                {/* Queue List */}
                <div className="queue-list-section">
                    <div className="section-header">
                        <h2>
                            <FiClock className="header-icon" />
                            Queue List ({queue.length} students)
                        </h2>
                        <button 
                            className="refresh-btn"
                            onClick={() => fetchQueue()}
                            disabled={refreshing}
                        >
                            <FiRefreshCw className={refreshing ? 'spinning' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                    
                    {queue.length > 0 ? (
                        <div className="queue-list">
                            {queue.map((student, index) => (
                                <div 
                                    key={student.queue_id} 
                                    className={`queue-item ${index === 0 ? 'current' : ''}`}
                                >
                                    <div className="queue-position">#{index + 1}</div>
                                    <div className="student-details">
                                        <h4>{student.full_name}</h4>
                                        <p className="roll-number">{student.roll_number}</p>
                                        <div className="fee-info">
                                            <span className="fee-count">
                                                {student.fee_details?.length || 0} fee(s)
                                            </span>
                                            <span className="total-amount">
                                                {formatCurrency(student.total_amount)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="token-info">
                                        <span className="token">{student.token_number}</span>
                                        <span className="waiting-time">Est: 15-30 min</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-queue">
                            <p>No students in the queue at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Queue Statistics */}
                <div className="queue-stats-section">
                    <h3>
                        <FiTrendingUp className="header-icon" />
                        Queue Statistics
                    </h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon queue">
                                <FiUsers />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{queueStats.queueCount}</span>
                                <span className="stat-label">In Queue</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon processed">
                                <FiCheckCircle />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{queueStats.processedToday}</span>
                                <span className="stat-label">Processed Today</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon time">
                                <FiClock />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{formatTime(queueStats.avgProcessingTime)}</span>
                                <span className="stat-label">Avg. Time</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon revenue">
                                <FiDollarSign />
                            </div>
                            <div className="stat-content">
                                <span className="stat-value">{formatCurrency(queueStats.revenueToday)}</span>
                                <span className="stat-label">Revenue Today</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ==============================
    // Receipt Modal Component
    // ==============================
    const ReceiptModal = () => {
        if (!showReceiptModal || !receiptData) return null;

        return (
            <div className="modal-overlay">
                <div className="receipt-modal">
                    <div className="modal-header">
                        <h2>Payment Receipt</h2>
                        <button className="close-btn" onClick={() => setShowReceiptModal(false)}>
                            <FiX />
                        </button>
                    </div>

                    <div className="modal-body">
                        <div className="receipt-header">
                            <div className="college-logo">
                                <h3>COLLEGE FEE MANAGEMENT SYSTEM</h3>
                                <p>Official Payment Receipt</p>
                            </div>
                            <div className="receipt-info">
                                <div className="receipt-number">
                                    <span>Receipt No:</span>
                                    <strong>{receiptData.receiptNumber}</strong>
                                </div>
                                <div className="receipt-date">
                                    <span>Date:</span>
                                    <strong>{new Date(receiptData.paymentDate).toLocaleString()}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="receipt-details">
                            <div className="section">
                                <h4>Student Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span>Name:</span>
                                        <span>{receiptData.studentName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Roll No:</span>
                                        <span>{receiptData.rollNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="section">
                                <h4>Payment Information</h4>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span>Counter:</span>
                                        <span>{receiptData.counterName} ({receiptData.counterNumber})</span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Accountant:</span>
                                        <span>{receiptData.accountantName}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span>Token No:</span>
                                        <span>{receiptData.tokenNumber}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="section">
                                <h4>Fee Details</h4>
                                <div className="fee-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Fee Type</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receiptData.feeDetails?.map((fee, index) => (
                                                <tr key={index}>
                                                    <td>{fee.type}</td>
                                                    <td>{formatCurrency(fee.amount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td><strong>Total Amount</strong></td>
                                                <td><strong>{formatCurrency(receiptData.totalAmount)}</strong></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div className="payment-method">
                                <div className="detail-item">
                                    <span>Payment Method:</span>
                                    <span>Cash</span>
                                </div>
                                <div className="detail-item">
                                    <span>Payment Status:</span>
                                    <span className="status-success">Completed</span>
                                </div>
                            </div>
                        </div>

                        <div className="receipt-footer">
                            <div className="signature">
                                <p>________________</p>
                                <p>Accountant Signature</p>
                            </div>
                            <div className="note">
                                <p>This is a computer generated receipt.</p>
                                <p>Thank you for your payment!</p>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button 
                            className="btn-secondary" 
                            onClick={() => {
                                const element = document.createElement('a');
                                const file = new Blob([document.getElementById('receipt-content').innerText], {type: 'text/plain'});
                                element.href = URL.createObjectURL(file);
                                element.download = `receipt-${receiptData.receiptNumber}.txt`;
                                document.body.appendChild(element);
                                element.click();
                            }}
                        >
                            <FiDownload />
                            Download as Text
                        </button>
                        <button className="btn-primary" onClick={handlePrintReceipt}>
                            <FiPrinter />
                            Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==============================
    // Confirmation Modals
    // ==============================
    const ConfirmationModals = () => {
        return (
            <>
                {/* Skip Confirmation Modal */}
                {showSkipConfirm && (
                    <div className="modal-overlay">
                        <div className="confirmation-modal">
                            <h3>Skip Student</h3>
                            <p>Are you sure you want to move this student to the end of the queue?</p>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowSkipConfirm(false)}>
                                    Cancel
                                </button>
                                <button className="btn-warning" onClick={handleSkipStudent}>
                                    Yes, Skip Student
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remove Confirmation Modal */}
                {showRemoveConfirm && (
                    <div className="modal-overlay">
                        <div className="confirmation-modal">
                            <h3>Remove Student</h3>
                            <p>Are you sure you want to remove this student from the queue?</p>
                            <div className="reason-input">
                                <label>Reason for removal:</label>
                                <select id="removeReason" defaultValue="absent">
                                    <option value="absent">Student Absent</option>
                                    <option value="incorrect">Incorrect Details</option>
                                    <option value="duplicate">Duplicate Request</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button className="btn-secondary" onClick={() => setShowRemoveConfirm(false)}>
                                    Cancel
                                </button>
                                <button 
                                    className="btn-danger" 
                                    onClick={() => handleRemoveStudent(
                                        document.getElementById('removeReason').value
                                    )}
                                >
                                    Remove from Queue
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    };

    // ==============================
    // DashboardContent Component
    // ==============================
    const DashboardContent = () => {
        const getPageTitle = () => {
            switch (activeMenu) {
                case 'queue': return 'Queue Management';
                case 'transactions': return 'Transactions History';
                case 'history': return 'Payment History';
                case 'settings': return 'Account Settings';
                default: return 'Accountant Dashboard';
            }
        };

        const getPageDescription = () => {
            switch (activeMenu) {
                case 'queue': return 'Manage student payments in real-time';
                case 'transactions': return 'View all processed transactions';
                case 'history': return 'Payment history and records';
                case 'settings': return 'Update your account settings';
                default: return '';
            }
        };

        const renderContent = () => {
            switch (activeMenu) {
                case 'queue':
                    return <QueueManagement />;
                default:
                    return (
                        <div className="coming-soon">
                            <h2>Coming Soon</h2>
                            <p>This feature is under development.</p>
                        </div>
                    );
            }
        };

        return (
            <div className="dashboard-content">
                {/* Header */}
                <header className="content-header">
                    <div className="header-left">
                        <h1 className="page-title">
                            Counter {counterData?.counter_number} - {getPageTitle()}
                        </h1>
                        <p className="page-description">{getPageDescription()}</p>
                    </div>
                    <div className="header-right">
                        <div className="counter-info">
                            <span>Assigned Counter</span>
                            <strong>{counterData?.counter_name}</strong>
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
    return (
        <div className="accountant-dashboard">
            <AccountantSidebar />
            <DashboardContent />
            <ReceiptModal />
            <ConfirmationModals />
        </div>
    );
};

export default AccountantDashboard;