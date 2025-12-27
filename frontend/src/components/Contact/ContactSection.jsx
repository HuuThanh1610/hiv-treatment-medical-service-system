import React from 'react';

const ContactSection = () => {
    return (
        <section className="contact-section">
            <div className="container">
                <h2>Liên Hệ</h2>
                <form className="contact-form">
                    <div className="form-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Họ và tên"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            className="form-control"
                            placeholder="Email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="Số điện thoại"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <textarea
                            className="form-control"
                            rows="5"
                            placeholder="Nội dung tin nhắn"
                            required
                        ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Gửi tin nhắn
                    </button>
                </form>
            </div>
        </section>
    );
};

export default ContactSection; 