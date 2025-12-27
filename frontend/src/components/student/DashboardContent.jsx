import React from 'react';
import DashboardHome from './DashboardHome';
import FeesPayment from './FeesPayment';
import QueueStatus from './QueueStatus';
import UpdateProfile from './UpdateProfile';

const DashboardContent = ({ activeMenu, studentData, onProfileUpdate, onLogout }) => {
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

export default DashboardContent;