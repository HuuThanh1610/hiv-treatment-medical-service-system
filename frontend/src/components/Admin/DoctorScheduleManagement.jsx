// Parse 'YYYY-MM-DD' as local date (not UTC)
function parseLocalDate(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DoctorService from '../../Services/DoctorService';
import api from '../../Services/api';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '14:00', '15:00', '16:00'
];

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  if (day !== 1) d.setHours(-24 * (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatVNDate(date) {
  return `${date.getDate()}/${date.getMonth() + 1}`;
}

const DoctorScheduleManagement = () => {

  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [currentWeek, setCurrentWeek] = useState(getStartOfWeek(new Date()));
  // Modal sửa
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  // Xác nhận xóa
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, schedule: null });
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const [doctorRes, scheduleRes] = await Promise.all([
        DoctorService.getAllDoctors(token),
        axios.get('http://localhost:8080/api/doctors/schedules', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setDoctors(doctorRes);
      setSchedules(scheduleRes.data);
    } catch (err) {
      setError('Không thể tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Lọc lịch theo bác sĩ và tuần hiện tại
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const filteredSchedules = schedules.filter(sch => {
    if (selectedDoctorId && String(sch.doctorId) !== String(selectedDoctorId)) return false;
    if (!(sch.status === 'ACTIVE' || sch.status === 'CANCELLED' || sch.status === 'INACTIVE')) return false;
    const schDate = parseLocalDate(sch.date);
    return schDate >= currentWeek && schDate < addDays(currentWeek, 7);
  });

  // Tạo map: {date: {time: schedule}} với chuẩn hóa date và time
  function normalizeDate(dateStr) {
    // Lấy đúng yyyy-mm-dd
    return dateStr ? dateStr.slice(0, 10) : '';
  }
  function normalizeTime(timeStr) {
    // Lấy đúng HH:mm
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  }
  const scheduleMap = {};
  filteredSchedules.forEach(sch => {
    const d = normalizeDate(sch.date);
    const t = normalizeTime(sch.startTime);
    if (!scheduleMap[d]) scheduleMap[d] = {};
    scheduleMap[d][t] = sch;
  });

  const weekLabel = `${formatVNDate(weekDates[0])} - ${formatVNDate(weekDates[6])}/${weekDates[6].getFullYear()}`;

  // Hàm render bảng thời gian biểu cho 1 bác sĩ
  // Xử lý lưu lịch sửa
  const handleEdit = (sch) => {
    setEditModal({ open: true, schedule: { ...sch } });
  };
  // Xử lý lưu lịch xóa
  const handleDelete = (sch) => {
    setDeleteConfirm({ open: true, schedule: sch });
  };

  // Gửi API cập nhật lịch
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/doctor-schedules/${editModal.schedule.id}`, editModal.schedule);
      setEditModal({ open: false, schedule: null });
      fetchData();
    } catch (err) {
      alert('Cập nhật lịch thất bại!');
    }
  };

  // Cập nhật status INACTIVE/ACTIVE thay vì xóa thật
  const handleDeleteConfirm = async () => {
    try {
      if (deleteConfirm.schedule.status === 'INACTIVE') {
        // Use dedicated restore API
        await api.put(`/api/doctor-schedules/restore/${deleteConfirm.schedule.id}`);
      } else {
        // Set status to INACTIVE using update API
        await api.put(`/api/doctor-schedules/${deleteConfirm.schedule.id}`, {
          ...deleteConfirm.schedule,
          status: 'INACTIVE'
        });
      }
      setDeleteConfirm({ open: false, schedule: null });
      fetchData();
    } catch (err) {
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  const renderScheduleTable = (doctorId, doctorName) => {
    // Lọc lịch của bác sĩ này
    const doctorSchedules = filteredSchedules.filter(sch => String(sch.doctorId) === String(doctorId));
    // Tạo map: {date: {time: [schedules]}}
    const scheduleMapDoctor = {};
    doctorSchedules.forEach(sch => {
      const d = normalizeDate(sch.date);
      const t = normalizeTime(sch.startTime);
      if (!scheduleMapDoctor[d]) scheduleMapDoctor[d] = {};
      if (!scheduleMapDoctor[d][t]) scheduleMapDoctor[d][t] = [];
      scheduleMapDoctor[d][t].push(sch);
    });
    return (
      <div key={doctorId} style={{ marginBottom: 48, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ textAlign: 'center', margin: 20, color: '#1565c0', fontWeight: 700, fontSize: 22, letterSpacing: 0.5, textTransform: 'uppercase' }}>{doctorName}</h3>
        <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          <div style={{ overflowX: 'auto', background: '#f8fafd', borderRadius: 16, padding: 24, boxShadow: '0 4px 24px 0 rgba(60,72,88,0.10)', width: '100%' }}>
            <table style={{ width: '100%', maxWidth: 1000, minWidth: 600, tableLayout: 'fixed', borderCollapse: 'separate', borderSpacing: 0, background: '#fff', margin: '0 auto', borderRadius: 16, boxShadow: '0 2px 8px 0 rgba(60,72,88,0.08)', overflow: 'hidden' }}>
              <thead>
                <tr>
                  <th style={{ width: 90, background: '#e3f2fd', color: '#1976d2', fontWeight: 700, fontSize: 15, borderTopLeftRadius: 12, borderBottom: '2px solid #90caf9' }}>Thời gian</th>
                  {weekDates.map((d, idx) => (
                    <th key={idx} style={{ background: idx === (new Date().getDay() + 6) % 7 ? '#ffe0b2' : '#e3f2fd', textAlign: 'center', color: '#1976d2', fontWeight: 700, fontSize: 15, borderBottom: '2px solid #90caf9' }}>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][idx]}<div style={{ fontSize: 13, color: '#333', fontWeight: 400 }}>{formatVNDate(d)}</div></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((slot, slotIdx) => (
                  <tr key={slot}>
                    <td style={{ fontWeight: 600, background: '#e3f2fd', textAlign: 'center', color: '#1976d2', fontSize: 15, borderLeft: slotIdx === 0 ? 'none' : '1px solid #e3f2fd' }}>{slot}</td>
                    {weekDates.map((d, idx) => {
                      // Dùng local date string để tránh lệch ngày
                      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                      const schList = scheduleMapDoctor[dateStr]?.[slot] || [];
                      return (
                        <td key={idx} style={{ minWidth: 120, height: 60, background: schList.length > 0 ? '#fff8e1' : '#f9f9f9', border: '1px solid #e3e3e3', verticalAlign: 'top', padding: 8, textAlign: 'center', borderRadius: 6 }}>
                          {schList.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {schList.map((sch, i) => (
                                <div key={sch.id} style={{ border: '1px solid #e0e0e0', borderRadius: 8, padding: 6, marginBottom: 2, background: '#fff' }}>
                                  {sch.patientName && <div style={{ fontWeight: 600, color: '#d84315', fontSize: 15, marginBottom: 2 }}>Lịch hẹn với bệnh nhân: {sch.patientName}</div>}
                                  <div style={{ fontWeight: 600, color: '#e65100', fontSize: 14 }}>{sch.notes || 'Ca trực'}</div>
                                  <div style={{ marginTop: 4 }}>
                                    <span style={{
                                      display: 'inline-block',
                                      padding: '2px 8px',
                                      borderRadius: 8,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      background: sch.status === 'ACTIVE' ? '#c8e6c9' : sch.status === 'INACTIVE' ? '#ffe0b2' : '#ffcdd2',
                                      color: sch.status === 'ACTIVE' ? '#256029' : sch.status === 'INACTIVE' ? '#a67c00' : '#b71c1c',
                                    }}>
                                      {sch.status === 'ACTIVE' ? 'Hoạt động' : sch.status === 'INACTIVE' ? 'Đã xóa' : sch.status === 'CANCELLED' ? 'Đã hủy' : sch.status}
                                    </span>
                                  </div>
                                  <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'center' }}>
                                    <button onClick={() => handleEdit(sch)} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 500, boxShadow: '0 1px 4px 0 #90caf9' }}>Sửa</button>
                                    <button onClick={() => handleDelete(sch)} style={{ background: sch.status === 'INACTIVE' ? '#43a047' : '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '4px 14px', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
                                      {sch.status === 'INACTIVE' ? 'Khôi phục' : 'Xóa'}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#b0b0b0', fontWeight: 500, fontSize: 15 }}>Trống</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 8 }}>Thời gian biểu bác sĩ</h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16, gap: 16 }}>
        <button onClick={() => setCurrentWeek(addDays(currentWeek, -7))} style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{'< Tuần trước'}</button>
        <span style={{ minWidth: 220, textAlign: 'center', fontWeight: 600, fontSize: 18, display: 'inline-block' }}>{weekLabel}</span>
        <button onClick={() => setCurrentWeek(addDays(currentWeek, 7))} style={{ padding: '8px 22px', borderRadius: 8, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>{'Tuần sau >'}</button>
      </div>
      <div style={{ margin: '16px 0', textAlign: 'center' }}>
        <label>Chọn bác sĩ: </label>
        <select value={selectedDoctorId} onChange={e => setSelectedDoctorId(e.target.value)}>
          <option value=''>-- Chọn bác sĩ --</option>
          {doctors.map(doc => (
            <option key={doc.id} value={doc.id}>{doc.fullName}</option>
          ))}
        </select>
      </div>
      {loading && <div>Đang tải dữ liệu...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {selectedDoctorId ? (
        renderScheduleTable(selectedDoctorId, doctors.find(d => String(d.id) === String(selectedDoctorId))?.fullName || '')
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '16px' }}>
          <p>Vui lòng chọn bác sĩ để xem lịch làm việc</p>
        </div>
      )}

      {/* Modal sửa lịch */}
      {editModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleEditSubmit} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px 0 rgba(60,72,88,0.18)' }}>
            <h3 style={{ marginBottom: 18, color: '#1976d2' }}>Sửa lịch bác sĩ</h3>
            <div style={{ marginBottom: 12 }}>
              <label>Ngày: </label>
              <input type="date" value={editModal.schedule.date?.slice(0,10) || ''} onChange={e => setEditModal(modal => ({ ...modal, schedule: { ...modal.schedule, date: e.target.value } }))} required />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Giờ bắt đầu: </label>
              <input type="time" value={editModal.schedule.startTime?.slice(0,5) || ''} onChange={e => setEditModal(modal => ({ ...modal, schedule: { ...modal.schedule, startTime: e.target.value } }))} required />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Giờ kết thúc: </label>
              <input type="time" value={editModal.schedule.endTime?.slice(0,5) || ''} onChange={e => setEditModal(modal => ({ ...modal, schedule: { ...modal.schedule, endTime: e.target.value } }))} required />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Địa điểm: </label>
              {/* <input type="text" value={editModal.schedule.location || ''} onChange={e => setEditModal(modal => ({ ...modal, schedule: { ...modal.schedule, location: e.target.value } }))} /> */}
            </div>
            <div style={{ marginBottom: 12 }}>
              <label>Ghi chú: </label>
              <input type="text" value={editModal.schedule.notes || ''} onChange={e => setEditModal(modal => ({ ...modal, schedule: { ...modal.schedule, notes: e.target.value } }))} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setEditModal({ open: false, schedule: null })} style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>Hủy</button>
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>Lưu</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {deleteConfirm.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 4px 24px 0 rgba(60,72,88,0.18)' }}>
            <h3 style={{ color: '#e53935', marginBottom: 18 }}>Cập nhật trạng thái lịch</h3>
            <div style={{ marginBottom: 18 }}>
              {deleteConfirm.schedule?.status === 'INACTIVE'
                ? 'Bạn có muốn khôi phục lịch này thành Hoạt động?'
                : 'Bạn có chắc chắn muốn chuyển lịch này sang trạng thái Đã xóa?'}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm({ open: false, schedule: null })} style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>Hủy</button>
              <button onClick={handleDeleteConfirm} style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>
                {deleteConfirm.schedule?.status === 'INACTIVE' ? 'Khôi phục' : 'Chuyển sang Đã xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorScheduleManagement;
