import axios from 'axios';

class AppointmentDeclarationService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/appointment-declarations';
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Tạo khai báo mới
    async createDeclaration(declarationData) {
        try {
            const response = await axios.post(this.baseURL, declarationData, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error creating appointment declaration:', error);
            throw error;
        }
    }

    // Cập nhật khai báo
    async updateDeclaration(id, declarationData) {
        try {
            const response = await axios.put(`${this.baseURL}/${id}`, declarationData, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error updating appointment declaration:', error);
            throw error;
        }
    }

    // Lấy khai báo theo ID
    async getDeclarationById(id) {
        try {
            const response = await axios.get(`${this.baseURL}/${id}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment declaration:', error);
            throw error;
        }
    }

    // Lấy khai báo theo appointmentId
    async getDeclarationByAppointmentId(appointmentId) {
        try {
            const response = await axios.get(`${this.baseURL}/appointment/${appointmentId}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null; // No declaration found
            }
            console.error('Error fetching appointment declaration by appointment ID:', error);
            throw error;
        }
    }

    // Lấy tất cả khai báo của một bệnh nhân
    async getDeclarationsByPatientId(patientId) {
        try {
            const response = await axios.get(`${this.baseURL}/patient/${patientId}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching patient declarations:', error);
            throw error;
        }
    }

    // Lấy tất cả khai báo của một bác sĩ
    async getDeclarationsByDoctorId(doctorId) {
        try {
            const response = await axios.get(`${this.baseURL}/doctor/${doctorId}`, {
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching doctor declarations:', error);
            throw error;
        }
    }

    // Kiểm tra trạng thái mang thai của bệnh nhân
    async checkPatientPregnancyStatus(patientId, appointmentDate) {
        try {
            const response = await axios.get(`${this.baseURL}/patient/${patientId}/pregnant-status`, {
                params: { appointmentDate },
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error checking pregnancy status:', error);
            throw error;
        }
    }

    // Lấy danh sách bệnh nhân mang thai trong khoảng thời gian
    async getPregnantPatientsByDateRange(startDate, endDate) {
        try {
            const response = await axios.get(`${this.baseURL}/pregnant-patients`, {
                params: { startDate, endDate },
                headers: this.getAuthHeaders()
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching pregnant patients:', error);
            throw error;
        }
    }
}

export default new AppointmentDeclarationService();
