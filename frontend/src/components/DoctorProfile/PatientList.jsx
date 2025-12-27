import React, { useState, useEffect } from 'react';
import { FaUser, FaCalendarAlt, FaPhone, FaEnvelope, FaEye, FaCalendarPlus } from 'react-icons/fa';
import DoctorService from '../../Services/DoctorService';
import PatientDetailModal from './PatientDetailModal';
import CreateRevisitAppointmentModal from './CreateRevisitAppointmentModal';
import './PatientList.scss';

const PatientList = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isRevisitModalOpen, setIsRevisitModalOpen] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            setLoading(true);
            const response = await DoctorService.getDoctorAppointments();
            const appointments = response.data || [];

            // Lọc và nhóm bệnh nhân theo lịch hẹn
            const patientMap = new Map();
            const token = localStorage.getItem('token');

            for (const appointment of appointments) {
                const patientId = appointment.patientId;
                if (!patientMap.has(patientId)) {
                    // Fetch thông tin chi tiết bệnh nhân từ API
                    try {
                        const patientResponse = await fetch(`http://localhost:8080/api/patients/${patientId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const patientDetail = await patientResponse.json();

                        const patientData = {
                            id: patientId,
                            fullName: patientDetail.fullName || appointment.patientName || 'Không có tên',
                            email: patientDetail.email || 'Chưa cập nhật',
                            phoneNumber: patientDetail.phoneNumber || 'Chưa cập nhật',
                            dateOfBirth: patientDetail.dateOfBirth,
                            gender: patientDetail.gender
                                ? patientDetail.gender.toLowerCase() === 'male' ? 'Nam' :
                                  patientDetail.gender.toLowerCase() === 'female' ? 'Nữ' :
                                  patientDetail.gender.toLowerCase() === 'other' ? 'Khác' :
                                  'Chưa cập nhật'
                                : 'Chưa cập nhật',
                            address: patientDetail.address || 'Chưa cập nhật',
                            avatar: null,
                            appointments: []
                        };
                        patientMap.set(patientId, patientData);
                    } catch (patientError) {
                        console.warn(`Could not fetch details for patient ${patientId}:`, patientError);
                        // Fallback to basic info from appointment
                        const patientData = {
                            id: patientId,
                            fullName: appointment.patientName || 'Không có tên',
                            email: 'Không thể tải thông tin',
                            phoneNumber: 'Không thể tải thông tin',
                            dateOfBirth: null,
                            gender: 'Không thể tải thông tin',
                            address: 'Không thể tải thông tin',
                            avatar: null,
                            appointments: []
                        };
                        patientMap.set(patientId, patientData);
                    }
                }
                // Thêm appointment vào danh sách của bệnh nhân
                const patient = patientMap.get(patientId);
                patient.appointments.push(appointment);
            }
            const uniquePatients = Array.from(patientMap.values());
            setPatients(uniquePatients);
            setError(null);
        } catch (err) {
            setError('Không thể tải danh sách bệnh nhân');
            console.error('Error fetching patients:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (patient) => {
        setSelectedPatient(patient);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPatient(null);
    };

    const handleCreateRevisitAppointment = (appointment) => {
        setSelectedAppointment(appointment);
        setIsRevisitModalOpen(true);
    };

    const handleCloseRevisitModal = () => {
        setIsRevisitModalOpen(false);
        setSelectedAppointment(null);
    };

    const handleRevisitSuccess = () => {
        // Có thể refresh danh sách hoặc hiển thị thông báo thành công
        alert('Thêm ngày hẹn tái khám thành công! Email đã được gửi đến bệnh nhân.');
        fetchPatients(); // Refresh danh sách
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'confirmed';
            case 'PENDING':
                return 'pending';
            case 'COMPLETED':
                return 'completed';
            case 'CANCELLED':
                return 'cancelled';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const filteredPatients = patients.filter(patient => {
        if (filterStatus === 'all') return true;
        return patient.appointments.some(app => app.status === filterStatus);
    });

    if (loading) {
        return <div className="patient-list__loading">Đang tải danh sách bệnh nhân...</div>;
    }

    if (error) {
        return <div className="patient-list__error">{error}</div>;
    }

    return (
        <>
            <div className="patient-list">
                <div className="patient-list__header">
                    <h2>Danh sách bệnh nhân</h2>
                    <div className="patient-list__filters">
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="patient-list__filter-select"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="PENDING">Chờ xác nhận</option>
                            <option value="CONFIRMED">Đã xác nhận</option>
                            <option value="COMPLETED">Hoàn thành</option>
                            <option value="CANCELLED">Đã hủy</option>
                        </select>
                    </div>
                </div>

                <div className="patient-list__content">
                    {filteredPatients.length === 0 ? (
                        <div className="patient-list__empty">
                            <FaUser size={48} />
                            <p>Chưa có bệnh nhân nào đặt lịch hẹn</p>
                        </div>
                    ) : (
                        <div className="patient-list__grid">
                            {filteredPatients.map((patient) => (
                                <div key={patient.id} className="patient-card">
                                    <div className="patient-card__header">
                                        <div className="patient-card__avatar">
                                            <FaUser size={24} />
                                        </div>
                                        <div className="patient-card__info">
                                            <h3>{patient.fullName}</h3>
                                            <p className="patient-card__contact">
                                                <FaEnvelope size={14} />
                                                {patient.email}
                                            </p>
                                            <p className="patient-card__contact">
                                                <FaPhone size={14} />
                                                {patient.phoneNumber}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="patient-card__appointments">
                                        <div className="appointments-header">
                                            <h4>Lịch hẹn ({patient.appointments.length})</h4>
                                            {patient.appointments.some(app => app.status === 'COMPLETED') && (
                                                <button
                                                    className="add-revisit-btn"
                                                    onClick={() => {
                                                        // Tìm appointment completed đầu tiên để tạo tái khám
                                                        const completedAppointment = patient.appointments.find(app => app.status === 'COMPLETED');
                                                        if (completedAppointment) {
                                                            handleCreateRevisitAppointment(completedAppointment);
                                                        }
                                                    }}
                                                    title="Thêm ngày hẹn tái khám"
                                                >
                                                    <FaCalendarPlus size={14} />
                                                    Thêm ngày hẹn tái khám
                                                </button>
                                            )}
                                        </div>
                                        {patient.appointments.slice(0, 3).map((appointment) => (
                                            <div key={appointment.id} className="appointment-item">
                                                <div className="appointment-item__info">
                                                    <div className="appointment-item__date">
                                                        <FaCalendarAlt size={12} />
                                                        {new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}
                                                    </div>
                                                    <div className="appointment-item__time">
                                                        {appointment.appointmentTime}
                                                    </div>
                                                    <div className={`appointment-item__status ${getStatusColor(appointment.status)}`}>
                                                        {getStatusText(appointment.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {patient.appointments.length > 3 && (
                                            <p className="patient-card__more">
                                                Và {patient.appointments.length - 3} lịch hẹn khác...
                                            </p>
                                        )}
                                    </div>

                                    <div className="patient-card__actions">
                                        <button
                                            className="patient-card__btn patient-card__btn--primary"
                                            onClick={() => handleViewDetails(patient)}
                                        >
                                            <FaEye size={14} />
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <PatientDetailModal
                patient={selectedPatient}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />

            <CreateRevisitAppointmentModal
                isOpen={isRevisitModalOpen}
                onClose={handleCloseRevisitModal}
                appointment={selectedAppointment}
                onSuccess={handleRevisitSuccess}
            />
        </>
    );
};

export default PatientList; 