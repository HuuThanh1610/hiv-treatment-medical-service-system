/**
 * api.js - Base API configuration với authentication
 *
 * Chức năng:
 * - Cấu hình axios instance với baseURL
 * - Auto thêm JWT token vào headers
 * - Interceptors cho request/response
 * - Centralized API error handling
 */
import axios from 'axios';

// Tạo axios instance với config mặc định
const api = axios.create({
    baseURL: 'http://localhost:8080', // Backend server URL
    headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - Tự động thêm JWT token vào mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Thêm token vào header
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle 401 Unauthorized error
            if (error.response.status === 401) {
                // Clear local storage
                localStorage.removeItem('token');
                localStorage.removeItem('role');

                // Redirect to login page if not already there
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }

            // Log error details
            console.error('API Error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        } else if (error.request) {
            // The request was made but no response was received
        } else {
            // Something happened in setting up the request
        }

        return Promise.reject(error);
    }
);

// CONSULTATION APIs
export const startConsultationSession = (doctorId, initialMessage) =>
    api.post('/api/consultations/start', { doctorId, initialMessage });


export const getMyConsultationSessions = () =>
    api.get('/api/consultations/my-sessions');

export const sendConsultationMessage = (sessionId, content) =>
    api.post(`/api/consultations/${sessionId}/messages`, { content });

export const getConsultationMessages = (sessionId) =>
    api.get(`/api/consultations/${sessionId}/messages`);

export const closeConsultationSession = (sessionId) =>
    api.post(`/api/consultations/${sessionId}/close`);

export const deleteConsultationSession = (sessionId) =>
    api.delete(`/api/consultations/${sessionId}`);

export default api;
