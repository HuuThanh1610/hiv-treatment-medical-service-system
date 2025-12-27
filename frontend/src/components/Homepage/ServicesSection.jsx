import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClipboardList, FaMicroscope, FaPills, FaPhoneAlt, FaChartBar, FaHandsHelping } from 'react-icons/fa';
import './ServicesSection.scss';

const ServicesSection = () => {
    const navigate = useNavigate();

    const services = [
        {
            icon: <FaClipboardList />,
            title: 'Đặt lịch khám',
            description: 'Đặt lịch khám nhanh chóng và thuận tiện qua hệ thống online của chúng tôi.',
            link: '/services/appointments'
        },
        {
            icon: <FaMicroscope />,
            title: 'Kết quả xét nghiệm',
            description: 'Xem kết quả xét nghiệm trực tuyến một cách bảo mật và nhanh chóng.',
            link: '/lab-results'
        },
        {
            icon: <FaPills />,
            title: 'Quản lý thuốc ARV',
            description: 'Theo dõi và quản lý việc sử dụng thuốc ARV một cách hiệu quả.',
            link: '/medication'
        },
        {
            icon: <FaPhoneAlt />,
            title: 'Tư vấn trực tuyến',
            description: 'Nhận tư vấn từ các chuyên gia y tế qua hệ thống tư vấn trực tuyến.',
            link: '/profile?tab=consultation'
        },
        {
            icon: <FaChartBar />,
            title: 'Tư vấn dinh dưỡng',
            description: 'Tư vấn chế độ dinh dưỡng phù hợp cho người nhiễm HIV.',
            link: '/services'
        },
        {
            icon: <FaHandsHelping />,
            title: 'Hỗ trợ cộng đồng',
            description: 'Kết nối với cộng đồng và nhận hỗ trợ từ những người có cùng hoàn cảnh.',
            link: '/user/blog' // Chuyển hướng sang trang blog cộng đồng
        }
    ];

    const handleServiceClick = (link) => {
        navigate(link);
    };

    return (
        <section className="homepage-services-section">
            <div className="homepage-container">
                <div className="homepage-section-header">
                    <h2>Dịch vụ của chúng tôi</h2>
                    <p>Chúng tôi cung cấp các dịch vụ chăm sóc sức khỏe HIV toàn diện, từ tư vấn đến điều trị và hỗ trợ.</p>
                </div>
                <div className="homepage-services-grid">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="homepage-service-card"
                            onClick={() => handleServiceClick(service.link)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="homepage-service-icon">{service.icon}</div>
                            <h3>{service.title}</h3>
                            <p>{service.description}</p>
                            <button className="homepage-service-btn">Tìm hiểu thêm</button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;