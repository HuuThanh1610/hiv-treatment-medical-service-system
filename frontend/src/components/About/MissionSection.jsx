import React from 'react';
import { FaBullseye, FaHeart, FaLock, FaGlobe, FaUsers, FaFlask } from 'react-icons/fa';
import './MissionSection.scss';

const MissionSection = () => {
    return (
        <>
            <section className="mission-section">
                <div className="container">
                    <div className="mission-intro-section">
                        <div className="mission-intro" style={{ textAlign: 'left', flex: 1 }}>
                            <div className="section-tag ">
                                <span className="section-label">Về chúng tôi</span>
                                <h2>Về chúng tôi</h2>
                            </div>
                            <p>
                                Tại trung tâm của chúng tôi là khát vọng: mọi người sống
                                chung với HIV đều xứng đáng nhận được sự chăm sóc y tế tận tâm,
                                đầy nhân ái và không kỳ thị. Chúng tôi không chỉ là một tổ chức y tế –
                                chúng tôi là những người đồng hành, là niềm tin và là hi vọng cho
                                hàng nghìn bệnh nhân trên hành trình chữa lành và sống khỏe.
                            </p>

                            <div className="mission-values">
                                <div className="value-item">
                                    <div className="value-icon"><FaBullseye /></div>
                                    <div className="value-content">
                                        <h4>Chuyên nghiệp</h4>
                                        <p>Đội ngũ y bác sĩ được đào tạo bài bản, giàu kinh nghiệm và luôn cập nhật các phương pháp điều trị tiên tiến nhất.</p>
                                    </div>
                                </div>

                                <div className="value-item">
                                    <div className="value-icon"><FaHeart /></div>
                                    <div className="value-content">
                                        <h4>Tận tâm chăm sóc</h4>
                                        <p>Chúng tôi lắng nghe bằng trái tim, hành động bằng sự thấu cảm và đồng hành cùng bạn trong mọi chặng đường điều trị.</p>
                                    </div>
                                </div>

                                <div className="value-item">
                                    <div className="value-icon"><FaLock /></div>
                                    <div className="value-content">
                                        <h4>Bảo mật thông tin</h4>
                                        <p>Mọi thông tin cá nhân và y tế của bạn đều được bảo vệ tuyệt đối, vì sự an tâm của bạn là ưu tiên hàng đầu của chúng tôi.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mission-vision-list" style={{ textAlign: 'left', flex: 1, marginLeft: '3rem' }}>
                            <div className="section-tag">
                                <span className="section-label">Tầm nhìn</span>
                                <h2>Tầm nhìn của chúng tôi</h2>
                            </div>
                            <p>Chúng tôi hướng tới một tương lai nơi mọi bệnh nhân HIV không chỉ được sống khỏe mạnh và
                                tự tin, mà còn được đồng hành bằng sự thấu hiểu, lòng nhân ái và những tiến bộ vượt bậc
                                của y học hiện đại. Mỗi cá nhân đều xứng đáng được chăm sóc toàn diện,
                                được lắng nghe và được truyền cảm hứng để sống một cuộc đời trọn vẹn và có ý nghĩa..
                            </p>
                            <div className="mission-values">
                                <div className="value-item">
                                    <div className="value-icon"><FaGlobe /></div>
                                    <div className="value-content">
                                        <h4>Hợp tác toàn cầu</h4>
                                        <p>Chúng tôi xây dựng mạng lưới hợp tác với các tổ chức quốc tế để mang lại giải pháp điều trị tiên tiến nhất.</p>
                                    </div>
                                </div>

                                <div className="value-item">
                                    <div className="value-icon"><FaUsers /></div>
                                    <div className="value-content">
                                        <h4>Cộng đồng là trung tâm</h4>
                                        <p>Mọi hoạt động đều lấy bệnh nhân làm trọng tâm, thúc đẩy sự đồng hành và kết nối xã hội.</p>
                                    </div>
                                </div>

                                <div className="value-item">
                                    <div className="value-icon"><FaFlask /></div>
                                    <div className="value-content">
                                        <h4>Đổi mới và nghiên cứu</h4>
                                        <p>Liên tục cải tiến và áp dụng khoa học vào thực tiễn để nâng cao hiệu quả chăm sóc sức khỏe HIV.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mission-section">
                <div className="container">
                    <div className="mission-vision" style={{ textAlign: 'left' }}>
                        <div className="section-tag ">
                            <span className="section-label">Sứ mệnh</span>
                            <h2>Sứ mệnh của chúng tôi</h2>
                        </div>
                        <div className="mission-cards">
                            <div className="mission-card">
                                <h3>Tầm nhìn của chúng tôi</h3>
                                <p>
                                    Chúng tôi hướng đến một tương lai nơi mọi người sống chung với HIV đều được trao quyền, được chăm sóc y tế toàn diện, và sống trong một xã hội đầy yêu thương và công bằng.
                                    Không chỉ dẫn đầu về chuyên môn, chúng tôi muốn trở thành biểu tượng của hy vọng, sự hồi sinh và khát vọng sống.
                                </p>
                            </div>

                            <div className="mission-card">
                                <h3>Giá trị cốt lõi</h3>
                                <ul>
                                    <li>Tôn trọng sự khác biệt và luôn đối xử công bằng</li>
                                    <li>Đặt chất lượng và đạo đức nghề nghiệp lên hàng đầu</li>
                                    <li>Minh bạch, trung thực và trách nhiệm trong từng hành động</li>
                                    <li>Luôn hỗ trợ bệnh nhân bằng tất cả trái tim và trí tuệ</li>
                                </ul>
                            </div>

                            <div className="mission-card">
                                <h3>Cam kết của chúng tôi</h3>
                                <p>
                                    Mỗi cuộc hẹn, mỗi lần tư vấn, mỗi người bệnh đều là một câu chuyện – và chúng tôi cam kết mang đến những câu chuyện đẹp hơn mỗi ngày. Với hệ thống chăm sóc toàn diện, từ thể chất đến tinh thần, chúng tôi luôn là điểm tựa vững chắc để bạn an tâm điều trị và tiến về phía trước.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default MissionSection;
