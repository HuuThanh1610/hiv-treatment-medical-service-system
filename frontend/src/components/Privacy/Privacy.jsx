import React from 'react';
import { FaLock, FaUserSecret, FaShieldAlt, FaUserCheck, FaRegCheckCircle } from 'react-icons/fa';
import './Privacy.scss';

const Privacy = () => {
    return (
        <div className="privacy-page">
            <div className="privacy-hero">
                <FaLock className="privacy-hero__icon" />
                <h1>Chính Sách Bảo Mật & Quyền Riêng Tư</h1>
                <p>Chúng tôi cam kết bảo vệ tuyệt đối thông tin cá nhân và quyền riêng tư của bạn khi sử dụng hệ thống quản lý điều trị HIV.</p>
            </div>

            <div className="privacy-section">
                <h2><FaShieldAlt /> Cam Kết Bảo Mật</h2>
                <ul>
                    <li><FaRegCheckCircle /> Mọi thông tin cá nhân, hồ sơ bệnh án, kết quả xét nghiệm đều được mã hóa và lưu trữ an toàn.</li>
                    <li><FaRegCheckCircle /> Chỉ bạn mới có quyền truy cập, chỉnh sửa thông tin cá nhân của mình.</li>
                    <li><FaRegCheckCircle /> Chúng tôi không chia sẻ dữ liệu cho bên thứ ba khi chưa có sự đồng ý của bạn.</li>
                </ul>
            </div>

            <div className="privacy-section">
                <h2><FaUserSecret /> Chế Độ Ẩn Danh</h2>
                <ul>
                    <li><FaRegCheckCircle /> Bạn có thể bật/tắt chế độ ẩn danh bất cứ lúc nào để bảo vệ danh tính.</li>
                    <li><FaRegCheckCircle /> Khi ẩn danh, bác sĩ và nhân viên y tế chỉ thấy thông tin ẩn, không thể nhận diện bạn.</li>
                    <li><FaRegCheckCircle /> Dữ liệu ẩn danh vẫn được bảo vệ và sử dụng cho mục đích chăm sóc sức khỏe tốt nhất.</li>
                </ul>
            </div>

            <div className="privacy-section">
                <h2><FaUserCheck /> Quyền Lợi Người Dùng</h2>
                <ul>
                    <li><FaRegCheckCircle /> Quyền truy cập, chỉnh sửa, xóa thông tin cá nhân bất cứ lúc nào.</li>
                    <li><FaRegCheckCircle /> Quyền yêu cầu giải thích về cách dữ liệu được sử dụng và lưu trữ.</li>
                    <li><FaRegCheckCircle /> Quyền phản hồi, khiếu nại về bảo mật và quyền riêng tư.</li>
                </ul>
            </div>

            <div className="privacy-section">
                <h2><FaShieldAlt /> Tiêu Chuẩn & Công Nghệ Bảo Mật</h2>
                <ul>
                    <li><FaRegCheckCircle /> Hệ thống tuân thủ các tiêu chuẩn bảo mật quốc tế như ISO/IEC 27001.</li>
                    <li><FaRegCheckCircle /> Dữ liệu được mã hóa hai lớp, bảo vệ khỏi truy cập trái phép và rò rỉ thông tin.</li>
                    <li><FaRegCheckCircle /> Đội ngũ kỹ thuật thường xuyên kiểm tra, cập nhật và nâng cấp hệ thống bảo mật.</li>
                </ul>
            </div>

            <div className="privacy-section">
                <h2><FaShieldAlt /> Minh Bạch & Không Quảng Cáo</h2>
                <ul>
                    <li><FaRegCheckCircle /> Chúng tôi cam kết không sử dụng dữ liệu của bạn cho mục đích quảng cáo hay thương mại hóa.</li>
                    <li><FaRegCheckCircle /> Mọi hoạt động xử lý dữ liệu đều minh bạch, có thể kiểm tra và đối soát.</li>
                    <li><FaRegCheckCircle /> Bạn có thể yêu cầu xuất toàn bộ lịch sử truy cập, chỉnh sửa dữ liệu cá nhân bất cứ lúc nào.</li>
                </ul>
            </div>

            <div className="privacy-section">
                <h2><FaUserCheck /> Đồng Hành Cùng Chuyên Gia Y Tế</h2>
                <ul>
                    <li><FaRegCheckCircle /> Đội ngũ chuyên gia y tế, bác sĩ, kỹ sư CNTT luôn đồng hành để bảo vệ quyền lợi và sự riêng tư của bạn.</li>
                    <li><FaRegCheckCircle /> Mọi thắc mắc về bảo mật sẽ được giải đáp nhanh chóng, tận tâm.</li>
                </ul>
            </div>

            <div className="privacy-section privacy-section--contact">
                <h2>Liên hệ & Hỗ trợ</h2>
                <p>Nếu bạn có bất kỳ thắc mắc hoặc cần hỗ trợ về quyền riêng tư, vui lòng liên hệ đội ngũ hỗ trợ của chúng tôi qua email: <a href="mailto:privacy@hivcare.vn">privacy@hivcare.vn</a></p>
            </div>
        </div>
    );
};

export default Privacy;
