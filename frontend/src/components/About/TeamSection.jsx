import React, { useEffect, useState } from 'react';
import DoctorService from '../../Services/DoctorService';
import { Link } from 'react-router-dom';

const TeamSection = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isAuthenticated = Boolean(localStorage.getItem('token'));

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await DoctorService.getAllDoctors();
                setDoctors(data || []);
            } catch (err) {
                setError('Không thể tải danh sách bác sĩ.');
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    return (
        <section className="team-section">
            <div className="container">
                <div className="section-header">
                    <h2>Đội ngũ của chúng tôi</h2>
                    <p>Những chuyên gia y tế hàng đầu với tâm huyết và kinh nghiệm phong phú</p>
                </div>

                {!isAuthenticated ? (
                    <div className="team-login-prompt" style={{ textAlign: 'center', margin: '32px 0' }}>
                        <p>Vui lòng <Link to="/login" className="team-login-btn">Đăng nhập</Link> hoặc <Link to="/signup" className="team-signup-btn">Đăng ký</Link> để xem thông tin chi tiết về đội ngũ bác sĩ.</p>
                    </div>
                ) : loading ? (
                    <div>Đang tải danh sách bác sĩ...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : (
                    <div className="team-grid">
                        {doctors.map((doctor, index) => (
                            <div key={doctor.id || index} className="team-card">
                                <div className="team-image">
                                    {doctor.avatarUrl ? (
                                        <img src={doctor.avatarUrl} alt={doctor.fullName} />
                                    ) : (
                                        <div className="placeholder-image">
                                            <span>{doctor.fullName ? doctor.fullName.charAt(0) : '?'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="team-info">
                                    <h3>{doctor.fullName}</h3>
                                    <h4>{doctor.specialty || 'Bác sĩ'}</h4>
                                    <p>{doctor.qualifications || 'Bác sĩ tận tâm, giàu kinh nghiệm.'}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default TeamSection;