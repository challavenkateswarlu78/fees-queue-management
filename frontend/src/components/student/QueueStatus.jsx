import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { studentAPI } from '../../services/studentApi';
import toast from 'react-hot-toast';

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

export default QueueStatus;