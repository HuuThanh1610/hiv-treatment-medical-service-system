/**
 * AppointmentService.js - Service xử lý các API liên quan đến appointment
 *
 * Chức năng:
 * - Update substitute doctor cho appointment
 * - Update appointment status
 * - Admin appointment management
 * - Doctor scheduling operations
 */
import api from './api';

const AppointmentService = {
    /**
     * Cập nhật bác sĩ thay thế cho appointment
     * API: PATCH /api/appointments/{id}/substitute
     */
    updateSubstituteDoctor: async (appointmentId, substituteDoctorId) => {
        const response = await api.patch(`/api/appointments/${appointmentId}/substitute`, { substituteDoctorId });
        return response.data;
    },

    /**
     * Cập nhật trạng thái appointment
     * API: PATCH /api/appointments/{id}/status
     */
    updateStatus: async (appointmentId, status, notes = '') => {
        const response = await api.patch(`/api/appointments/${appointmentId}/status`, {
            status,
            notes
        });
        return response.data;
    },
};

export default AppointmentService;
