import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaUser, FaStethoscope, FaFilter, FaSearch } from 'react-icons/fa';
import FeedbackButton from '../Feedback/FeedbackButton';
import './MyAppointments.scss';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMyAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [appointments, statusFilter, searchTerm]);

    const fetchMyAppointments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/appointments/my-appointments', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Không thể tải danh sách lịch hẹn');
            }

            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            setError(error.message);
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        let filtered = [...appointments];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(appointment => 
                appointment.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(appointment =>
                appointment.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => {
            const dateA = new Date(a.appointmentDate + 'T' + a.appointmentTime);
            const dateB = new Date(b.appointmentDate + 'T' + b.appointmentTime);
            return dateB - dateA;
        });

        setFilteredAppointments(filtered);
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'confirmed';
            case 'pending': return 'pending';
            case 'completed': return 'completed';
            case 'cancelled': return 'cancelled';
            case 'checked_in': return 'checked-in';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed': return 'Đã xác nhận';
            case 'pending': return 'Chờ xác nhận';
            case 'completed': return 'Hoàn thành';
            case 'cancelled': return 'Đã hủy';
            case 'checked_in': return 'Đã check-in';
            default: return status;
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        return timeString?.substring(0, 5) || '';
    };

    if (loading) {
        return (
            <div className="my-appointments-loading">
                <div className="loading-spinner"></div>
                <p>Đang tải danh sách lịch hẹn...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-appointments-error">
                <p>{error}</p>
                <button onClick={fetchMyAppointments}>Thử lại</button>
            </div>
        );
    }

    return (
        <div className="my-appointments-container">
            <div className="my-appointments-header">
                <h2>📅 Lịch hẹn của tôi</h2>
                <p>Quản lý và theo dõi các lịch hẹn khám bệnh</p>
            </div>

            <div className="appointments-filters">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo bác sĩ, dịch vụ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="status-filter">
                    <FaFilter className="filter-icon" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="checked_in">Đã check-in</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                    </select>
                </div>
            </div>

            <div className="appointments-stats">
                <div className="stat-item">
                    <span className="stat-number">{appointments.length}</span>
                    <span className="stat-label">Tổng lịch hẹn</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {appointments.filter(a => a.status?.toLowerCase() === 'completed').length}
                    </span>
                    <span className="stat-label">Đã hoàn thành</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {appointments.filter(a => ['pending', 'confirmed', 'checked_in'].includes(a.status?.toLowerCase())).length}
                    </span>
                    <span className="stat-label">Sắp tới</span>
                </div>
            </div>

            <div className="appointments-list">
                {filteredAppointments.length === 0 ? (
                    <div className="no-appointments">
                        <div className="no-appointments-icon">📅</div>
                        <p>Không tìm thấy lịch hẹn nào</p>
                    </div>
                ) : (
                    filteredAppointments.map(appointment => (
                        <div key={appointment.id} className="appointment-card">
                            <div className="appointment-header">
                                <div className="appointment-date-time">
                                    <div className="date">
                                        <FaCalendarAlt />
                                        <span>{formatDate(appointment.appointmentDate)}</span>
                                    </div>
                                    <div className="time">
                                        <FaClock />
                                        <span>{formatTime(appointment.appointmentTime)}</span>
                                    </div>
                                </div>
                                <div className={`appointment-status ${getStatusColor(appointment.status)}`}>
                                    {getStatusText(appointment.status)}
                                </div>
                            </div>

                            <div className="appointment-content">
                                <div className="appointment-info">
                                    <div className="info-item">
                                        <FaUser className="info-icon" />
                                        <span className="info-label">Bác sĩ:</span>
                                        <span className="info-value">{appointment.doctorName || 'Chưa cập nhật'}</span>
                                    </div>
                                    <div className="info-item">
                                        <FaStethoscope className="info-icon" />
                                        <span className="info-label">Dịch vụ:</span>
                                        <span className="info-value">{appointment.serviceName || 'Chưa cập nhật'}</span>
                                    </div>
                                    {appointment.notes && (
                                        <div className="info-item notes">
                                            <span className="info-label">Ghi chú:</span>
                                            <span className="info-value">{appointment.notes}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="appointment-actions">
                                <FeedbackButton
                                    key={`feedback-${appointment.id}`}
                                    appointmentId={appointment.id}
                                    appointmentStatus={appointment.status}
                                    userRole="PATIENT"
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
