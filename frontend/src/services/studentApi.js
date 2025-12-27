import api from './api';

export const studentAPI = {
    // Dashboard
    getDashboardData: () => api.get('/student/dashboard'),
    
    // Payments
    getPaymentOptions: () => api.get('/student/payment-options'),
    createPayment: (data) => api.post('/student/payments', data),
    getQueueStatus: () => api.get('/student/payments/queue'),
    
    // Profile
    updateProfile: (data) => api.put('/student/profile', data),
    
    // Upload photo
    uploadPhoto: (formData) => api.post('/student/upload-photo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
};

export default studentAPI;