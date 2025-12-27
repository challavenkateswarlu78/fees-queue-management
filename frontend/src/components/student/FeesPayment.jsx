import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { studentAPI } from '../../services/studentApi';

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

export default FeesPayment;