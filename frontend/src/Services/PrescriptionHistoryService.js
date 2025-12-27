/**
 * Service để gọi các API liên quan đến lịch sử đơn thuốc
 * Tương tác với Backend Controller: PrescriptionHistoryController
 * 
 * Main API: /api/prescription-history/patient/{id}
 * Response: List<PrescriptionHistoryDTO> với createdAt và oldMedications
 */
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Helper function để lấy auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const PrescriptionHistoryService = {
    /**
     * API chính: Lấy lịch sử thay đổi đơn thuốc của bệnh nhân
     * Backend endpoint: GET /api/prescription-history/patient/{patientId}
     * 
     * Response format:
     * [
     *   {
     *     "id": 1,
     *     "prescriptionId": 2,
     *     "createdAt": "2025-08-05T22:07:55.525108", // ✅ Frontend dùng để hiển thị ngày
     *     "oldMedications": [                         // ✅ Frontend dùng để tạo tên đơn thuốc
     *       {
     *         "name": "Lamivudine",
     *         "dosage": "300mg",
     *         "frequency": "1 lần/ngày"
     *       }
     *     ],
     *     "patientName": "Nguyễn Văn A",
     *     "doctorName": "BS. Trần Thị B"
     *   }
     * ]
     */
    getByPatientId: async (patientId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/prescription-history/patient/${patientId}`,
                { headers: getAuthHeaders() }
            );
            return response.data; // Trả về List<PrescriptionHistoryDTO>
        } catch (error) {
            console.error('Error fetching prescription history:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử đơn thuốc theo treatment plan
     * Backend endpoint: GET /api/prescription-history/treatment-plan/{treatmentPlanId}
     */
    getByTreatmentPlanId: async (treatmentPlanId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/prescription-history/treatment-plan/${treatmentPlanId}`,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching prescription history by treatment plan:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử đơn thuốc theo doctor
     * Backend endpoint: GET /api/prescription-history/doctor/{doctorId}
     */
    getByDoctorId: async (doctorId) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/prescription-history/doctor/${doctorId}`,
                { headers: getAuthHeaders() }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching prescription history by doctor:', error);
            throw error;
        }
    },

    /**
     * Lấy lịch sử đơn thuốc trong khoảng thời gian
     * Backend endpoint: GET /api/prescription-history/patient/{patientId}/date-range
     */
    getByPatientIdAndDateRange: async (patientId, startDate, endDate) => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/prescription-history/patient/${patientId}/date-range`,
                {
                    headers: getAuthHeaders(),
                    params: { startDate, endDate }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching prescription history by date range:', error);
            throw error;
        }
    }
};

export default PrescriptionHistoryService;
