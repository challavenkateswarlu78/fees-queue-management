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
        return response.data;
    },
    (error) => {
        console.error('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            message: error.message
        });
        
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        
        return Promise.reject(error.response?.data?.message || error.message);
    }
);

export const authAPI = {
    // Change login to accept separate arguments
    login: (identifier, password) => api.post('/auth/login', { identifier, password }),
    
    registerStudent: (data) => api.post('/auth/register/student', data),
    getCurrentUser: () => api.get('/auth/me'),
    testConnection: () => api.get('/test'),
    healthCheck: () => api.get('/health')
};

const login = async (identifier, password) => {
    try {
        console.log('🔍 AuthContext - login called:', identifier);
        
        // Now pass as separate arguments
        const response = await authAPI.login(identifier, password);
        console.log('🔍 AuthContext - API response:', response);
        
        // Check response structure
        const token = response.token;
        const user = response.user;
        
        if (!token || !user) {
            console.error('🔍 Invalid response structure:', response);
            return { success: false, message: 'Invalid server response' };
        }
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        
        console.log('🔍 Login successful, user role:', user.role);
        return { success: true, user, token };
        
    } catch (error) {
        console.error('🔍 AuthContext - login error:', error);
        return { 
            success: false, 
            message: error.message || 'Login failed' 
        };
    }
};

export default api;