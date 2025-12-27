import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './DoctorAppointmentTable.scss';
import { LuUserRound } from "react-icons/lu";
import { HiOutlineDocumentSearch } from "react-icons/hi";
import { FaCheck, FaTimes, FaEye, FaUserMd, FaCalendarCheck } from "react-icons/fa";

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const formatAppointmentDateTime = (date, time) => {
    if (!date || !time) return 'N/A';
    const dateTimeString = `${date}T${time}`;
    return formatDate(dateTimeString);
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'PENDING':
            return 'Chờ xác nhận';
        case 'CONFIRMED':
            return 'Đã xác nhận';
        case 'CANCELLED':
            return 'Đã huỷ';
        case 'COMPLETED':
            return 'Đã hoàn thành';
        case 'CHECKED_IN':
            return 'Đã check-in';
        case 'NO_SHOW':
            return 'Vắng mặt';
        default:
            return status;
    }
};

const DoctorAppointmentTable = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const [detailModal, setDetailModal] = useState({ show: false, appointment: null });
    const [updateLoading, setUpdateLoading] = useState(false);

    // Function để cập nhật trạng thái lịch hẹn
    const updateAppointmentStatus = async (appointmentId, newStatus) => {
        setUpdateLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log('Updating appointment:', appointmentId, 'to status:', newStatus);
            
            const response = await axios.patch(`http://localhost:8080/api/appointments/${appointmentId}/status`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Update response:', response.data);
            
            // Reload appointments để cập nhật giao diện
            fetchAppointments();
            
            // Đóng modal nếu đang mở
            setDetailModal({ show: false, appointment: null });
            
            // Thông báo thành công với toast
            toast.success(`Đã cập nhật trạng thái lịch hẹn thành: ${getStatusLabel(newStatus)}`);
        } catch (error) {
            console.error('Error updating appointment status:', error);
            console.error('Error response data:', error.response?.data);
            console.error('Error response status:', error.response?.status);
            console.error('Error response headers:', error.response?.headers);
            
            const errorMessage = error.response?.data?.message || error.response?.data || 'Có lỗi xảy ra khi cập nhật trạng thái lịch hẹn';
            toast.error(`Lỗi: ${errorMessage}`);
        } finally {
            setUpdateLoading(false);
        }
    };

    // Function để xác nhận trước khi đánh dấu vắng mặt
    const handleNoShowConfirmation = (appointmentId) => {
        if (window.confirm('Xác nhận bệnh nhân vắng mặt? Hành động này không thể hoàn tác.')) {
            updateAppointmentStatus(appointmentId, 'NO_SHOW');
        }
    };

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found.');
            }
            const response = await axios.get('http://localhost:8080/api/appointments/my-doctor-appointments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
        } catch (err) {
            setError('Không thể tải lịch sử cuộc hẹn.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab]);

    // Hiển thị trạng thái giống trang staff
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

    const filteredAppointments = appointments.map(appt => ({
        ...appt,
        displayStatus: getDisplayStatus(appt.status)
    })).filter(appt => {
        const search = searchTerm.toLowerCase();
        return (
            appt.patientName.toLowerCase().includes(search) ||
            appt.medicalServiceName.toLowerCase().includes(search) ||
            appt.displayStatus.toLowerCase().includes(search)
        );
    });

    // Filter by new status enums only (không lọc cứng status)
    const tabFilteredAppointments = filteredAppointments.filter(appt => {
        if (selectedTab === 'all') return true;
        if (selectedTab === 'PENDING') return appt.status === 'PENDING';
        if (selectedTab === 'CONFIRMED') return appt.status === 'CONFIRMED';
        if (selectedTab === 'CHECKED_IN') return appt.status === 'CHECKED_IN';
        if (selectedTab === 'COMPLETED') return appt.status === 'COMPLETED';
        if (selectedTab === 'CANCELLED') return appt.status === 'CANCELLED';
        if (selectedTab === 'NO_SHOW') return appt.status === 'NO_SHOW';
        return true;
    });

    const totalPages = Math.ceil(tabFilteredAppointments.length / itemsPerPage);

    const paginatedAppointments = tabFilteredAppointments.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getStatusClass = (status) => {
        switch (status) {
            case 'Sắp diễn ra':
                return 'upcoming';
            case 'Đang diễn ra':
                return 'ongoing';
            case 'Hoàn thành':
                return 'completed';
            default:
                return '';
        }
    };

    return (
        <div className="appointment-status-table">
            <div className="table-header">
                <h2>Lịch hẹn của tôi</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bệnh nhân, dịch vụ, trạng thái..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>
            <div style={{ display: 'flex', gap: '8px', background: '#f5f5f5', padding: '4px', borderRadius: '6px', marginBottom: '1rem', width: 'fit-content' }}>
                <button onClick={() => setSelectedTab('all')} style={{ background: selectedTab === 'all' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'all' ? 'bold' : 'normal', color: selectedTab === 'all' ? '#000' : '#555', cursor: 'pointer' }}>Tất cả</button>
                <button onClick={() => setSelectedTab('PENDING')} style={{ background: selectedTab === 'PENDING' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'PENDING' ? 'bold' : 'normal', color: selectedTab === 'PENDING' ? '#000' : '#555', cursor: 'pointer' }}>Chờ xác nhận</button>
                <button onClick={() => setSelectedTab('CONFIRMED')} style={{ background: selectedTab === 'CONFIRMED' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'CONFIRMED' ? 'bold' : 'normal', color: selectedTab === 'CONFIRMED' ? '#000' : '#555', cursor: 'pointer' }}>Đã xác nhận</button>
                <button onClick={() => setSelectedTab('CHECKED_IN')} style={{ background: selectedTab === 'CHECKED_IN' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'CHECKED_IN' ? 'bold' : 'normal', color: selectedTab === 'CHECKED_IN' ? '#000' : '#555', cursor: 'pointer' }}>Đã check-in</button>
                <button onClick={() => setSelectedTab('COMPLETED')} style={{ background: selectedTab === 'COMPLETED' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'COMPLETED' ? 'bold' : 'normal', color: selectedTab === 'COMPLETED' ? '#000' : '#555', cursor: 'pointer' }}>Đã hoàn thành</button>
                <button onClick={() => setSelectedTab('CANCELLED')} style={{ background: selectedTab === 'CANCELLED' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'CANCELLED' ? 'bold' : 'normal', color: selectedTab === 'CANCELLED' ? '#000' : '#555', cursor: 'pointer' }}>Đã huỷ</button>
                <button onClick={() => setSelectedTab('NO_SHOW')} style={{ background: selectedTab === 'NO_SHOW' ? '#fff' : '#f5f5f5', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: selectedTab === 'NO_SHOW' ? 'bold' : 'normal', color: selectedTab === 'NO_SHOW' ? '#000' : '#555', cursor: 'pointer' }}>Vắng mặt</button>
            </div>
            {loading && <div>Đang tải...</div>}
            {error && <div className="error-message">{error}</div>}
            {!loading && !error && (
                <table>
                    <thead>
                        <tr>
                            <th>Tên bệnh nhân</th>
                            <th>Bác sĩ thay thế</th>
                            <th>Dịch vụ y tế</th>
                            <th>Thời gian</th>
                            <th>Ghi chú</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAppointments.map((appt) => (
                            <tr key={appt.id}>
                                <td>{appt.patientName}</td>
                                <td>{appt.substituteDoctorName || <span style={{color:'#aaa'}}>Không có</span>}</td>
                                <td>{appt.medicalServiceName}</td>
                                <td>{`${appt.appointmentTime}, ${new Date(appt.appointmentDate).toLocaleDateString()}`}</td>
                                <td>{appt.notes || 'Không có'}</td>
                                <td>
                                    <span
                                        className={`status-badge ${getStatusClass(appt.displayStatus)}`}
                                        style={
                                            appt.displayStatus === 'Chờ xác nhận' ? { background: '#f2f2f2', color: '#444', border: '1.5px solid #e0e0e0', fontWeight: 500 }
                                            : appt.displayStatus === 'Sắp diễn ra' ? { background: '#e3f2fd', color: '#1976d2' }
                                            : appt.displayStatus === 'Đang diễn ra' ? { background: '#fff3e0', color: '#f57c00' }
                                            : appt.displayStatus === 'Hoàn thành' ? { background: '#e8f5e8', color: '#388e3c' }
                                            : appt.displayStatus === 'Đã hủy' ? { background: '#ffebee', color: '#d32f2f' }
                                            : appt.displayStatus === 'Vắng mặt' ? { background: '#f3e5f5', color: '#8e24aa' }
                                            : undefined
                                        }
                                    >
                                        {appt.displayStatus}
                                    </span>
                                </td>
                                <td style={{ minWidth: '200px' }}>
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn view-btn"
                                            title="Xem chi tiết"
                                            onClick={() => setDetailModal({ show: true, appointment: appt })}
                                        >
                                            <FaEye />
                                            <span>Chi tiết</span>
                                        </button>

                                        {/* Button Hoàn thành - chỉ hiện khi status là CONFIRMED hoặc CHECKED_IN */}
                                        {(appt.status === 'CONFIRMED' || appt.status === 'CHECKED_IN') && (
                                            <button
                                                className="action-btn complete-btn"
                                                title="Hoàn thành khám"
                                                onClick={() => updateAppointmentStatus(appt.id, 'COMPLETED')}
                                                disabled={updateLoading}
                                            >
                                                <FaCheck />
                                                <span>Hoàn thành</span>
                                            </button>
                                        )}

                                        {/* Button Vắng mặt - chỉ hiện khi status là CONFIRMED hoặc CHECKED_IN */}
                                        {(appt.status === 'CONFIRMED' || appt.status === 'CHECKED_IN') && (
                                            <button
                                                className="action-btn no-show-btn"
                                                title="Đánh dấu vắng mặt"
                                                onClick={() => handleNoShowConfirmation(appt.id)}
                                                disabled={updateLoading}
                                            >
                                                <FaTimes />
                                                <span>Vắng mặt</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {paginatedAppointments.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>Bạn chưa có cuộc hẹn nào.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px', gap: '4px' }}>
                <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#fff',
                        color: '#222',
                        fontWeight: 'bold',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        margin: '0 2px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}
                >
                    {'<'}
                </button>
                {Array.from({ length: totalPages }, (_, idx) => (
                    <button
                        key={idx + 1}
                        onClick={() => setCurrentPage(idx + 1)}
                        style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            background: currentPage === idx + 1 ? '#1a73e8' : '#e3eafc',
                            color: currentPage === idx + 1 ? '#fff' : '#1a73e8',
                            fontWeight: currentPage === idx + 1 ? 'bold' : 'normal',
                            boxShadow: currentPage === idx + 1 ? '0 2px 8px rgba(26,115,232,0.08)' : 'none',
                            cursor: 'pointer',
                            margin: '0 2px'
                        }}
                    >
                        {idx + 1}
                    </button>
                ))}
                <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#fff',
                        color: '#222',
                        fontWeight: 'bold',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        margin: '0 2px',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
                    }}
                >
                    {'>'}
                </button>
            </div>
            {detailModal.show && detailModal.appointment && (
                <div className="modal-overlay" onClick={() => setDetailModal({ show: false, appointment: null })}>
                    <div className="modal-content appointment-detail-modal" onClick={e => e.stopPropagation()}>
                        <h3 className="modal-title">Chi tiết lịch hẹn</h3>
                        <div className="appointment-detail-list">
                            <div className="detail-row"><span className="detail-label">Tên bệnh nhân:</span> <span className="detail-value">{detailModal.appointment.patientName}</span></div>
                            {/* <div className="detail-row"><span className="detail-label">Email:</span> <span className="detail-value">{detailModal.appointment.patientEmail || 'Không có'}</span></div>
                            <div className="detail-row"><span className="detail-label">Số điện thoại:</span> <span className="detail-value">{detailModal.appointment.patientPhone || 'Không có'}</span></div> */}
                            <div className="detail-row"><span className="detail-label">Dịch vụ y tế:</span> <span className="detail-value">{detailModal.appointment.medicalServiceName}</span></div>
                            <div className="detail-row"><span className="detail-label">Thời gian:</span> <span className="detail-value">{detailModal.appointment.appointmentTime}, {new Date(detailModal.appointment.appointmentDate).toLocaleDateString()}</span></div>
                            <div className="detail-row"><span className="detail-label">Ghi chú:</span> <span className="detail-value">{detailModal.appointment.notes || 'Không có'}</span></div>
                            <div className="detail-row"><span className="detail-label">Trạng thái:</span> <span className="detail-value">{detailModal.appointment.displayStatus}</span></div>
                        </div>
                        
                        {/* Các button hành động trong modal */}
                        {(detailModal.appointment.status === 'CONFIRMED' || detailModal.appointment.status === 'CHECKED_IN') && (
                            <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#495057' }}>Cập nhật trạng thái lịch hẹn:</h4>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                    <button
                                        onClick={() => updateAppointmentStatus(detailModal.appointment.id, 'COMPLETED')}
                                        disabled={updateLoading}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: updateLoading ? 'not-allowed' : 'pointer',
                                            opacity: updateLoading ? 0.6 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i className="fas fa-check"></i>
                                    </button>
                                    <button
                                        onClick={() => handleNoShowConfirmation(detailModal.appointment.id)}
                                        disabled={updateLoading}
                                        style={{
                                            padding: '10px 20px',
                                            backgroundColor: '#ffc107',
                                            color: '#212529',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: updateLoading ? 'not-allowed' : 'pointer',
                                            opacity: updateLoading ? 0.6 : 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                            <button className="close-modal-btn" onClick={() => setDetailModal({ show: false, appointment: null })}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorAppointmentTable; 