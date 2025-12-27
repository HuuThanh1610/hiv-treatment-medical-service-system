import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

const RevisitAppointmentService = {
    // Tạo lịch hẹn tái khám
    createRevisitAppointment: async (data) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/revisit-appointments`, data, {
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Error creating revisit appointment:', error);
            throw error;
        }
    },

    // Lấy lịch hẹn tái khám theo appointment ID
    getByAppointmentId: async (appointmentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/revisit-appointments/appointment/${appointmentId}`, {
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Error fetching revisit appointment:', error);
            throw error;
        }
    },

    // Lấy danh sách lịch hẹn tái khám của bệnh nhân
    getByPatientId: async (patientId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/revisit-appointments/patient/${patientId}`, {
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Error fetching patient revisit appointments:', error);
            throw error;
        }
    },

    // Lấy danh sách lịch hẹn tái khám của bác sĩ
    getByDoctorId: async (doctorId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/revisit-appointments/doctor/${doctorId}`, {
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Error fetching doctor revisit appointments:', error);
            throw error;
        }
    },

    // Xóa lịch hẹn tái khám
    deleteRevisitAppointment: async (id) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/revisit-appointments/${id}`, {
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Error deleting revisit appointment:', error);
            throw error;
        }
    },

    // Gửi email nhắc nhở cho ngày mai (test function)
    sendTomorrowReminders: async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/revisit-appointments/send-tomorrow-reminders`, {}, {
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Error sending tomorrow reminders:', error);
            throw error;
        }
    },

    // Gửi email nhắc nhở cho ngày cụ thể (test function)
    sendRemindersForDate: async (date) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/revisit-appointments/send-reminders`, null, {
                params: { date },
                headers: getAuthHeaders()
            });
            return response;
        } catch (error) {
            console.error('Error sending reminders for date:', error);
            throw error;
        }
    }
};

export default RevisitAppointmentService;
