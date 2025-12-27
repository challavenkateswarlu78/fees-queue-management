import React from 'react';
import {
    FiHome,
    FiDollarSign,
    FiClock,
    FiUser,
    FiLogOut,
    FiBook,
    FiBriefcase,
    FiMail,
    FiPhone
} from 'react-icons/fi';

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

export default StudentSidebar;