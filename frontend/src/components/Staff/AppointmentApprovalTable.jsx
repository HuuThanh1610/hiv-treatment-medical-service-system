import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AppointmentApprovalTable.scss';
import ConfirmModal from '../Common/ConfirmModal';
import { toast } from 'react-toastify';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import AppointmentService from '../../Services/AppointmentService';

const AppointmentApprovalTable = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null });

    const fetchAppointments = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8080/api/appointments/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const pendingAppointments = response.data.filter(appt => appt.status === 'PENDING');
            setAppointments(pendingAppointments);
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

    const handleApprove = async (id) => {
        setUpdatingId(id);
        try {
            await AppointmentService.updateStatus(id, 'CONFIRMED');
            toast.success('Duyệt lịch hẹn thành công!');
            fetchAppointments(); // Refresh the list
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Cập nhật trạng thái cuộc hẹn thất bại.';
            toast.error(errorMessage);
            console.error(err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReject = (id) => {
        setConfirmModal({
            show: true,
            message: 'Bạn có chắc muốn từ chối cuộc hẹn này?',
            onConfirm: async () => {
                setConfirmModal({ show: false });
                setUpdatingId(id);
                try {
                    const token = localStorage.getItem('token');
                    await axios.patch(`http://localhost:8080/api/appointments/${id}/status`, { status: 'CANCELLED' }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success('Từ chối lịch hẹn thành công!');
                    fetchAppointments();
                } catch (err) {
                    toast.error('Cập nhật trạng thái cuộc hẹn thất bại.');
                    console.error(err);
                } finally {
                    setUpdatingId(null);
                }
            }
        });
    };

    const filteredAppointments = appointments.filter(appt => {
        const search = searchTerm.toLowerCase();
        return (
            appt.patientName.toLowerCase().includes(search) ||
            appt.doctorName.toLowerCase().includes(search) ||
            appt.medicalServiceName.toLowerCase().includes(search)
        );
    });

    return (
        <div className="appointment-approval-table">
            <div className="table-header">
                <h2>Duyệt cuộc hẹn</h2>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên bệnh nhân, bác sĩ, dịch vụ..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="search-input"
                />
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
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAppointments.map((appt) => (
                            <tr key={appt.id}>
                                <td>{appt.patientName}</td>
                                <td>{appt.doctorName}</td>
                                <td>{appt.substituteDoctorName || <span style={{color:'#aaa'}}>Không có</span>}</td>
                                <td>{appt.medicalServiceName}</td>
                                <td>{`${appt.appointmentTime}, ${new Date(appt.appointmentDate).toLocaleDateString()}`}</td>
                                <td>{appt.notes}</td>
                                <td>
                                    {updatingId === appt.id ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <>
                                            <button onClick={() => handleApprove(appt.id)} className="approve-button"><FaCheck /></button>
                                            <button onClick={() => handleReject(appt.id)} className="reject-button"><FaTimes /></button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filteredAppointments.length === 0 && (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>Không có cuộc hẹn nào đang chờ duyệt.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
            <ConfirmModal
                show={confirmModal.show}
                message={confirmModal.message}
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ show: false })}
            />
        </div>
    );
};

export default AppointmentApprovalTable;