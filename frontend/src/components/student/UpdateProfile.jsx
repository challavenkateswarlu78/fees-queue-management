import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { studentAPI } from '../../services/studentApi';

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

export default UpdateProfile;