import React, { useState, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';
import './UserAppointmentTable.scss';
import ConfirmModal from '../Common/ConfirmModal';
import CheckInStatusCard from './CheckInStatusCard';
import { toast } from 'react-toastify';

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

const UserAppointmentTable = forwardRef((props, ref) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cancelingId, setCancelingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTab, setSelectedTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });
    const [selectedService, setSelectedService] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [checkingInId, setCheckingInId] = useState(null);

    // Lấy danh sách dịch vụ y tế duy nhất
    const serviceOptions = Array.from(new Set(appointments.map(item => item.medicalServiceName))).filter(Boolean);
    // Lấy danh sách tháng duy nhất (YYYY-MM)
    const monthOptions = Array.from(new Set(appointments.map(item => item.appointmentDate ? item.appointmentDate.slice(0, 7) : ''))).filter(Boolean);

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found.');
            }
            const response = await axios.get('http://localhost:8080/api/appointments/my-appointments', {
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

    // useEffect removed. Data will be fetched on demand from parent.

    useImperativeHandle(ref, () => ({
        fetchAppointments
    }));

    React.useEffect(() => {
        setCurrentPage(1);
    }, [selectedTab]);

    const getDisplayStatus = (appointmentDate, appointmentTime, status) => {
        if (status === 'CANCELLED') {
            return 'Đã hủy';
        }
        if (status === 'PENDING') {
            return 'Chờ xác nhận';
        }
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        const appointmentEndBoundary = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000); // 1 hour after start
        const now = new Date();
        if (now < appointmentDateTime) {
            return 'Sắp diễn ra';
        } else if (now >= appointmentDateTime && now <= appointmentEndBoundary) {
            return 'Đang diễn ra';
        } else {
            return 'Đã xảy ra';
        }
    };

    // Lọc dữ liệu theo dịch vụ và tháng
    const filteredAppointments = appointments.map(appt => ({
        ...appt,
        displayStatus: getDisplayStatus(appt.appointmentDate, appt.appointmentTime, appt.status)
    })).filter(appt => {
        const search = searchTerm.toLowerCase();
        let matchService = true, matchMonth = true;
        if (selectedService) matchService = appt.medicalServiceName === selectedService;
        if (selectedMonth) matchMonth = appt.appointmentDate && appt.appointmentDate.startsWith(selectedMonth);
        return (
            (appt.doctorName.toLowerCase().includes(search) ||
                appt.medicalServiceName.toLowerCase().includes(search) ||
                appt.displayStatus.toLowerCase().includes(search)) &&
            matchService && matchMonth
        );
    });

    // Sort theo ngày giảm dần
    const sortedAppointments = [...filteredAppointments].sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    // Filter by new status enums
    const tabFilteredAppointments = sortedAppointments.filter(appt => {
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
            case 'Đã xảy ra':
                return 'completed';
            case 'Đã hủy':
                return 'cancelled';
            default:
                return '';
        }
    };

    const handleCancel = async (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc chắn muốn hủy cuộc hẹn này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                setCancelingId(id);
                try {
                    const token = localStorage.getItem('token');
                    await axios.delete(`http://localhost:8080/api/appointments/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Hủy cuộc hẹn thành công!');
                    fetchAppointments();
                } catch (err) {
                    toast.error('Hủy cuộc hẹn thất bại.');
                    console.error(err);
                } finally {
                    setCancelingId(null);
                }
            }
        });
    };

    const handleCheckIn = async (id, appointmentDate, appointmentTime) => {
        // Kiểm tra ngày và thời gian check-in
        const today = new Date();
        const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
        const currentTime = new Date();
        
        // Cho phép check-in từ 30 phút trước giờ hẹn
        const earliestCheckInTime = new Date(appointmentDateTime.getTime() - 30 * 60 * 1000);
        // Cho phép check-in đến 1 giờ sau giờ hẹn
        const latestCheckInTime = new Date(appointmentDateTime.getTime() + 60 * 60 * 1000);
        
        // Kiểm tra ngày hẹn
        if (appointmentDate !== today.toISOString().split('T')[0]) {
            if (appointmentDateTime < today) {
                toast.error('Lịch hẹn đã quá hạn, không thể check-in.');
                return;
            } else {
                toast.error('Chưa đến ngày hẹn, không thể check-in trước thời gian.');
                return;
            }
        }
        
        // Kiểm tra thời gian check-in
        if (currentTime < earliestCheckInTime) {
            const timeString = earliestCheckInTime.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            toast.error(`Chưa đến thời gian check-in. Có thể check-in từ ${timeString} (30 phút trước giờ hẹn).`);
            return;
        }
        
        if (currentTime > latestCheckInTime) {
            const timeString = latestCheckInTime.toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            toast.error(`Đã quá thời gian check-in. Thời gian check-in kết thúc lúc ${timeString}.`);
            return;
        }

        // Thực hiện check-in trực tiếp mà không cần confirm
        setCheckingInId(id);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:8080/api/appointments/${id}/checkin`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Check-in thành công! Bác sĩ đã được thông báo.');
            fetchAppointments();
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Check-in thất bại.';
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setCheckingInId(null);
        }
    };

    return (
        <div className="appointment-status-table">
            <div className="table-header">
                {/* <h2>Lịch sử cuộc hẹn</h2> */}
                <h2>Cuộc hẹn của tôi</h2>
                <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
                    <select value={selectedService} onChange={e => setSelectedService(e.target.value)}>
                        <option value="">Tất cả dịch vụ</option>
                        {serviceOptions.map(service => (
                            <option key={service} value={service}>{service}</option>
                        ))}
                    </select>
                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
                        <option value="">Tất cả tháng</option>
                        {monthOptions.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên bác sĩ, dịch vụ, trạng thái..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Hiển thị check-in cards cho appointment CONFIRMED hôm nay */}
            {appointments.filter(appt => {
                const today = new Date().toISOString().split('T')[0];
                return appt.status === 'CONFIRMED' && appt.appointmentDate === today;
            }).map(appt => (
                <CheckInStatusCard
                    key={`checkin-${appt.id}`}
                    appointment={appt}
                    onCheckIn={handleCheckIn}
                    isCheckingIn={checkingInId === appt.id}
                />
            ))}

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
                            <th>Tên bác sĩ</th>

                            <th>Dịch vụ</th>
                            <th>Thời gian</th>
                            <th>Ghi chú</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedAppointments.map((appt) => (
                            <tr key={appt.id}>
                                <td>{appt.doctorName}</td>

                                <td>{appt.medicalServiceName}</td>
                                <td>{`${appt.appointmentTime}, ${new Date(appt.appointmentDate).toLocaleDateString()}`}</td>
                                <td>{appt.notes}</td>
                                <td>
                                    <span
                                        className={`status-badge ${appt.status === 'PENDING' ? 'pending' : getStatusClass(appt.displayStatus)}`}
                                        style={
                                            appt.status === 'PENDING'
                                                ? { background: '#f2f2f2', color: '#444', border: '1.5px solid #e0e0e0', fontWeight: 500 }
                                                : undefined
                                        }
                                    >
                                        {appt.displayStatus}
                                    </span>
                                </td>
                                <td>
                                    {appt.status === 'PENDING' ? (
                                        cancelingId === appt.id ? (
                                            <div className="spinner"></div>
                                        ) : (
                                            <button onClick={() => handleCancel(appt.id)} className="cancel-button">Hủy</button>
                                        )
                                    ) : appt.status === 'CONFIRMED' ? (
                                        checkingInId === appt.id ? (
                                            <div className="spinner"></div>
                                        ) : (
                                            <button 
                                                onClick={() => handleCheckIn(appt.id, appt.appointmentDate, appt.appointmentTime)} 
                                                className="checkin-button"
                                            >
                                                Check-in
                                            </button>
                                        )
                                    ) : appt.status === 'CHECKED_IN' ? (
                                        <button 
                                            onClick={() => handleCheckIn(appt.id, appt.appointmentDate, appt.appointmentTime)} 
                                            className="checkin-button update-checkin"
                                            title="Cập nhật trạng thái check-in"
                                        >
                                            Check-in
                                        </button>
                                    ) : (
                                        <span style={{ color: '#aaa', fontStyle: 'italic' }}>
                                            {appt.status === 'COMPLETED' ? 'Đã hoàn thành' : 
                                             appt.status === 'CANCELLED' ? 'Đã hủy' : 
                                             appt.status === 'NO_SHOW' ? 'Vắng mặt' : 'Không có thao tác'}
                                        </span>
                                    )}
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
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '16px', gap: '4px' }}>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                    >
                        {'<'}
                    </button>
                    {Array.from({ length: totalPages }, (_, idx) => (
                        <button
                            key={idx + 1}
                            onClick={() => setCurrentPage(idx + 1)}
                            style={{
                                color: currentPage === idx + 1 ? '#000' : '#555',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: '1px solid #ccc',
                                background: currentPage === idx + 1 ? '#fff' : '#f5f5f5',
                                fontWeight: currentPage === idx + 1 ? 'bold' : 'normal',
                                cursor: 'pointer'
                            }}
                        >
                            {idx + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #ccc', background: '#f5f5f5', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                    >
                        {'>'}
                    </button>
                </div>
            )}
            <ConfirmModal
                show={confirmModal.show}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ show: false })}
            />
        </div>
    );
});

export default UserAppointmentTable; 