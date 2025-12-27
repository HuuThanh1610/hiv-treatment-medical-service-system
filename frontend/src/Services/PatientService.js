import api from './api';

const PatientService = {
    // Lấy danh sách bệnh nhân
    getAllPatients: async () => {
        try {
            const response = await api.get('/api/users');
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi tải danh sách bệnh nhân:', error);
            throw error;
        }
    },

    // Lấy thông tin bệnh nhân theo ID
    getPatientById: async (id) => {
        try {
            const response = await api.get(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin bệnh nhân:', error);
            throw error;
        }
    },

    // Thêm bệnh nhân mới
    addPatient: async (patientData) => {
        try {
            const response = await api.post('/api/users', {
                username: patientData.username,
                password: patientData.password,
                fullName: patientData.fullName,
                email: patientData.email,
                phoneNumber: patientData.phoneNumber,
                dateOfBirth: patientData.dateOfBirth,
                gender: patientData.gender,
                address: patientData.address,
                role: 'PATIENT'
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi thêm bệnh nhân:', error);
            throw error;
        }
    },

    // Cập nhật bệnh nhân
    updatePatient: async (id, patientData) => {
        try {
            const response = await api.put(`/api/users/${id}`, {
                fullName: patientData.fullName,
                email: patientData.email,
                phoneNumber: patientData.phoneNumber,
                dateOfBirth: patientData.dateOfBirth,
                gender: patientData.gender,
                address: patientData.address
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật bệnh nhân:', error);
            throw error;
        }
    },

    // Xoá bệnh nhân
    deletePatient: async (id) => {
        try {
            const response = await api.delete(`/api/users/${id}`);
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi xoá bệnh nhân:', error);
            throw error;
        }
    },

    // Bệnh nhân cập nhật thông tin cá nhân của mình
    updateCurrentPatient: async (patientData) => {
        try {
            const response = await api.put('/api/patients/me', {
                fullName: patientData.fullName,
                phoneNumber: patientData.phoneNumber,
                dateOfBirth: patientData.birthday,
                gender: patientData.gender,
                address: patientData.address,
                isPregnant: patientData.isPregnant
            });
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi cập nhật thông tin bệnh nhân:', error);
            throw error;
        }
    },

    // Lấy thông tin bệnh nhân hiện tại
    getCurrentPatient: async () => {
        try {
            const response = await api.get('/api/patients/me');
            return response.data;
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin bệnh nhân hiện tại:', error);
            throw error;
        }
    }
};

export default PatientService;
