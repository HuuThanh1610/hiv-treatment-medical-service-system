import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AppointmentStatusTable.scss';
import { toast } from 'react-toastify';
import { FaEdit, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import AppointmentService from '../../Services/AppointmentService';

const AppointmentStatusTable = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingStatus, setUpdatingStatus] = useState(null);
    const [selectedTab, setSelectedTab] = useState('all');

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/appointments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (err) {
            setError('Không thể tải danh sách cuộc hẹn.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const getDisplayStatus = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Sắp diễn ra';
            case 'CHECKED_IN':
                return 'Đã đến khám';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELED':
            case 'CANCELLED':
                return 'Đã hủy';
            case 'NO_SHOW':
                return 'Vắng mặt';
            default:
                return status;
        }
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            setUpdatingStatus(appointmentId);
            await AppointmentService.updateStatus(appointmentId, newStatus);
            setAppointments(prevAppointments =>
                prevAppointments.map(appt =>
                    appt.id === appointmentId
                        ? { ...appt, status: newStatus }
                        : appt
                )
            );
            toast.success('Cập nhật trạng thái lịch hẹn thành công!');
        } catch (err) {
            console.error('Lỗi khi cập nhật trạng thái:', err);
            toast.error(err.response?.data?.message || 'Cập nhật trạng thái thất bại!');
        } finally {
            setUpdatingStatus(null);
        }
    };

    // Filter logic
    const filteredAppointments = appointments.map(appt => ({
        ...appt,
        displayStatus: getDisplayStatus(appt.status)
    })).filter(appt => {
        const search = searchTerm.toLowerCase();
        return (
            appt.patientName?.toLowerCase().includes(search) ||
            appt.doctorName?.toLowerCase().includes(search) ||
            appt.medicalServiceName?.toLowerCase().includes(search) ||
            appt.displayStatus?.toLowerCase().includes(search)
        );
    });

    const tabFilteredAppointments = filteredAppointments.filter(appt => {
        switch (selectedTab) {
            case 'all':
                return true;
            case 'pending':
                return appt.status === 'PENDING';
            case 'confirmed':
                return appt.status === 'CONFIRMED';
            case 'checked_in':
                return appt.status === 'CHECKED_IN';
            case 'completed':
                return appt.status === 'COMPLETED';
            case 'cancelled':
                return appt.status === 'CANCELLED';
            case 'no_show':
                return appt.status === 'NO_SHOW';
            default:
                return true;
        }
    });

    const getStatusClass = (displayStatus) => {
        switch (displayStatus) {
            case 'Chờ xác nhận':
                return 'pending';
            case 'Sắp diễn ra':
                return 'upcoming';
            case 'Đã đến khám':
                return 'checked-in';
            case 'Hoàn thành':
                return 'finished';
            case 'Đã hủy':
                return 'canceled';
            case 'Vắng mặt':
                return 'no-show';
            default:
                return '';
        }
    };

    const getStatusOptions = (currentStatus) => {
        // Các trạng thái mới theo backend
        const allStatuses = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
        return allStatuses.filter(status => status !== currentStatus);
    };

    return (
        <div className="appointment-status-table">
            <div className="table-header">
                <h2>Trạng thái cuộc hẹn</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ, dịch vụ, trạng thái..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div style={{ display: 'flex', gap: '8px', background: '#f5f5f5', padding: '4px', borderRadius: '6px', marginBottom: '1rem', width: 'fit-content' }}>
                <button onClick={() => setSelectedTab('all')} style={{ background: selectedTab === 'all' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'all' ? 'bold' : 'normal', color: selectedTab === 'all' ? '#000' : '#555', cursor: 'pointer' }}>Tất cả</button>
                <button onClick={() => setSelectedTab('pending')} style={{ background: selectedTab === 'pending' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'pending' ? 'bold' : 'normal', color: selectedTab === 'pending' ? '#000' : '#555', cursor: 'pointer' }}>Chờ xác nhận</button>
                <button onClick={() => setSelectedTab('confirmed')} style={{ background: selectedTab === 'confirmed' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'confirmed' ? 'bold' : 'normal', color: selectedTab === 'confirmed' ? '#000' : '#555', cursor: 'pointer' }}>Đã xác nhận</button>
                <button onClick={() => setSelectedTab('checked_in')} style={{ background: selectedTab === 'checked_in' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'checked_in' ? 'bold' : 'normal', color: selectedTab === 'checked_in' ? '#000' : '#555', cursor: 'pointer' }}>Đã đến khám</button>
                <button onClick={() => setSelectedTab('completed')} style={{ background: selectedTab === 'completed' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'completed' ? 'bold' : 'normal', color: selectedTab === 'completed' ? '#000' : '#555', cursor: 'pointer' }}>Hoàn thành</button>
                <button onClick={() => setSelectedTab('cancelled')} style={{ background: selectedTab === 'cancelled' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'cancelled' ? 'bold' : 'normal', color: selectedTab === 'cancelled' ? '#000' : '#555', cursor: 'pointer' }}>Đã hủy</button>
                <button onClick={() => setSelectedTab('no_show')} style={{ background: selectedTab === 'no_show' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'no_show' ? 'bold' : 'normal', color: selectedTab === 'no_show' ? '#000' : '#555', cursor: 'pointer' }}>Vắng mặt</button>
            </div>
            {loading && <div>Đang tải...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && (
                <table>
                    <thead>
                        <tr>
                            <th>Tên bệnh nhân</th>
                            <th>Tên bác sĩ</th>
                            <th>Bác sĩ thay thế</th>
                            <th>Dịch vụ</th>
                            <th>Thời gian</th>
                            <th>Ghi chú</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tabFilteredAppointments.map((appt) => (
                            <tr key={appt.id}>
                                <td>{appt.patientName}</td>
                                <td>{appt.doctorName}</td>
                                <td>{appt.substituteDoctorName || <span style={{color:'#aaa'}}>Không có</span>}</td>
                                <td>{appt.medicalServiceName}</td>
                                <td>{`${appt.appointmentTime}, ${new Date(appt.appointmentDate).toLocaleDateString()}`}</td>
                                <td>{appt.notes}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(appt.displayStatus)}`}>
                                        {appt.displayStatus}
                                    </span>
                                </td>
                                <td>
                                    {updatingStatus === appt.id ? (
                                        <span>Đang cập nhật...</span>
                                    ) : (
                                        <select
                                            value=""
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleStatusChange(appt.id, e.target.value);
                                                    e.target.value = '';
                                                }
                                            }}
                                            disabled={updatingStatus !== null}
                                            className="status-select"
                                        >
                                            <option value="">Thay đổi trạng thái</option>
                                            {getStatusOptions(appt.status).map(status => (
                                                <option key={status} value={status}>
                                                    {status === 'PENDING' ? 'Chờ xác nhận'
                                                        : status === 'CONFIRMED' ? 'Đã xác nhận'
                                                        : status === 'CHECKED_IN' ? 'Đã đến khám'
                                                        : status === 'COMPLETED' ? 'Hoàn thành'
                                                        : status === 'CANCELLED' ? 'Đã hủy'
                                                        : status === 'NO_SHOW' ? 'Vắng mặt'
                                                        : status}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {tabFilteredAppointments.length === 0 && (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>Không có cuộc hẹn nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AppointmentStatusTable;