import React, { useEffect, useState } from 'react';
import DoctorScheduleRequestService from '../../Services/DoctorScheduleRequestService';
import DoctorService from '../../Services/DoctorService';
import axios from 'axios';

const STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối'
};

const DoctorScheduleRequestApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const [reqRes, docRes, schRes] = await Promise.all([
        DoctorScheduleRequestService.getAllRequests(token),
        DoctorService.getAllDoctors(token),
        axios.get('http://localhost:8080/api/doctors/schedules', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRequests(reqRes);
      setDoctors(docRes);
      setSchedules(schRes.data);
    } catch {
      setError('Không thể tải danh sách đơn xin nghỉ');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const [approveModal, setApproveModal] = useState({ open: false, requestId: null, substituteDoctorId: '', adminNote: '' });

  const handleApprove = async (id, substituteDoctorId, adminNote) => {
    try {
      await DoctorScheduleRequestService.approveRequest(id, substituteDoctorId, adminNote);
      setApproveModal({ open: false, requestId: null, substituteDoctorId: '', adminNote: '' });
      fetchRequests();
    } catch (err) {
      let msg = 'Duyệt đơn thất bại!';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.response?.data) {
        msg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
      }
      setError(msg);
    }
  };
  const handleReject = async (id) => {
    try {
      await DoctorScheduleRequestService.rejectRequest(id);
      fetchRequests();
    } catch {
      alert('Từ chối đơn thất bại!');
    }
  };

  const getDoctorName = (doctorId) => {
    const doc = doctors.find(d => d.id === doctorId);
    return doc ? doc.fullName : doctorId;
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý đơn xin nghỉ của bác sĩ</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr style={{ background: '#f3f4f6' }}>
            <th style={{ padding: 8 }}>Bác sĩ</th>
            <th style={{ padding: 8 }}>Ngày</th>
            <th style={{ padding: 8 }}>Ca</th>
            <th style={{ padding: 8 }}>Lý do</th>
            <th style={{ padding: 8 }}>Trạng thái</th>
            <th style={{ padding: 8 }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id} style={{ background: req.status === 'PENDING' ? '#fffbe7' : '#fff' }}>
              <td style={{ padding: 8 }}>{getDoctorName(req.doctorId)}</td>
              <td style={{ padding: 8 }}>{req.date}</td>
              <td style={{ padding: 8 }}>{req.timeSlot}</td>
              <td style={{ padding: 8 }}>{req.reason}</td>
              <td style={{ padding: 8 }}>{STATUS_LABELS[req.status] || req.status}</td>
              <td style={{ padding: 8 }}>
                {req.status === 'PENDING' && (
                  <>
                    <button onClick={() => setApproveModal({ open: true, requestId: req.id, substituteDoctorId: '', adminNote: '' })} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', marginRight: 8, cursor: 'pointer' }}>Duyệt</button>
                    <button onClick={() => handleReject(req.id)} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 12px', cursor: 'pointer' }}>Từ chối</button>
                  </>
                )}
      {/* Modal duyệt đơn */}
      {approveModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={e => { e.preventDefault(); handleApprove(approveModal.requestId, approveModal.substituteDoctorId, approveModal.adminNote); }} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px 0 rgba(60,72,88,0.18)' }}>
            <h3 style={{ marginBottom: 18, color: '#1976d2' }}>Duyệt đơn xin nghỉ</h3>
            <div style={{ marginBottom: 16 }}>
              <label>Chọn bác sĩ thay thế: </label>
              <select value={approveModal.substituteDoctorId} onChange={e => setApproveModal(m => ({ ...m, substituteDoctorId: e.target.value }))} required style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
                <option value=''>-- Chọn bác sĩ --</option>
                {(() => {
                  // Lấy request đang duyệt
                  const req = requests.find(r => r.id === approveModal.requestId);
                  if (!req) return null;
                  // Lọc bác sĩ hợp lệ
                  return doctors.filter(d => {
                    if (d.id === req.doctorId) return false;
                    // Bác sĩ này có lịch trùng ngày/ca không?
                    const hasConflict = schedules.some(sch =>
                      sch.doctorId === d.id &&
                      sch.date === req.date &&
                      sch.startTime?.slice(0,5) === req.timeSlot?.slice(0,5)
                    );
                    return !hasConflict;
                  }).map(d => (
                    <option key={d.id} value={d.id}>{d.fullName}</option>
                  ));
                })()}
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Ghi chú (tuỳ chọn): </label>
              <input type="text" value={approveModal.adminNote} onChange={e => setApproveModal(m => ({ ...m, adminNote: e.target.value }))} style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setApproveModal({ open: false, requestId: null, substituteDoctorId: '', adminNote: '' })} style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>Hủy</button>
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>Duyệt</button>
            </div>
          </form>
        </div>
      )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorScheduleRequestApproval;
