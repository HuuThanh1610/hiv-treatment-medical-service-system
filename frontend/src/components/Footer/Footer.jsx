import React from 'react';
import './Footer.scss';
import logo from '../../assets/SWPLogo.png';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section logo-section">
                        <div className="logo">
                            <img src={logo} alt="HIV Treatment Management Logo" className="logo-img" />
                            <span className="logo-text">HIV Care</span>
                        </div>
                        <p>Chăm sóc sức khỏe HIV toàn diện</p>
                    </div>

                    <div className="footer-section links-section">
                        <div className="quick-links">
                            <a href="/">Trang chủ</a>
                            <a href="#services">Dịch vụ</a>
                            <a href="/about">Giới thiệu</a>
                            <a href="#contact">Liên hệ</a>
                        </div>
                    </div>

                    <div className="footer-section contact-section">
                        <div className="contact-info">
                            <p><FaPhoneAlt className="icon" /> <a href="tel:19009095">19009095</a></p>
                            <p><FaEnvelope className="icon" /> <a href="mailto:info@hivcare.vn">info@hivcare.vn</a></p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="copyright">
                        <p>&copy; 2024 HIV Care. Tất cả quyền được bảo lưu.</p>
                    </div>
                    <div className="footer-chat">
                        <div className="chat-widget">
                            <span>💬</span>
                            <span>Hỗ trợ 24/7</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;