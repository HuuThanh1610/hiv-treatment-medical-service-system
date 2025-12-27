// src/Services/DoctorService.js
import api from './api';

const DoctorService = {
    // Gọi API đúng từ DoctorController
    getAllDoctors: async () => {
        try {
            const response = await api.get('/api/doctors');
            return response.data;
        } catch (error) {
            console.error('Lỗi khi tải danh sách bác sĩ:', error);
            throw error;
        }
    },

    addDoctor: async (doctorData) => {
        try {
            const response = await api.post('/api/doctors', doctorData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi thêm bác sĩ:', error);
            throw error;
        }
    },

    updateDoctor: async (id, doctorData) => {
        try {
            const response = await api.put(`/api/doctors/${id}`, doctorData);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin bác sĩ:', error);
            throw error;
        }
    },

    deleteDoctor: async (id) => {
        try {
            // Nếu bạn không có DELETE thật, bạn có thể gọi PATCH để deactivate:
            const response = await api.patch(`/api/doctors/${id}/deactivate`);
            return response.data;
        } catch (error) {
            console.error('Lỗi khi xoá bác sĩ:', error);
            throw error;
        }
    },

    // Lấy lịch hẹn của bác sĩ hiện tại
    getDoctorAppointments: async () => {
        try {
            const response = await api.get('/api/appointments/my-doctor-appointments');
            return response;
        } catch (error) {
            console.error('Lỗi khi tải lịch hẹn của bác sĩ:', error);
            throw error;
        }
    },

    // Lấy thông tin bác sĩ hiện tại
    getCurrentDoctor: async () => {
        try {
            const response = await api.get('/api/doctors/me');
            return response;
        } catch (error) {
            console.error('Lỗi khi tải thông tin bác sĩ:', error);
            throw error;
        }
    }
};

export default DoctorService;
