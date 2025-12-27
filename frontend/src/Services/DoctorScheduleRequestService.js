import api from './api';

const DoctorScheduleRequestService = {
  createRequest: async (data) => {
    const res = await api.post('/api/doctor-schedule-requests', data);
    return res.data;
  },
  getMyRequests: async (doctorId) => {
    const res = await api.get(`/api/doctor-schedule-requests/doctor/${doctorId}`);
    return res.data;
  },
  getAllRequests: async (token) => {
    const res = await api.get('/api/doctor-schedule-requests', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  approveRequest: async (id, substituteDoctorId, adminNote) => {
    let url = `/api/doctor-schedule-requests/${id}/approve?substituteDoctorId=${substituteDoctorId}`;
    if (adminNote) url += `&adminNote=${encodeURIComponent(adminNote)}`;
    const res = await api.post(url);
    return res.data;
  },
  rejectRequest: async (id) => {
    const res = await api.post(`/api/doctor-schedule-requests/${id}/reject`);
    return res.data;
  }
};

export default DoctorScheduleRequestService;
