import api from './api';

class LabRequestService {
    // Tạo yêu cầu xét nghiệm
    async createLabRequest(data) {
        try {
            const response = await api.post('/api/lab-requests/patient/create', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách yêu cầu xét nghiệm của bệnh nhân
    async getMyLabRequests() {
        try {
            const response = await api.get('/api/lab-requests/patient/my-results');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Lấy kết quả xét nghiệm theo trạng thái
    async getMyLabResultsByStatus(status) {
        try {
            const response = await api.get(`/api/lab-requests/patient/my-results/status/${status}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Lấy kết quả xét nghiệm theo khoảng thời gian
    async getMyLabResultsByDateRange(startDate, endDate) {
        try {
            const response = await api.get('/api/lab-requests/patient/my-results/date-range', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Lấy chi tiết kết quả xét nghiệm
    async getMyLabResultItem(itemId) {
        try {
            const response = await api.get(`/api/lab-requests/patient/my-results/item/${itemId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách lịch hẹn của bệnh nhân
    async getMyAppointments() {
        try {
            const response = await api.get('/api/appointments/my-appointments');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách bác sĩ
    async getDoctors() {
        try {
            const response = await api.get('/api/doctors');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Lấy danh sách loại xét nghiệm
    async getLabTestTypes() {
        try {
            const response = await api.get('/api/lab-test-types');
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Cập nhật trạng thái yêu cầu xét nghiệm
    async updateLabRequestStatus(id, status) {
        try {
            const response = await api.patch(`/api/lab-requests/${id}/status?status=${status}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }

    // Xóa yêu cầu xét nghiệm
    async deleteLabRequest(id) {
        try {
            const response = await api.delete(`/api/lab-requests/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
}

export default new LabRequestService(); 