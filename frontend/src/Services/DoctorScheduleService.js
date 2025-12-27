import axios from 'axios';

const DoctorScheduleService = {
  async getMySchedule(token, status = 'ACTIVE') {
    const url = status
      ? `http://localhost:8080/api/doctors/me/schedule-dto?status=${status}`
      : 'http://localhost:8080/api/doctors/me/schedule-dto';
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }
};

export default DoctorScheduleService;
