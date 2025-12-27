/**
 * Services.jsx - Trang dịch vụ y tế chính
 *
 * Chức năng:
 * - Hiển thị tất cả dịch vụ y tế có sẵn
 * - Navigation đến các trang dịch vụ cụ thể
 * - Service cards với icons và descriptions
 * - Responsive grid layout
 * - Integration với authentication (protected routes)
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, MessageSquare, FileText, BarChart2, Bell, Pill, ShieldCheck, History, TestTube } from 'lucide-react';
import '../../styles/theme.scss';
import './Services.scss';

const Services = () => {
    const navigate = useNavigate();

    return (
        <div className="services-page">
            <section className="services-hero">
                <h1 className="services-title">Dịch vụ của chúng tôi</h1>
                <p className="services-desc">
                    Chúng tôi cung cấp các dịch vụ chăm sóc sức khỏe HIV toàn diện, từ tư vấn đến điều trị và theo dõi.
                </p>
                <div className="services-actions">
                    <button className="service-btn" onClick={() => navigate('/services/appointments')}>Đặt lịch khám ngay</button>
                    <button className="service-btn" onClick={() => navigate('/lab-requests/create')}>Tạo lịch xét nghiệm</button>
                    <button className="service-btn secondary" onClick={() => navigate('/profile?tab=consultation')}>Tư vấn trực tuyến</button>
                </div>
            </section>

            <section className="services-list">
                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Tư vấn trực tuyến</span>
                        <h2>Trao đổi với bác sĩ chuyên khoa HIV</h2>
                        <p>Kết nối với bác sĩ qua tin nhắn hoặc video call để được tư vấn và hỗ trợ kịp thời.</p>
                        <ul>
                            <li><MessageSquare /> <div><strong>Chat trực tuyến</strong><br />Trao đổi với bác sĩ qua tin nhắn để được tư vấn về các vấn đề sức khỏe.</div></li>
                            <li><Calendar /> <div><strong>Đặt lịch tư vấn</strong><br />Chọn thời gian phù hợp để gặp bác sĩ trực tuyến.</div></li>
                            <li><FileText /> <div><strong>Lịch sử tư vấn</strong><br />Xem lại lịch sử trò chuyện và lời khuyên từ bác sĩ.</div></li>
                        </ul>
                        <button className="service-btn small secondary" onClick={() => navigate('/profile?tab=consultation')}>Tư vấn ngay</button>
                    </div>
                </div>

                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Đặt lịch khám</span>
                        <h2>Đặt lịch khám với bác sĩ chuyên khoa HIV</h2>
                        <p>Đặt lịch khám với bác sĩ chuyên khoa HIV một cách nhanh chóng và thuận tiện.</p>
                        <ul>
                            <li><Calendar /> <div><strong>Đặt lịch trực tuyến</strong><br />Nhanh chóng và thuận tiện.</div></li>
                            <li><Clock /> <div><strong>Nhắc nhở lịch hẹn</strong><br />Không bỏ lỡ cuộc hẹn quan trọng.</div></li>
                            <li><CheckCircle /> <div><strong>Xác nhận tự động</strong><br />Gửi qua email/SMS sau khi đặt lịch.</div></li>
                        </ul>
                        <button className="service-btn small" onClick={() => navigate('/services/appointments')}>Đặt lịch khám</button>
                    </div>
                </div>
                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Đội ngũ bác sĩ chuyên nghiệp</span>
                        <h2>Chăm sóc tận tâm cùng các chuyên gia hàng đầu về HIV</h2>
                        <p>Chúng tôi tự hào sở hữu đội ngũ bác sĩ có chuyên môn cao, giàu kinh nghiệm và luôn đặt sức khỏe của bạn lên hàng đầu.</p>
                        <ul>
                            <li><Calendar /> <div><strong>Lên lịch dễ dàng</strong><br />Tư vấn và khám bệnh theo khung giờ linh hoạt.</div></li>
                            <li><Clock /> <div><strong>Phục vụ tận tâm</strong><br />Luôn đúng giờ và đồng hành cùng bạn trong suốt quá trình điều trị.</div></li>
                            <li><CheckCircle /> <div><strong>Uy tín & chuyên nghiệp</strong><br />Cam kết chất lượng khám chữa bệnh và bảo mật thông tin tuyệt đối.</div></li>
                        </ul>
                        <button className="service-btn small" onClick={() => navigate('/services/DoctorList')}>
                            Xem danh sách đội ngũ bác sĩ
                        </button>
                    </div>
                </div>



                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Quản lý thuốc ARV</span>
                        <h2>Theo dõi lịch uống thuốc và nhận nhắc nhở</h2>
                        <p>Công cụ quản lý thuốc ARV giúp bạn tuân thủ điều trị và theo dõi hiệu quả của thuốc.</p>
                        <ul>
                            <li><Pill /> <div><strong>Lịch uống thuốc</strong><br />Đánh dấu sau mỗi lần uống.</div></li>
                            <li><Bell /> <div><strong>Nhắc nhở uống thuốc</strong><br />Thông báo đúng giờ.</div></li>
                            <li><BarChart2 /> <div><strong>Theo dõi điều trị</strong><br />Thống kê tuân thủ hàng tuần.</div></li>
                        </ul>
                        <button className="service-btn small" onClick={() => navigate('/medication')}>Quản lý thuốc</button>
                    </div>
                </div>

                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Tạo lịch xét nghiệm</span>
                        <h2>Đặt lịch xét nghiệm CD4, tải lượng HIV và các xét nghiệm khác</h2>
                        <p>Tạo yêu cầu xét nghiệm trực tuyến, chọn loại xét nghiệm phù hợp và theo dõi trạng thái xét nghiệm.</p>
                        <ul>
                            <li><TestTube /> <div><strong>Xét nghiệm CD4</strong><br />Đánh giá hệ miễn dịch và tiến trình điều trị.</div></li>
                            <li><BarChart2 /> <div><strong>Xét nghiệm tải lượng HIV</strong><br />Kiểm tra hiệu quả điều trị ARV.</div></li>
                            <li><Calendar /> <div><strong>Lịch xét nghiệm</strong><br />Đặt lịch và nhận nhắc nhở tự động.</div></li>
                        </ul>
                        <button className="service-btn small" onClick={() => navigate('/lab-requests/create')}>Tạo lịch xét nghiệm</button>
                    </div>
                </div>

                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Kết quả xét nghiệm</span>
                        <h2>Truy cập kết quả xét nghiệm CD4 và tải lượng HIV</h2>
                        <p>Xem kết quả xét nghiệm trực tuyến, theo dõi tiến trình điều trị và lưu trữ hồ sơ y tế.</p>
                        <ul>
                            <li><FileText /> <div><strong>Kết quả xét nghiệm</strong><br />Xem trực tuyến và tải về.</div></li>
                            <li><BarChart2 /> <div><strong>Biểu đồ theo dõi</strong><br />Theo dõi tiến triển qua biểu đồ.</div></li>
                            <li><Bell /> <div><strong>Thông báo kết quả</strong><br />Cập nhật khi có kết quả mới.</div></li>
                        </ul>
                        <button className="service-btn small secondary" onClick={() => navigate('/lab-results')}>Xem kết quả</button>
                    </div>
                </div>

                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Lịch sử điều trị</span>
                        <h2>Theo dõi lịch sử thay đổi trong quá trình điều trị</h2>
                        <p>Xem lại các thay đổi phác đồ điều trị và đơn thuốc trong quá trình điều trị HIV của bạn.</p>
                        <ul>
                            <li><History /> <div><strong>Lịch sử phác đồ</strong><br />Xem các thay đổi phác đồ ARV theo thời gian.</div></li>
                            <li><Pill /> <div><strong>Lịch sử đơn thuốc</strong><br />Theo dõi các thay đổi trong đơn thuốc điều trị.</div></li>
                            <li><Calendar /> <div><strong>Timeline điều trị</strong><br />Xem dòng thời gian chi tiết của quá trình điều trị.</div></li>
                        </ul>
                        <button className="service-btn small secondary" onClick={() => navigate('/treatment-history')}>Xem lịch sử điều trị</button>
                    </div>
                </div>

                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Tư vấn ẩn danh</span>
                        <h2>Trao đổi bảo mật và ẩn danh với chuyên gia</h2>
                        <p>Dịch vụ tư vấn ẩn danh giúp bạn thoải mái chia sẻ và nhận hỗ trợ mà không lo ngại về danh tính.</p>
                        <ul>
                            <li><ShieldCheck /> <div><strong>Bảo mật tuyệt đối</strong><br />Không ai biết danh tính thật của bạn.</div></li>
                            <li><MessageSquare /> <div><strong>Tư vấn riêng tư</strong><br />Trao đổi ẩn danh với bác sĩ giàu kinh nghiệm.</div></li>
                            <li><Clock /> <div><strong>Hỗ trợ 24/7</strong><br />Luôn sẵn sàng lắng nghe bạn mọi lúc, mọi nơi.</div></li>
                        </ul>
                        <button className="service-btn small secondary" onClick={() => navigate('/consult-anonymous')}>Tư vấn ẩn danh</button>
                    </div>
                </div>

                <div className="service-card">
                    <div className="content">
                        <span className="service-label">Lịch sử & hồ sơ</span>
                        <h2>Theo dõi lịch sử tư vấn và thông tin cá nhân</h2>
                        <p>Xem lại toàn bộ lịch sử tư vấn, kết quả khám và hồ sơ sức khỏe một cách dễ dàng.</p>
                        <ul>
                            <li><History /> <div><strong>Lịch sử tư vấn</strong><br />Xem lại các buổi tư vấn đã diễn ra.</div></li>
                            <li><FileText /> <div><strong>Kết quả & ghi chú</strong><br />Xem lại kết quả xét nghiệm và ghi chú từ bác sĩ.</div></li>
                            <li><ShieldCheck /> <div><strong>Bảo mật thông tin</strong><br />Hồ sơ cá nhân được bảo vệ nghiêm ngặt.</div></li>
                        </ul>
                        <button className="service-btn small secondary" onClick={() => navigate('/profile')}>Xem hồ sơ</button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Services;
