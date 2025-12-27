import React from 'react';
import videoPlaceholder from '../../assets/video-homepage.mp4';
import './HeroSection.scss';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const navigate = useNavigate();
    return (
        <section className="hero-section">
            <div className="container">
                <div className="hero-grid">
                    <div className="hero-text">
                        <h1>
                            Chăm sóc HIV toàn diện, <br /> nhân văn và hiện đại
                        </h1>
                        <p>
                            Đội ngũ y bác sĩ tận tâm cùng hệ thống trang thiết bị hiện đại
                            luôn sẵn sàng đồng hành cùng bạn trên hành trình chăm sóc sức khỏe.
                        </p>
                        <div className="hero-actions">
                            <button onClick={() => navigate('/services')} className="btn btn-primary">Bắt đầu ngay</button>
                            <button onClick={() => navigate('/about')} className="btn btn-outline">Tìm hiểu thêm</button>
                        </div>
                    </div>

                    <div className="hero-media">
                        <video
                            src={videoPlaceholder}
                            autoPlay
                            loop
                            muted
                            className="video"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;
