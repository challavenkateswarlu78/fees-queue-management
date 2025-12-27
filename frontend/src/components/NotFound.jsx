import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div style={{ 
            textAlign: 'center', 
            padding: '50px',
            backgroundColor: '#f5f7fa',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <h1 style={{ fontSize: '48px', color: '#2c3e50', marginBottom: '20px' }}>404</h1>
            <h2 style={{ color: '#7f8c8d', marginBottom: '20px' }}>Page Not Found</h2>
            <p style={{ color: '#95a5a6', marginBottom: '30px', maxWidth: '500px' }}>
                The page you are looking for might have been removed, had its name changed, 
                or is temporarily unavailable.
            </p>
            <Link 
                to="/login" 
                style={{
                    padding: '12px 30px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    transition: 'all 0.3s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#5a4fcf'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
            >
                Go to Login Page
            </Link>
        </div>
    );
};

export default NotFound;