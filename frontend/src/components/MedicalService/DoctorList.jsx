import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSearch, FaStar, FaClock, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUserMd } from 'react-icons/fa';
import DoctorService from '../../Services/DoctorService';
import './DoctorList.scss';

const DoctorList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await DoctorService.getAllDoctors();
            setDoctors(data || []);
        } catch (err) {
            setError('Không thể tải danh sách bác sĩ.');
        } finally {
            setLoading(false);
        }
    };

    const specialties = [
        { value: 'all', label: 'Tất cả chuyên khoa' },
        { value: 'hiv', label: 'Chuyên khoa HIV/AIDS' },
        { value: 'psychology', label: 'Tư vấn tâm lý HIV' }
    ];

    const filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = (doctor.phoneNumber || '').includes(searchTerm) ||
            (doctor.qualifications || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doctor.specialty || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' || (doctor.specialty || '').toLowerCase().includes(selectedSpecialty);
        return matchesSearch && matchesSpecialty;
    });

    if (loading) {
        return <div className="doctor-list-page"><div className="loading">Đang tải danh sách bác sĩ...</div></div>;
    }
    if (error) {
        return <div className="doctor-list-page"><div className="error">{error}</div></div>;
    }

    return (
        <div className="doctor-list-page">
            <div className="back-link" onClick={() => navigate('/services')}>
                <FaArrowLeft /> Quay lại trang dịch vụ
            </div>

            <header className="doctor-list-header">
                <h1>Đội ngũ bác sĩ chuyên nghiệp</h1>
                <p>Gặp gỡ các chuyên gia hàng đầu về HIV/AIDS với nhiều năm kinh nghiệm</p>
            </header>

            <div className="search-filters">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo số điện thoại, bằng cấp hoặc chuyên khoa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="specialty-filter"
                >
                    {specialties.map(specialty => (
                        <option key={specialty.value} value={specialty.value}>
                            {specialty.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="doctors-grid">
                {filteredDoctors.map(doctor => (
                    <div key={doctor.id || doctor.userId} className="doctor-card">
                        <div className="doctor-header">
                            <div className="doctor-icon">
                                <FaUserMd />
                            </div>
                            <div className="doctor-info">
                                <h3>{doctor.fullName ? doctor.fullName : `Bác sĩ #${doctor.id || doctor.userId}`}</h3>
                                <p className="specialty">{doctor.specialty || 'Chưa cập nhật chuyên khoa'}</p>
                                <p className="qualifications">{doctor.qualifications || 'Chưa cập nhật bằng cấp'}</p>
                            </div>
                        </div>

                        <div className="doctor-details">
                            <div className="contact-info">
                                <div className="contact-item">
                                    <FaPhone className="icon" />
                                    <span>{doctor.phoneNumber || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="contact-item">
                                    <FaClock className="icon" />
                                    <span>Tối đa {doctor.maxAppointmentsPerDay || 0} lịch hẹn/ngày</span>
                                </div>
                            </div>

                            <div className="additional-info">
                                <div className="info-item">
                                    <strong>ID Bác sĩ:</strong> {doctor.id || doctor.userId}
                                </div>
                                <div className="info-item">
                                    <strong>Chuyên khoa:</strong> {doctor.specialty || 'Chưa cập nhật'}
                                </div>
                                <div className="info-item">
                                    <strong>Bằng cấp:</strong> {doctor.qualifications || 'Chưa cập nhật'}
                                </div>
                                <div className="info-item">
                                    <strong>Số điện thoại:</strong> {doctor.phoneNumber || 'Chưa cập nhật'}
                                </div>
                                <div className="info-item">
                                    <strong>Khả năng tiếp nhận:</strong> {doctor.maxAppointmentsPerDay || 0} bệnh nhân/ngày
                                </div>
                            </div>
                        </div>

                        <div className="doctor-actions">
                            <button className="btn-primary" onClick={() => navigate('/services/appointments', { state: { doctorId: doctor.id || doctor.userId } })}>
                                Đặt lịch khám
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/consult-online', { state: { doctorId: doctor.id || doctor.userId } })}>
                                Tư vấn trực tuyến
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredDoctors.length === 0 && (
                <div className="no-results">
                    <p>Không tìm thấy bác sĩ phù hợp với tiêu chí tìm kiếm.</p>
                    <button onClick={() => { setSearchTerm(''); setSelectedSpecialty('all'); }}>
                        Xóa bộ lọc
                    </button>
                </div>
            )}
        </div>
    );
};

export default DoctorList; 