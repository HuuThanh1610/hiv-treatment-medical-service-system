import React, { useState } from 'react';
import { FaCalendarAlt, FaStickyNote, FaTimes, FaCheck } from 'react-icons/fa';
import RevisitAppointmentService from '../../Services/RevisitAppointmentService';
import SuccessModal from '../Common/SuccessModal';
import './CreateRevisitAppointmentModal.scss';

const CreateRevisitAppointmentModal = ({ isOpen, onClose, appointment, onSuccess }) => {
    const [formData, setFormData] = useState({
        revisitDate: '',
        revisitNotes: '',
        revisitAppointmentStatus: 'SCHEDULED'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.revisitDate) {
            setError('Vui lòng chọn ngày hẹn tái khám');
            return;
        }

        // Kiểm tra ngày hẹn tái khám phải sau ngày hiện tại
        const selectedDate = new Date(formData.revisitDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate <= today) {
            setError('Ngày hẹn tái khám phải sau ngày hiện tại');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const createData = {
                appointmentId: appointment.id,
                revisitDate: formData.revisitDate,
                revisitNotes: formData.revisitNotes,
                revisitAppointmentStatus: formData.revisitAppointmentStatus
            };

            await RevisitAppointmentService.createRevisitAppointment(createData);

            // Hiển thị modal thành công
            setShowSuccessModal(true);

        } catch (err) {
            console.error('Error creating revisit appointment:', err);
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Có lỗi xảy ra khi thêm ngày hẹn tái khám');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            revisitDate: '',
            revisitNotes: '',
            revisitAppointmentStatus: 'SCHEDULED'
        });
        setError('');
        setShowSuccessModal(false);
        onClose();
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        handleClose();
        // Gọi callback để refresh data
        if (onSuccess) {
            onSuccess();
        }
    };

    // Tính toán ngày tối thiểu (ngày mai)
    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    if (!isOpen) return null;

    return (
        <div className="create-revisit-modal-overlay">
            <div className="create-revisit-modal">
                <div className="modal-header">
                    <h2>
                        <FaCalendarAlt />
                        Thêm ngày hẹn tái khám
                    </h2>
                    <button type="button" onClick={handleClose} className="close-btn">
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Thông tin bệnh nhân */}
                    <div className="patient-info">
                        <h3>Thông tin bệnh nhân</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <label>Tên bệnh nhân:</label>
                                <span>{appointment?.patientName}</span>
                            </div>
                            <div className="info-item">
                                <label>Ngày khám gốc:</label>
                                <span>
                                    {appointment?.appointmentDate && 
                                        new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')
                                    }
                                </span>
                            </div>
                            <div className="info-item">
                                <label>Dịch vụ:</label>
                                <span>{appointment?.serviceName}</span>
                            </div>
                        </div>
                    </div>

                    {/* Form thêm ngày hẹn tái khám */}
                    <form onSubmit={handleSubmit} className="revisit-form">
                        <div className="form-group">
                            <label htmlFor="revisitDate">
                                <FaCalendarAlt />
                                Ngày hẹn tái khám <span className="required">*</span>
                            </label>
                            <input
                                type="date"
                                id="revisitDate"
                                name="revisitDate"
                                value={formData.revisitDate}
                                onChange={handleChange}
                                min={getMinDate()}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="revisitNotes">
                                <FaStickyNote />
                                Ghi chú hẹn tái khám
                            </label>
                            <textarea
                                id="revisitNotes"
                                name="revisitNotes"
                                value={formData.revisitNotes}
                                onChange={handleChange}
                                placeholder="Nhập ghi chú về lý do hẹn tái khám, những điều cần kiểm tra..."
                                rows={4}
                            />
                        </div>



                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}



                        <div className="form-actions">
                            <button 
                                type="button" 
                                onClick={handleClose} 
                                className="btn btn-secondary"
                                disabled={loading}
                            >
                                Hủy bỏ
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>Đang thêm...</>
                                ) : (
                                    <>
                                        <FaCheck />
                                        Thêm ngày hẹn tái khám
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                type="appointment"
                title="Thêm ngày hẹn tái khám thành công!"
                message="Email nhắc hẹn đã được gửi đến bệnh nhân. Bệnh nhân sẽ nhận được thông báo về lịch hẹn tái khám."
            />
        </div>
    );
};

export default CreateRevisitAppointmentModal;
