import React, { useState } from 'react';
import './Contact.scss';
import {
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaPaperPlane
} from 'react-icons/fa';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Gửi tin nhắn thành công!');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    };

    return (
        <div className="contact-wrapper">
            <div className="contact-header">
                <h2>Liên hệ với chúng tôi</h2>
                <p>
                    Chúng tôi luôn sẵn sàng hỗ trợ bạn. Nếu có bất kỳ thắc mắc nào về dịch vụ hay sức khỏe, đừng ngần ngại liên hệ!
                </p>
            </div>

            <div className="contact-body">
                <div className="contact-info">
                    <div className="info-block">
                        <FaPhoneAlt className="info-icon" />
                        <div>
                            <h4>Điện thoại</h4>
                            <p>
                                <a href="tel:19001234">1900 1234</a><br />
                                <a href="tel:02812345678">028 1234 5678</a>
                            </p>
                        </div>
                    </div>

                    <div className="info-block">
                        <FaEnvelope className="info-icon" />
                        <div>
                            <h4>Email</h4>
                            <p>
                                <a href="mailto:info@hivcare.vn">info@hivcare.vn</a><br />
                                <a href="mailto:support@hivcare.vn">support@hivcare.vn</a>
                            </p>
                        </div>
                    </div>

                    <div className="info-block">
                        <FaMapMarkerAlt className="info-icon" />
                        <div>
                            <h4>Địa chỉ</h4>
                            <p>123 Nguyễn Văn A, Quận 1<br />TP. Hồ Chí Minh</p>
                        </div>
                    </div>

                    <div className="info-block">
                        <FaClock className="info-icon" />
                        <div>
                            <h4>Giờ làm việc</h4>
                            <p>
                                Thứ 2 - Thứ 6: 8:00 - 17:00<br />
                                Thứ 7: 8:00 - 12:00<br />
                                Chủ nhật: Đóng cửa
                            </p>
                        </div>
                    </div>
                </div>

                <div className="contact-form">
                    <h4>Gửi tin nhắn cho chúng tôi</h4>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <input type="text" name="name" placeholder="Họ và tên *" required value={formData.name} onChange={handleChange} />
                            <input type="email" name="email" placeholder="Email *" required value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <input type="text" name="phone" placeholder="Số điện thoại" value={formData.phone} onChange={handleChange} />
                            <input type="text" name="subject" placeholder="Chủ đề" value={formData.subject} onChange={handleChange} />
                        </div>
                        <textarea name="message" placeholder="Nội dung tin nhắn *" rows="5" required value={formData.message} onChange={handleChange}></textarea>
                        <button type="submit"><FaPaperPlane className="icon" /> Gửi tin nhắn</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
