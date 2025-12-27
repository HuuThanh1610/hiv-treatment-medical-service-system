import React from 'react';
import ContactSection from '../Contact/ContactSection';
import '../Contact/ContactSection.css';

const BenefitsSection = () => {
    const benefits = [
        {
            icon: '✓',
            title: 'Bảo mật và riêng tư',
            description: 'Thông tin của bạn được bảo mật tuyệt đối theo tiêu chuẩn quốc tế.'
        },
        {
            icon: '✓',
            title: 'Tiện ích và dễ sử dụng',
            description: 'Giao diện thân thiện, dễ sử dụng cho mọi đối tượng người dùng.'
        },
        {
            icon: '✓',
            title: 'Đội ngũ y bác sĩ chuyên nghiệp',
            description: 'Đội ngũ bác sĩ giàu kinh nghiệm trong lĩnh vực chăm sóc HIV.'
        },
        {
            icon: '✓',
            title: 'Theo dõi sức khỏe toàn diện',
            description: 'Hệ thống theo dõi sức khỏe 24/7 với các chỉ số chi tiết.'
        },
        {
            icon: '✓',
            title: 'Thông tin khoa học đáng tin cậy',
            description: 'Cung cấp thông tin y khoa chính xác từ các nguồn uy tín.'
        },
        {
            icon: '✓',
            title: 'Cộng đồng hỗ trợ',
            description: 'Kết nối với cộng đồng người cùng hoàn cảnh để chia sẻ kinh nghiệm.'
        }
    ];

    return (
        <section className="benefits-section">
            <div className="container">
                <div className="section-header">
                    <h2>Lợi ích của hệ thống</h2>
                    <p>Tại sao nên lựa chọn dịch vụ của chúng tôi? Đây là những lợi ích mà bạn sẽ nhận được khi sử dụng dịch vụ.</p>
                </div>
                <div className="benefits-grid">
                    {benefits.map((benefit, index) => (
                        <div key={index} className="benefit-item">
                            <div className="benefit-icon">{benefit.icon}</div>
                            <div className="benefit-content">
                                <h3>{benefit.title}</h3>
                                <p>{benefit.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ContactSection />
        </section>
    );
};

export default BenefitsSection;