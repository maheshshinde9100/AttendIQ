import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('attendiq_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth APIs
export const authAPI = {
    login: (email, password) => api.post('/auth/authenticate', { email, password }),
    register: (data) => api.post('/auth/register', data),
};

// Attendance APIs
export const attendanceAPI = {
    markAttendance: (data) => api.post('/attendance/mark', data),
    getMyAttendance: () => api.get('/attendance/my'),
    getUserAttendance: (userId) => api.get(`/attendance/user/${userId}`),
    getTodayAttendance: () => api.get('/attendance/today'),
};

// Dashboard APIs
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

// AI APIs
export const aiAPI = {
    analyzeToday: () => api.get('/ai/analyze-today'),
    getFlaggedLogs: () => api.get('/ai/logs/flagged'),
};

// User APIs
export const userAPI = {
    getProfile: () => api.get('/users/me'),
    getAllUsers: () => api.get('/users'),
};

export default api;
