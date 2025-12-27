/**
 * AppointmentForm.jsx - Form đặt lịch khám bệnh
 *
 * Chức năng:
 * - Form đặt lịch khám với thông tin bệnh nhân
 * - Chọn bác sĩ, dịch vụ, ngày giờ khám
 * - Khai báo y tế bắt buộc
 * - Validation form data
 * - Lab results modal integration
 * - Success notification và redirect
 */
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

// Components
import LabResultDetailModal from './LabResultDetailModal';         // Modal hiển thị kết quả xét nghiệm
import AppointmentDeclarationForm from './AppointmentDeclarationForm'; // Form khai báo y tế

// Services
import AppointmentDeclarationService from '../../Services/AppointmentDeclarationService'; // API khai báo y tế

import './AppointmentForm.scss';

const AppointmentForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const initialDoctorId = location.state?.doctorId || '';
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        appointmentDate: '',
        appointmentTime: '', // Format: HH:mm
        doctorId: initialDoctorId,
        medicalServiceId: '',
        notes: ''
    });

    const [services, setServices] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);

    // Payment states removed
    const [selectedService, setSelectedService] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    
    // Thêm state cho thông tin user và declaration form
    const [userInfo, setUserInfo] = useState(null);
    const [showDeclarationForm, setShowDeclarationForm] = useState(false);
    const [declarationData, setDeclarationData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                setDataLoading(true);
                const [servicesRes, doctorsRes, userRes] = await Promise.all([
                    axios.get('http://localhost:8080/api/medical-services', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8080/api/doctors', {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get('http://localhost:8080/api/patients/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                console.log('User data from API:', userRes.data); // Debug log
                setServices(servicesRes.data);
                setDoctors(doctorsRes.data);
                setUserInfo(userRes.data);
                console.log('UserInfo state set to:', userRes.data); // Debug log
            } catch (err) {
                console.error('Lỗi khi tải dữ liệu:', err);
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setDataLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Lưu thông tin service được chọn
    useEffect(() => {
        if (formData.medicalServiceId) {
            const service = services.find(s => s.id === parseInt(formData.medicalServiceId));
            setSelectedService(service);
        } else {
            setSelectedService(null);
        }
    }, [formData.medicalServiceId, services]);

    // Fetch available slots khi doctor hoặc date thay đổi
    useEffect(() => {
        const fetchAvailableSlots = async () => {
            if (!formData.doctorId || !formData.appointmentDate) {
                setAvailableSlots([]);
                return;
            }

            try {
                setSlotsLoading(true);
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `http://localhost:8080/api/doctors/${formData.doctorId}/available-slots?date=${formData.appointmentDate}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                // Xử lý dữ liệu từ API - có thể là array of strings hoặc array of objects
                const slotsData = response.data || [];
                const processedSlots = slotsData.map(slot => {
                    let timeValue;

                    // Nếu slot là object có time property
                    if (typeof slot === 'object' && slot.time) {
                        timeValue = slot.time;
                    }
                    // Nếu slot là string
                    else if (typeof slot === 'string') {
                        timeValue = slot;
                    }
                    // Nếu slot là object khác, thử lấy key đầu tiên
                    else if (typeof slot === 'object') {
                        const keys = Object.keys(slot);
                        if (keys.length > 0) {
                            timeValue = slot[keys[0]];
                        }
                    }

                    if (!timeValue) return null;

                    // Đảm bảo format thời gian là HH:mm
                    if (typeof timeValue === 'string') {
                        // Nếu có format HH:mm:ss, chỉ lấy HH:mm
                        if (timeValue.split(':').length >= 2) {
                            const parts = timeValue.split(':');
                            return `${parts[0]}:${parts[1]}`;
                        }
                        return timeValue;
                    }

                    return null;
                }).filter(slot => slot !== null); // Loại bỏ null values

                console.log('Available slots data:', slotsData);
                console.log('Processed slots:', processedSlots);

                setAvailableSlots(processedSlots);
                // Reset appointment time khi thay đổi doctor hoặc date
                setFormData(prev => ({ ...prev, appointmentTime: '' }));
            } catch (err) {
                console.error('Lỗi khi tải available slots:', err);
                setAvailableSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchAvailableSlots();
    }, [formData.doctorId, formData.appointmentDate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        // Kiểm tra ngày đặt lịch không được trong quá khứ
        const selectedDate = new Date(formData.appointmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            toast.error('Không thể đặt lịch trong quá khứ. Vui lòng chọn ngày khác.');
            return false;
        }

        // Kiểm tra ngày đặt lịch không được là chủ nhật
        if (selectedDate.getDay() === 0) {
            toast.error('Không thể đặt lịch vào chủ nhật. Vui lòng chọn ngày khác.');
            return false;
        }

        // Kiểm tra có available slots không
        if (availableSlots.length === 0 && formData.doctorId && formData.appointmentDate) {
            toast.error('Không có khung giờ trống cho bác sĩ này vào ngày đã chọn. Vui lòng chọn ngày khác.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Hiển thị form khai báo sức khỏe (BẮT BUỘC) trước khi đặt lịch
        setShowDeclarationForm(true);
    };

    const handleDeclarationSubmit = async (data) => {
        console.log('=== DEBUG: handleDeclarationSubmit ===');
        console.log('Received data from form:', data);
        
        setDeclarationData(data);
        setShowDeclarationForm(false);
        
        console.log('=== DEBUG: After setDeclarationData ===');
        console.log('declarationData will be:', data);
        
        // Submit appointment với declaration data (sử dụng trực tiếp data parameter)
        await submitAppointmentWithData(data);
    };

    const handleDeclarationClose = () => {
        // Không cho phép đóng form declaration mà không submit
        // User phải điền thông tin để tiếp tục
        if (window.confirm('Bạn có chắc muốn hủy khai báo sức khỏe? Thông tin này rất quan trọng cho việc khám bệnh.')) {
            setShowDeclarationForm(false);
            // Reset về trạng thái ban đầu, không tạo appointment
        }
    };

    // Submit appointment với declaration sử dụng atomic endpoint
    const submitAppointmentWithData = async (declarationFormData) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Format appointmentTime về HH:mm:ss (không thêm :00 nếu đã có)
            let formattedTime = formData.appointmentTime;
            if (formattedTime && !formattedTime.includes(':')) {
                // Nếu chỉ có HH:mm, thêm :00
                formattedTime = `${formattedTime}:00`;
            } else if (formattedTime && formattedTime.split(':').length === 2) {
                // Nếu có HH:mm, thêm :00
                formattedTime = `${formattedTime}:00`;
            }
            // Nếu đã có HH:mm:ss thì giữ nguyên

            // Tạo payload kèm thông tin khai báo y tế (sử dụng data trực tiếp từ form)
            const payload = {
                // Thông tin appointment
                doctorId: formData.doctorId,
                medicalServiceId: formData.medicalServiceId,
                appointmentDate: formData.appointmentDate,
                appointmentTime: formattedTime,
                notes: formData.notes,
                
                // Thông tin khai báo sức khỏe (sử dụng trực tiếp declarationFormData)
                isPregnant: declarationFormData?.isPregnant ?? false,
                healthNotes: declarationFormData?.healthNotes ?? '',
                symptoms: declarationFormData?.symptoms ?? '',
                currentMedications: declarationFormData?.currentMedications ?? '',
                allergies: declarationFormData?.allergies ?? '',
                emergencyContact: declarationFormData?.emergencyContact ?? '',
                emergencyPhone: declarationFormData?.emergencyPhone ?? ''
            };

            console.log('=== DEBUG: Frontend payload with direct data ===');
            console.log('declarationFormData:', declarationFormData);
            console.log('payload:', payload);
            console.log('payload.healthNotes:', payload.healthNotes);
            console.log('payload.symptoms:', payload.symptoms);
            console.log('payload.currentMedications:', payload.currentMedications);
            console.log('payload.allergies:', payload.allergies);
            console.log('payload.emergencyContact:', payload.emergencyContact);
            console.log('payload.emergencyPhone:', payload.emergencyPhone);

            console.log('Submitting appointment with declaration:', payload);

            // Sử dụng endpoint atomic để tạo appointment + declaration cùng lúc
            const response = await axios.post('http://localhost:8080/api/appointments/with-declaration', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Appointment and declaration created successfully:', response.data);

            // Show success modal and reset form
            setShowSuccessModal(true);
            toast.success('Đặt lịch và khai báo y tế thành công! Vui lòng thanh toán khi đến khám.');
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                appointmentDate: '',
                appointmentTime: '',
                doctorId: '',
                medicalServiceId: '',
                notes: ''
            });
            setAvailableSlots([]);
            setSelectedService(null);
            setDeclarationData(null); // Reset declaration data

            // Chuyển đến trang profile bệnh nhân - tab lịch hẹn sau 2 giây
            setTimeout(() => {
                navigate('/profile?tab=appointments');
            }, 2000);

        } catch (err) {
            console.error('Lỗi khi đặt lịch:', err);
            toast.error(err.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Submit appointment với declaration sử dụng atomic endpoint (legacy - dùng state)
    const submitAppointment = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Format appointmentTime về HH:mm:ss (không thêm :00 nếu đã có)
            let formattedTime = formData.appointmentTime;
            if (formattedTime && !formattedTime.includes(':')) {
                // Nếu chỉ có HH:mm, thêm :00
                formattedTime = `${formattedTime}:00`;
            } else if (formattedTime && formattedTime.split(':').length === 2) {
                // Nếu có HH:mm, thêm :00
                formattedTime = `${formattedTime}:00`;
            }
            // Nếu đã có HH:mm:ss thì giữ nguyên

            // Tạo payload kèm thông tin khai báo y tế (bắt buộc)
            const payload = {
                // Thông tin appointment
                doctorId: formData.doctorId,
                medicalServiceId: formData.medicalServiceId,
                appointmentDate: formData.appointmentDate,
                appointmentTime: formattedTime,
                notes: formData.notes,
                
                // Thông tin khai báo sức khỏe (ưu tiên data thật, fallback mới dùng default)
                isPregnant: declarationData?.isPregnant ?? false,
                healthNotes: declarationData?.healthNotes ?? '',
                symptoms: declarationData?.symptoms ?? '',
                currentMedications: declarationData?.currentMedications ?? '',
                allergies: declarationData?.allergies ?? '',
                emergencyContact: declarationData?.emergencyContact ?? '',
                emergencyPhone: declarationData?.emergencyPhone ?? ''
            };

            console.log('=== DEBUG: Frontend payload ===');
            console.log('declarationData:', declarationData);
            console.log('payload:', payload);
            console.log('payload.healthNotes:', payload.healthNotes);
            console.log('payload.symptoms:', payload.symptoms);
            console.log('payload.currentMedications:', payload.currentMedications);
            console.log('payload.allergies:', payload.allergies);
            console.log('payload.emergencyContact:', payload.emergencyContact);
            console.log('payload.emergencyPhone:', payload.emergencyPhone);

            console.log('Submitting appointment with declaration:', payload);

            // Sử dụng endpoint atomic để tạo appointment + declaration cùng lúc
            const response = await axios.post('http://localhost:8080/api/appointments/with-declaration', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Appointment and declaration created successfully:', response.data);

            // Show success modal and reset form
            setShowSuccessModal(true);
            toast.success('Đặt lịch và khai báo y tế thành công! Vui lòng thanh toán khi đến khám.');
            setFormData({
                fullName: '',
                email: '',
                phoneNumber: '',
                appointmentDate: '',
                appointmentTime: '',
                doctorId: '',
                medicalServiceId: '',
                notes: ''
            });
            setAvailableSlots([]);
            setSelectedService(null);
            setDeclarationData(null); // Reset declaration data

            // Chuyển đến trang profile bệnh nhân - tab lịch hẹn sau 2 giây
            setTimeout(() => {
                navigate('/profile?tab=appointments');
            }, 2000);

        } catch (err) {
            console.error('Lỗi khi đặt lịch:', err);
            toast.error(err.response?.data?.message || 'Đặt lịch thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Tính toán ngày tối thiểu (hôm nay)
    const getMinDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };


    // Payment logic removed

    // Format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    if (dataLoading) {
        return (
            <div className="booking-wrapper">
                <div className="loading">Đang tải dữ liệu...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="booking-wrapper">
                <div className="error-message">{error}</div>
                <button onClick={() => window.location.reload()}>Thử lại</button>
            </div>
        );
    }

    return (
        <div className="booking-wrapper" style={{ marginTop: 80 }}>
            <h1>Đặt lịch khám</h1>
            <p className="subtitle">Đặt lịch khám với bác sĩ chuyên khoa HIV</p>
            <div className="booking-form">
                <h3>Thông tin đặt lịch</h3>
                <p className="note">Vui lòng điền đầy đủ thông tin để đặt lịch khám</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-item full-width">
                        <label>Bác sĩ</label>
                        <select name="doctorId" value={formData.doctorId} onChange={handleChange} required>
                            <option value="">Chọn bác sĩ</option>
                            {doctors.map(doc => (
                                <option key={doc.id} value={doc.id}>
                                    {doc.fullName} - {doc.specialty || 'Chưa cập nhật chuyên khoa'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-item full-width">
                        <label>Dịch vụ khám</label>
                        <select
                            name="medicalServiceId"
                            value={formData.medicalServiceId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Chọn dịch vụ khám</option>
                            {services.map(service => (
                                <option key={service.id} value={service.id}>
                                    {service.name} - {service.price ? `${service.price.toLocaleString('vi-VN')} VNĐ` : 'Chưa cập nhật giá'}
                                </option>
                            ))}
                        </select>
                    </div>
                    {formData.appointmentDate && formData.appointmentTime ? (
                        <div style={{ display: 'flex', gap: 12, margin: '16px 0', justifyContent: 'flex-start' }}>
                            <button
                                type="button"
                                className="submit-btn"
                                style={{ minWidth: 120, padding: '10px 0', borderRadius: 8, fontWeight: 500 }}
                                onClick={() => setShowBookingModal(true)}
                            >
                                {formData.appointmentDate}
                            </button>
                            <button
                                type="button"
                                className="submit-btn"
                                style={{ minWidth: 90, padding: '10px 0', borderRadius: 8, fontWeight: 500 }}
                                onClick={() => setShowBookingModal(true)}
                            >
                                {formData.appointmentTime}
                            </button>
                        </div>
                    ) : (
                        <div className="form-item" style={{ alignSelf: 'flex-end' }}>
                            <button
                                type="button"
                                className="submit-btn"
                                onClick={() => setShowBookingModal(true)}
                                disabled={!formData.doctorId}
                            >
                                Chọn ngày & giờ
                            </button>
                        </div>
                    )}
                    <div className="form-item full-width">
                        <label>Ghi chú</label>
                        <textarea
                            name="notes"
                            placeholder="Mô tả ngắn gọn lý do bạn muốn đặt lịch khám"
                            value={formData.notes}
                            onChange={handleChange}
                            rows="4"
                        />
                    </div>
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || slotsLoading || !formData.appointmentDate || !formData.appointmentTime}
                    >
                        {loading ? 'Đang xử lý...' : 'Đặt lịch khám'}
                    </button>
                </form>
            </div>

            {/* Popup chọn ngày và giờ */}
            {showBookingModal && (
                <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
                    <div className="modal-content" style={{ width: '700px', maxWidth: '95vw', padding: 0 }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #eee' }}>
                            <h3>Chọn ngày và giờ khám</h3>
                            <button className="close-button" onClick={() => setShowBookingModal(false)}><FaTimes /></button>
                        </header>
                        <div style={{ display: 'flex', gap: 32, padding: 24 }}>
                            {/* Calendar chọn ngày */}
                            <div style={{ flex: 1 }}>
                                <input
                                    type="date"
                                    name="appointmentDate"
                                    value={formData.appointmentDate}
                                    onChange={handleChange}
                                    min={getMinDate()}
                                    style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
                                />
                            </div>
                            {/* Chọn khung giờ */}
                            <div style={{ flex: 1.2 }}>
                                <div style={{ marginBottom: 18 }}>
                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Buổi sáng</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                        {availableSlots.filter(slot => slot < '12:00').map(slot => (
                                            <button
                                                key={slot}
                                                className={formData.appointmentTime === slot ? 'slot selected' : 'slot'}
                                                style={{ minWidth: 110, padding: '10px 0', border: '1.5px solid #d1d5db', borderRadius: 8, background: formData.appointmentTime === slot ? '#e0e7ff' : '#f9fafb', color: formData.appointmentTime === slot ? '#1d4ed8' : '#222', fontWeight: 500, cursor: 'pointer' }}
                                                onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot }))}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Buổi chiều</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                        {availableSlots.filter(slot => slot >= '12:00').map(slot => (
                                            <button
                                                key={slot}
                                                className={formData.appointmentTime === slot ? 'slot selected' : 'slot'}
                                                style={{ minWidth: 110, padding: '10px 0', border: '1.5px solid #d1d5db', borderRadius: 8, background: formData.appointmentTime === slot ? '#e0e7ff' : '#f9fafb', color: formData.appointmentTime === slot ? '#1d4ed8' : '#222', fontWeight: 500, cursor: 'pointer' }}
                                                onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot }))}
                                            >
                                                {slot}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <footer style={{ padding: 24, borderTop: '1px solid #eee', textAlign: 'right' }}>
                            <button
                                className="submit-btn"
                                style={{ minWidth: 180, background: 'linear-gradient(90deg, #6a5af9, #38bdf8)', color: '#fff', fontWeight: 600, fontSize: 17, border: 'none', borderRadius: 8, padding: '12px 0', cursor: 'pointer' }}
                                onClick={() => setShowBookingModal(false)}
                                disabled={!formData.appointmentDate || !formData.appointmentTime}
                            >
                                Xác nhận
                            </button>
                        </footer>
                    </div>
                </div>
            )}


            {/* Declaration Form Modal */}
            {showDeclarationForm && (
                <AppointmentDeclarationForm
                    onClose={handleDeclarationClose}
                    onSubmit={handleDeclarationSubmit}
                    initialData={declarationData || {}}
                    userInfo={userInfo}
                />
            )}

            {/* Success Modal after booking */}
            {showSuccessModal && (
                <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
                    <div className="modal-content" style={{ width: '400px', maxWidth: '95vw' }} onClick={e => e.stopPropagation()}>
                        <header className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #eee' }}>
                            <h3>Đặt lịch thành công</h3>
                            <button className="close-button" onClick={() => setShowSuccessModal(false)}><FaTimes /></button>
                        </header>
                        <div style={{ padding: 24, textAlign: 'center' }}>
                            <p style={{ fontSize: 16, color: '#333', marginBottom: 16 }}>Lịch hẹn của bạn đã được tạo thành công!</p>
                            <p style={{ fontSize: 15, color: '#666' }}>Vui lòng đến cơ sở y tế và thanh toán khi làm thủ tục nhận khám.</p>
                        </div>
                        <footer style={{ padding: 24, borderTop: '1px solid #eee', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                className="submit-btn"
                                style={{ minWidth: 120, borderRadius: 8, fontWeight: 500, background: '#4CAF50' }}
                                onClick={() => {
                                    setShowSuccessModal(false);
                                    navigate('/profile?tab=appointments');
                                }}
                            >
                                Xem lịch hẹn
                            </button>
                            <button
                                className="submit-btn"
                                style={{ minWidth: 120, borderRadius: 8, fontWeight: 500, background: '#666' }}
                                onClick={() => setShowSuccessModal(false)}
                            >
                                Đóng
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentForm;