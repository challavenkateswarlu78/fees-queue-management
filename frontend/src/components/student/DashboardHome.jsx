import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { studentAPI } from '../../services/studentApi';

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

export default DashboardHome;