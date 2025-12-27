/**
 * AuthService.js - Service xử lý authentication
 *
 * Chức năng:
 * - Login/logout functions
 * - JWT token management
 * - User session handling
 * - LocalStorage management
 */
import api from './api';

/**
 * Đăng nhập user
 * API: POST /api/auth/login
 * @param {string} email - Email của người dùng
 * @param {string} password - Mật khẩu
 * @returns {Promise} Response từ backend với token
 */
export const login = (email, password) => {
    return api.post('/api/auth/login', {
        email,
        password
    });
};

/**
 * Đăng xuất user
 * Xóa tất cả auth data từ localStorage
 * @returns {Promise}
 */
export const logout = () => {
    // Clear all auth-related items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('rememberMe');
};

/**
 * Gửi yêu cầu đăng ký tài khoản đến backend
 * @param {Object} userData - Thông tin đăng ký của người dùng
 * @param {string} userData.email - Email
 * @param {string} userData.password - Mật khẩu
 * @param {string} userData.fullName - Họ và tên
 * @returns {Promise}
 */
export const register = (userData) => {
    return api.post('/api/auth/register', userData);
};
