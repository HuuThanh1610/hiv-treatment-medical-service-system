import React from 'react';

const TestimonialsSection = () => {
    const testimonials = [
        {
            name: 'Nguyễn A.',
            role: 'Bệnh nhân',
            content: 'Dịch vụ rất tốt, đội ngũ y bác sĩ chuyên nghiệp và tận tâm. Tôi cảm thấy an tâm khi được chăm sóc tại đây.',
            rating: 5
        },
        {
            name: 'Trần B.',
            role: 'Bệnh nhân',
            content: 'Hệ thống đặt lịch online rất tiện lợi, không cần phải chờ đợi lâu. Kết quả xét nghiệm cũng có rất nhanh.',
            rating: 5
        },
        {
            name: 'Bùi C. Nguyễn',
            role: 'Bệnh nhân',
            content: 'Cảm ơn đội ngũ y tế đã hỗ trợ tôi trong suốt quá trình điều trị. Tôi đã cải thiện được rất nhiều.',
            rating: 5
        }
    ];

    return (
        <section className="testimonials-section">
            <div className="container">
                <div className="section-header">
                    <h2>Phản hồi từ người dùng</h2>
                    <p>Những chia sẻ từ người dùng đã trải nghiệm dịch vụ của chúng tôi.</p>
                </div>
                <div className="testimonials-grid">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="testimonial-card">
                            <div className="testimonial-content">
                                <div className="stars">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <span key={i}>⭐</span>
                                    ))}
                                </div>
                                <p>"{testimonial.content}"</p>
                            </div>
                            <div className="testimonial-author">
                                <div className="author-avatar">
                                    <span>{testimonial.name.charAt(0)}</span>
                                </div>
                                <div className="author-info">
                                    <h4>{testimonial.name}</h4>
                                    <span>{testimonial.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;