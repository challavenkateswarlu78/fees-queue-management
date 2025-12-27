import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBook, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './StudentRegister.css';

const StudentRegister = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        roll_number: '',
        college_email: '',
        phone_number: '',
        year: '1',
        branch: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const { registerStudent } = useAuth();
    const navigate = useNavigate();

    const branches = [
        'Computer Science',
        'Information Technology',
        'Electronics',
        'Mechanical',
        'Civil',
        'Electrical',
        'Chemical',
        'Biotechnology'
    ];

    const validateForm = () => {
        const newErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'Full name is required';
        }

        if (!formData.roll_number.trim()) {
            newErrors.roll_number = 'Roll number is required';
        }

        if (!formData.college_email.trim()) {
            newErrors.college_email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.college_email)) {
            newErrors.college_email = 'Email is invalid';
        }

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone_number)) {
            newErrors.phone_number = 'Phone number must be 10 digits';
        }

        if (!formData.branch) {
            newErrors.branch = 'Branch is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const studentData = {
            full_name: formData.full_name,
            roll_number: formData.roll_number,
            college_email: formData.college_email,
            phone_number: formData.phone_number,
            year: parseInt(formData.year),
            branch: formData.branch,
            password: formData.password
        };

        const result = await registerStudent(studentData);

        if (result.success) {
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } else {
            toast.error(result.message || 'Registration failed');
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <div className="register-header">
                    <h1>Student Registration</h1>
                    <p>Create your account</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group">
                            <div className="input-group">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="full_name"
                                    placeholder="Full Name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.full_name && <span className="error">{errors.full_name}</span>}
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <FiUser className="input-icon" />
                                <input
                                    type="text"
                                    name="roll_number"
                                    placeholder="Roll Number"
                                    value={formData.roll_number}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.roll_number && <span className="error">{errors.roll_number}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <div className="input-group">
                                <FiMail className="input-icon" />
                                <input
                                    type="email"
                                    name="college_email"
                                    placeholder="College Email"
                                    value={formData.college_email}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.college_email && <span className="error">{errors.college_email}</span>}
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <FiPhone className="input-icon" />
                                <input
                                    type="tel"
                                    name="phone_number"
                                    placeholder="Phone Number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.phone_number && <span className="error">{errors.phone_number}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <div className="input-group">
                                <FiBook className="input-icon" />
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                >
                                    <option value="1">First Year</option>
                                    <option value="2">Second Year</option>
                                    <option value="3">Third Year</option>
                                    <option value="4">Fourth Year</option>
                                    <option value="5">Fifth Year</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <FiBook className="input-icon" />
                                <select
                                    name="branch"
                                    value={formData.branch}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Branch</option>
                                    {branches.map(branch => (
                                        <option key={branch} value={branch}>{branch}</option>
                                    ))}
                                </select>
                            </div>
                            {errors.branch && <span className="error">{errors.branch}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <div className="input-group">
                                <FiLock className="input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.password && <span className="error">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <div className="input-group">
                                <FiLock className="input-icon" />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                            </div>
                            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="register-btn">
                            Register
                        </button>
                        <Link to="/login" className="login-link">
                            Already have an account? Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentRegister;