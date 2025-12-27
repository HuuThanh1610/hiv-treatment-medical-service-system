import React from 'react';
import Button from '../Common/Button';

const HeroSectionAbout = () => {
    return (
        <section className="hero-section">
            <div className="hero-content">
                <h1>Tham gia cùng chúng tôi</h1>
                <p>
                    Chúng tôi luôn tìm kiếm những cá nhân tài năng và đam mê để cùng nhau xây dựng
                    một hệ thống chăm sóc sức khỏe tốt hơn cho cộng đồng.
                </p>
                <div className="hero-buttons">
                    <Button variant="primary">Liên hệ</Button>
                    <Button variant="outline">Tìm hiểu thêm</Button>
                </div>
            </div>
            <div className="hero-stats">
                <div className="stat-item">
                    <h3>Giới thiệu</h3>
                    <p>Về hệ thống chăm sóc sức khỏe HIV hiện đại</p>
                </div>
                <div className="stat-item">
                    <h3>Sứ mệnh</h3>
                    <p>Mang đến dịch vụ y tế chất lượng cao</p>
                </div>
                <div className="stat-item">
                    <h3>Tầm nhìn</h3>
                    <p>Trở thành đơn vị hàng đầu trong lĩnh vực</p>
                </div>
                <div className="stat-item">
                    <h3>Giá trị</h3>
                    <p>Tận tâm, chuyên nghiệp và hiệu quả</p>
                </div>
            </div>
        </section>
    );
};

export default HeroSectionAbout;