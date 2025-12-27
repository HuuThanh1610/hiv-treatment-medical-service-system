import React from 'react';

import { FaRegCalendarAlt } from 'react-icons/fa';

const HistorySection = () => {
    const milestones = [
        {
            year: '2020',
            title: 'Thành lập',
            description:
                'Với tầm nhìn mang đến dịch vụ chăm sóc sức khỏe HIV chất lượng, dễ tiếp cận và nhân văn, HIV Treatment ra đời như một ngọn lửa tiên phong – thắp lên hy vọng mới cho cộng đồng chịu ảnh hưởng bởi HIV/AIDS tại Việt Nam.',
        },
        {
            year: '2021',
            title: 'Mở rộng dịch vụ',
            description:
                'Chúng tôi phát triển hệ thống quản lý bệnh nhân thông minh và nền tảng tư vấn trực tuyến 24/7, giúp hàng ngàn bệnh nhân trên khắp cả nước được tiếp cận hỗ trợ kịp thời, không còn rào cản về khoảng cách hay sự kỳ thị.',
        },
        {
            year: '2022',
            title: 'Đối tác chiến lược',
            description:
                'HIV Treatment tự hào bắt tay cùng các bệnh viện đầu ngành và tổ chức y tế quốc tế như UNAIDS, WHO..., tạo dựng hệ sinh thái y tế toàn diện – từ phòng khám đến cộng đồng – đồng hành cùng người bệnh trên mọi chặng đường điều trị.',
        },
        {
            year: '2023',
            title: 'Công nghệ hiện đại',
            description:
                'Chúng tôi tích hợp AI trong chẩn đoán, cá nhân hóa liệu trình ARV và số hóa toàn bộ quy trình điều trị. Nhờ đó, việc theo dõi tiến triển điều trị trở nên chính xác, chủ động và hiệu quả hơn bao giờ hết.',
        },
        {
            year: '2024',
            title: 'Hiện tại & tương lai',
            description:
                'HIV Treatment không ngừng cải tiến để trở thành nền tảng chăm sóc sức khỏe HIV toàn diện, dẫn đầu tại Việt Nam và vươn tầm khu vực. Hành trình vẫn tiếp tục – vì một thế giới không còn kỳ thị và ai cũng có quyền được sống khỏe mạnh, tự tin.',
        },
    ];

    return (
        <section className="history-section">
            <div className="container">
                <div className="section-header">
                    <h2>Lịch sử phát triển</h2>
                    <p>Hành trình xây dựng và phát triển hệ thống chăm sóc sức khỏe HIV chuyên nghiệp</p>
                </div>

                <div className="timeline">
                    {milestones.map((milestone, index) => (
                        <div key={index} className="timeline-item">
                            <div className="timeline-icon"><FaRegCalendarAlt /></div>
                            <div className="timeline-box">
                                <span className="timeline-year">{milestone.year}</span>
                                <h3 className="timeline-title">{milestone.title}</h3>
                                <p className="timeline-description">{milestone.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HistorySection;
