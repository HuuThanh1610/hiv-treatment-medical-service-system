import React from 'react';
import { Link } from 'react-router-dom';

const CTASection = () => {
    return (
        <section className="cta-section">
            <div className="container">
                <div className="cta-content">
                    <h2>Bắt đầu hành trình chăm sóc sức khỏe của bạn</h2>
                    <p>Đăng ký ngay hôm nay để có thể quản lý hồ sơ sức khỏe và nhận sự chăm sóc tốt nhất từ HIV Care.</p>
                    <div className="cta-buttons">

                        <Link to="/signup">
                            <button className="btn-primary">Đăng ký ngay</button>
                        </Link>
                        <button className="btn-secondary">Tìm hiểu thêm</button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;