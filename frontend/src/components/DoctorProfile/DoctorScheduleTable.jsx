import React from 'react';
import DoctorScheduleService from '../../Services/DoctorScheduleService';
import DoctorScheduleRequestService from '../../Services/DoctorScheduleRequestService';
import DoctorService from '../../Services/DoctorService';

// Helper functions
function parseLocalDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}
function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - ((day === 0 ? 7 : day) - 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
}
function getWeekDates(startDate) {
    const week = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(startDate.getTime() + i * 86400000);
        week.push(d);
    }
    return week;
}

const TIME_SLOTS = [
    { label: '08:00', value: '08:00:00' },
    { label: '09:00', value: '09:00:00' },
    { label: '10:00', value: '10:00:00' },
    { label: '14:00', value: '14:00:00' },
    { label: '15:00', value: '15:00:00' },
    { label: '16:00', value: '16:00:00' },
];
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COLORS = ['#ffe5b4', '#e0e7ff', '#b4f0ff', '#ffd6e0', '#d1ffd6', '#fff7b4', '#f3e0ff'];

const DoctorScheduleTable = () => {
    const [schedules, setSchedules] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [requestFormOpen, setRequestFormOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState('');
    const [selectedSlot, setSelectedSlot] = React.useState('');
    const [reason, setReason] = React.useState('');
    const [successMsg, setSuccessMsg] = React.useState('');
    const today = new Date();
    const [weekStart, setWeekStart] = React.useState(getStartOfWeek(today));
    // Remove statusFilter, always show ACTIVE and CANCELLED

    React.useEffect(() => {
        const fetchSchedules = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                // Lấy tất cả lịch, không lọc theo status
                const data = await DoctorScheduleService.getMySchedule(token, '');
                setSchedules(Array.isArray(data) ? data : []);
            } catch {
                setError('Không thể tải lịch làm việc');
            }
            setLoading(false);
        };
        fetchSchedules();
    }, [weekStart]);
    // Không cần UI chọn trạng thái

    const handlePrevWeek = () => setWeekStart(prev => new Date(prev.getTime() - 7 * 86400000));
    const handleNextWeek = () => setWeekStart(prev => new Date(prev.getTime() + 7 * 86400000));
    const weekDates = getWeekDates(weekStart);

    const getCellSchedules = (date, slot) => {
        return schedules.filter(s => {
            const d = parseLocalDate(s.date);
            return (s.status === 'ACTIVE' || s.status === 'CANCELLED') && d.getTime() === date.getTime() && s.startTime?.slice(0, 5) === slot.slice(0, 5);
        });
    };
    const slotsThisWeek = schedules.filter(s => {
        const d = parseLocalDate(s.date);
        return (s.status === 'ACTIVE' || s.status === 'CANCELLED') && d >= weekStart && d < new Date(weekStart.getTime() + 7 * 86400000);
    });
    
    // Filter only ACTIVE schedules for leave request form (future dates only, no week limitation)
    const todayForComparison = new Date();
    todayForComparison.setHours(0, 0, 0, 0); // Reset time to start of day for comparison
    
    const activeSlotsForLeaveRequest = schedules.filter(s => {
        const d = parseLocalDate(s.date);
        return s.status === 'ACTIVE' && d >= todayForComparison;
    }).sort((a, b) => {
        // Sort by date first, then by start time
        const dateA = parseLocalDate(a.date);
        const dateB = parseLocalDate(b.date);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
        }
        return a.startTime.localeCompare(b.startTime);
    });
    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!selectedSlot || !reason) return;
        
        const slotObj = schedules.find(s => s.id === Number(selectedSlot));
        if (!slotObj) {
            setError('Không tìm thấy ca làm việc được chọn');
            return;
        }
        
        // Validate that the selected schedule is ACTIVE
        if (slotObj.status !== 'ACTIVE') {
            setError('Chỉ có thể gửi yêu cầu nghỉ cho ca có trạng thái ACTIVE');
            return;
        }
        
        try {
            setLoading(true);
            setError(null);
            
            // Get current doctor's information
            const doctorResponse = await DoctorService.getCurrentDoctor();
            const doctorId = doctorResponse.data.id;
            
            // Create the leave request
            const requestData = {
                scheduleId: slotObj.id,
                doctorId: doctorId,
                reason: reason
            };
            
            await DoctorScheduleRequestService.createRequest(requestData);
            
            // Show success message and reset form
            setSuccessMsg('Đã gửi yêu cầu xin nghỉ thành công!');
            setRequestFormOpen(false);
            setSelectedSlot('');
            setReason('');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(''), 3000);
            
        } catch (error) {
            console.error('Error sending leave request:', error);
            setError('Không thể gửi yêu cầu xin nghỉ. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="doctor-schedule-container" style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
            <div className="schedule-header" style={{ textAlign: 'center', marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 700, color: '#1976d2', margin: 0, marginBottom: 8 }}>📅 Lịch làm việc của tôi</h2>
                <p style={{ color: '#666', fontSize: 16, margin: 0 }}>Quản lý thời gian biểu và gửi yêu cầu xin nghỉ</p>
            </div>

            <div className="schedule-actions" style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <button
                    onClick={() => setRequestFormOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '12px 24px',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                    onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.target.style.transform = 'translateY(0)'}
                >
                    📝 Gửi yêu cầu xin nghỉ
                </button>
            </div>

            <div className="week-navigation" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 24, gap: 20 }}>
                <button
                    onClick={handlePrevWeek}
                    style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    ← Tuần trước
                </button>
                <div className="week-label" style={{
                    minWidth: 280,
                    textAlign: 'center',
                    fontWeight: 700,
                    fontSize: 20,
                    color: '#1976d2',
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    padding: '12px 24px',
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {weekDates[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {weekDates[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
                <button
                    onClick={handleNextWeek}
                    style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: 'none',
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    Tuần sau →
                </button>
            </div>
            <div className="schedule-table-container" style={{
                display: 'flex',
                justifyContent: 'center',
                background: '#fff',
                borderRadius: 16,
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                padding: 32,
                margin: '0 auto',
                maxWidth: 1200,
                border: '1px solid #e3f2fd'
            }}>
                <table style={{
                    width: '100%',
                    maxWidth: 1100,
                    minWidth: 800,
                    tableLayout: 'fixed',
                    borderCollapse: 'separate',
                    borderSpacing: 0,
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                }}>
                    <thead>
                        <tr>
                            <th style={{
                                minWidth: 100,
                                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: 16,
                                textAlign: 'center',
                                padding: '16px 8px',
                                borderTopLeftRadius: 12
                            }}>
                                ⏰ Ca/Ngày
                            </th>
                            {weekDates.map((date, idx) => {
                                const isToday = date.toDateString() === today.toDateString();
                                const isLastColumn = idx === weekDates.length - 1;
                                return (
                                    <th
                                        key={idx}
                                        style={{
                                            minWidth: 120,
                                            background: isToday
                                                ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                                                : 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                            color: isToday ? '#fff' : '#1976d2',
                                            fontWeight: 700,
                                            fontSize: 16,
                                            textAlign: 'center',
                                            padding: '16px 8px',
                                            borderTopRightRadius: isLastColumn ? 12 : 0,
                                            position: 'relative'
                                        }}
                                    >
                                        <div style={{ fontSize: 16, marginBottom: 4 }}>{WEEK_DAYS[idx]}</div>
                                        <div style={{ fontSize: 14, fontWeight: 500, opacity: 0.9 }}>
                                            {date.getDate()}/{date.getMonth() + 1}
                                        </div>
                                        {isToday && (
                                            <div style={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                background: 'rgba(255,255,255,0.3)',
                                                borderRadius: '50%',
                                                width: 8,
                                                height: 8
                                            }}></div>
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {TIME_SLOTS.map((slot, slotIdx) => (
                            <tr key={slot.value}>
                                <td style={{
                                    fontWeight: 600,
                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                    color: '#1976d2',
                                    textAlign: 'center',
                                    fontSize: 16,
                                    padding: '16px 8px',
                                    borderLeft: slotIdx === 0 ? 'none' : '1px solid #e3f2fd'
                                }}>
                                    🕐 {slot.label}
                                </td>
                                {weekDates.map((date, idx) => {
                                    const isToday = date.toDateString() === today.toDateString();
                                    const cellSchedules = getCellSchedules(date, slot.value);
                                    return (
                                        <td
                                            key={idx}
                                            style={{
                                                minHeight: 70,
                                                border: '1px solid #e5e7eb',
                                                verticalAlign: 'top',
                                                background: isToday ? '#fff7e6' : '#fff',
                                                padding: 6,
                                                borderRadius: isToday ? 10 : 0,
                                                position: 'relative'
                                            }}
                                        >
                                            {cellSchedules.length === 0 ? (
                                                <span style={{ color: '#bbb', fontSize: 13 }}>Trống</span>
                                            ) : (
                                                cellSchedules.map((sch, i) => (
                                                    <div
                                                        key={sch.id}
                                                        style={{
                                                            background: COLORS[i % COLORS.length],
                                                            borderRadius: 8,
                                                            marginBottom: 4,
                                                            padding: '6px 8px',
                                                            fontSize: 14,
                                                            color: '#333',
                                                            boxShadow: '0 2px 6px #0001',
                                                            fontWeight: 500,
                                                            transition: 'box-shadow 0.2s',
                                                            border: '1px solid #f3f4f6',
                                                            position: 'relative',
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: 600 }}>Ca trực</div>
                                                        {sch.notes && <div style={{ fontSize: 12, color: '#555' }}>{sch.notes}</div>}
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
                                                    </div>
                                                ))
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {loading && <div>Đang tải thời gian biểu...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {successMsg && <div style={{ color: 'green', marginTop: 12 }}>{successMsg}</div>}
            {requestFormOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleSendRequest} style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 4px 24px 0 rgba(60,72,88,0.18)' }}>
                        <h3 style={{ marginBottom: 18, color: '#1976d2' }}>Gửi yêu cầu xin nghỉ</h3>
                        <div style={{ marginBottom: 12 }}>
                            <label>Chọn ngày nghỉ: </label>
                            <select value={selectedDate || ''} onChange={e => { setSelectedDate(e.target.value); setSelectedSlot(''); }} style={{width:'100%',padding:6,borderRadius:4,border:'1px solid #ccc'}}>
                                <option value=''>-- Chọn ngày --</option>
                                {Array.from(new Set(schedules.filter(s => s.status === 'ACTIVE' && new Date(s.date) >= new Date().setHours(0,0,0,0)).map(s => s.date))).map(date => (
                                    <option key={date} value={date}>{date}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label>Chọn ca cần nghỉ: </label>
                            <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)} required style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} disabled={!selectedDate}>
                                <option value=''>-- Chọn ca --</option>
                                {schedules.filter(s => s.status === 'ACTIVE' && s.date === selectedDate).length > 0 ? (
                                    schedules.filter(s => s.status === 'ACTIVE' && s.date === selectedDate).map(s => (
                                        <option key={s.id} value={s.id}>{s.startTime?.slice(0,5)} - {s.endTime?.slice(0,5)}</option>
                                    ))
                                ) : (
                                    <option value='' disabled>Không có ca nào</option>
                                )}
                            </select>
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label>Lý do: </label>
                            <input type="text" value={reason} onChange={e => setReason(e.target.value)} required style={{ width: '100%', padding: 6, borderRadius: 4, border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setRequestFormOpen(false)} style={{ background: '#bdbdbd', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 18px', cursor: 'pointer' }}>Hủy</button>
                            <button 
                                type="submit" 
                                disabled={activeSlotsForLeaveRequest.length === 0 || !selectedSlot || !reason}
                                style={{ 
                                    background: (activeSlotsForLeaveRequest.length === 0 || !selectedSlot || !reason) ? '#ccc' : '#1976d2', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 4, 
                                    padding: '6px 18px', 
                                    cursor: (activeSlotsForLeaveRequest.length === 0 || !selectedSlot || !reason) ? 'not-allowed' : 'pointer' 
                                }}
                            >
                                Gửi
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default DoctorScheduleTable;