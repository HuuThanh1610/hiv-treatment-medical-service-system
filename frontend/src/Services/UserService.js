/**
 * UserService.js - Service xử lý các API liên quan đến user
 *
 * Chức năng:
 * - Get user by ID/username
 * - Update user profile
 * - Admin user management
 * - User account operations
 */
import api from './api';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/users';

/**
 * Lấy thông tin user theo ID
 * API: GET /api/users/{id}
 */
export const getUserById = (id) => {
    return api.get(`/api/users/${id}`);
};

/**
 * Lấy thông tin user theo username
 * API: GET /api/users/by-username/{username}
 */
export const getUserByUsername = (username) => {
    return api.get(`/api/users/by-username/${username}`);
};

/**
 * Cập nhật thông tin user (admin function)
 * API: PUT /api/users/{id}
 */
export const updateUser = (id, data) => {
    return api.put(`/api/users/${id}`, data);
};

export const updateCurrentUser = (data) => {
    // Validate phoneNumber trước khi gửi
    if (!data.phoneNumber || !/^[0-9]{9,15}$/.test(data.phoneNumber)) {
        throw new Error('Số điện thoại không hợp lệ');
    }
    return api.put('/api/users/me', data);
};

export const updatePassword = async (passwordData) => {
    try {
        const response = await api.put('/api/users/me', {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
        });
        return response.data;
    } catch (error) {
        console.error('Error updating password:', error.response?.data || error.message);
        throw error;
    }
};

export const getCurrentUser = () => {
    return api.get('/api/users/me');
};

const UserService = {
    // Lấy danh sách users
    getAllUsers: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data.content;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Lấy thông tin user theo id
    getUserById: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Cập nhật thông tin user
    updateUser: async (id, userData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/${id}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Xóa user
    deleteUser: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Deactivate user
    deactivateUser: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deactivating user:', error);
            throw error;
        }
    }
};

export default UserService;