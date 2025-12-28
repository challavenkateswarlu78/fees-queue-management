// services/api.js - Complete corrected version
import axios from 'axios';

// Use port 5001 to avoid conflicts
const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Simple request logging
api.interceptors.request.use((config) => {
    console.log(`➡️ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log(`✅ ${response.status} ${response.config.url}`);
        console.log('✅ Response data:', response.data);
        return response.data;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });
        
        if (error.response) {
            console.error('❌ Error response data:', error.response.data);
            console.error('❌ Error status:', error.response.status);
        }
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error.response?.data?.message || error.message || 'Network error');
    }
);

export const authAPI = {
    login: async (identifier, password) => {
        try {
            console.log('🔐 API Login attempt:', identifier);
            
            const response = await api.post('/auth/login', {
                identifier,
                password
            });
            
            console.log('🔐 API Login response:', response);
            return response;
            
        } catch (error) {
            console.error('🔐 API Login error:', error);
            throw error;
        }
    },
    
    registerStudent: (data) => api.post('/auth/register/student', data),
    getCurrentUser: () => api.get('/auth/me'),
    testConnection: () => api.get('/test'),
    healthCheck: () => api.get('/health')
};

export default api;