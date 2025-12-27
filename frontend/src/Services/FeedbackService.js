import api from './api';

const FeedbackService = {
    // Tạo feedback mới
    createFeedback: async (feedbackData) => {
        try {
            const response = await api.post('/api/feedbacks', feedbackData);
            return response.data;
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw error;
        }
    },

    // Cập nhật feedback
    updateFeedback: async (feedbackId, feedbackData) => {
        try {
            const response = await api.put(`/api/feedbacks/${feedbackId}`, feedbackData);
            return response.data;
        } catch (error) {
            console.error('Error updating feedback:', error);
            throw error;
        }
    },

    // Lấy feedback theo ID
    getFeedbackById: async (feedbackId) => {
        try {
            const response = await api.get(`/api/feedbacks/${feedbackId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting feedback by ID:', error);
            throw error;
        }
    },

    // Lấy feedback theo appointment ID
    getFeedbackByAppointmentId: async (appointmentId) => {
        try {
            const response = await api.get(`/api/feedbacks/appointment/${appointmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting feedback by appointment ID:', error);
            throw error;
        }
    },

    // Lấy tất cả feedback (Admin/Staff)
    getAllFeedbacks: async () => {
        try {
            const response = await api.get('/api/feedbacks');
            return response.data;
        } catch (error) {
            console.error('Error getting all feedbacks:', error);
            throw error;
        }
    },

    // Lấy feedback theo doctor ID
    getFeedbacksByDoctorId: async (doctorId) => {
        try {
            const response = await api.get(`/api/feedbacks/doctor/${doctorId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting feedbacks by doctor ID:', error);
            throw error;
        }
    },

    // Kiểm tra có thể feedback không
    canPatientProvideFeedback: async (appointmentId) => {
        try {
            const response = await api.get(`/api/feedbacks/can-feedback/${appointmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error checking if patient can provide feedback:', error);
            throw error;
        }
    }
};

export default FeedbackService;
