/**
 * Service để gọi các API liên quan đến lịch sử điều trị (thay đổi phác đồ)
 * Tương tác với Backend Controller: TreatmentHistoryController
 * 
 * Main API: /api/treatment-history/patient/{id}
 * Response: List<TreatmentHistoryDTO> với thông tin thay đổi phác đồ ARV
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Helper function để lấy auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const TreatmentHistoryService = {
    /**
     * API chính: Lấy lịch sử thay đổi phác đồ điều trị của bệnh nhân
     * Backend endpoint: GET /api/treatment-history/patient/{patientId}
     * 
     * Response format:
     * [
     *   {
     *     "id": 1,
     *     "oldArvProtocolId": 1,
     *     "newArvProtocolId": 2,
     *     "startDate": "2025-01-01",
     *     "changeReason": "Thay đổi phác đồ do tác dụng phụ",
     *     "patientName": "Nguyễn Văn A",
     *     "doctorName": "BS. Trần Thị B"
     *   }
     * ]
     */
    getByPatientId: async (patientId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/treatment-history/patient/${patientId}`,
                { headers: getAuthHeaders() }
            );
            return response.data; // Trả về List<TreatmentHistoryDTO>
        } catch (error) {
            console.error('Error fetching treatment history:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử điều trị theo treatment plan
     * Backend endpoint: GET /api/treatment-history/treatment-plan/{treatmentPlanId}
     */
    getByTreatmentPlanId: async (treatmentPlanId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/treatment-history/treatment-plan/${treatmentPlanId}`,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching treatment history by treatment plan:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử điều trị theo doctor
     * Backend endpoint: GET /api/treatment-history/doctor/{doctorId}
     */
    getByDoctorId: async (doctorId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/treatment-history/doctor/${doctorId}`,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching treatment history by doctor:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử điều trị trong khoảng thời gian
     * Backend endpoint: GET /api/treatment-history/patient/{patientId}/date-range
     */
    getByPatientIdAndDateRange: async (patientId, startDate, endDate) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/treatment-history/patient/${patientId}/date-range`,
                {
                    headers: getAuthHeaders(),
                    params: { startDate, endDate }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching treatment history by date range:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử thay đổi phác đồ cụ thể
     * Backend endpoint: GET /api/treatment-history/protocol-change
     */
    getByProtocolChange: async (oldProtocolId, newProtocolId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/treatment-history/protocol-change`,
                {
                    headers: getAuthHeaders(),
                    params: { oldProtocolId, newProtocolId }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching treatment history by protocol change:', error);
            throw error;
        }
    }
};

export default TreatmentHistoryService;
