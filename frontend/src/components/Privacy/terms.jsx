import React from 'react';
import { FaGavel, FaUserShield, FaUserCheck, FaExclamationTriangle, FaSyncAlt, FaEnvelopeOpenText } from 'react-icons/fa';
import './terms.scss';

const Terms = () => {
    return (
        <div className="terms-page">
            <div className="terms-hero">
                <FaGavel className="terms-hero__icon" />
                <h1>Điều Khoản Sử Dụng</h1>
                <p>Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng hệ thống quản lý điều trị HIV của chúng tôi.</p>
            </div>

            <div className="terms-section">
                <h2><FaUserShield /> 1. Giới Thiệu & Phạm Vi Áp Dụng</h2>
                <p>Hệ thống quản lý điều trị HIV được xây dựng nhằm hỗ trợ người bệnh, bác sĩ và nhân viên y tế trong việc quản lý, theo dõi, tư vấn và bảo vệ quyền riêng tư tối đa cho người dùng. Điều khoản này áp dụng cho tất cả các cá nhân, tổ chức truy cập, sử dụng dịch vụ trên hệ thống.</p>
                <ul>
                    <li>Điều khoản này áp dụng cho tất cả người dùng truy cập và sử dụng hệ thống quản lý điều trị HIV.</li>
                    <li>Bằng việc sử dụng hệ thống, bạn đồng ý tuân thủ mọi quy định trong điều khoản này.</li>
                    <li>Chúng tôi có thể yêu cầu xác thực danh tính để đảm bảo an toàn cho tài khoản và dữ liệu.</li>
                </ul>
            </div>

            <div className="terms-section">
                <h2><FaUserCheck /> 2. Quyền & Nghĩa Vụ Người Dùng</h2>
                <p>Bạn có quyền truy cập, sử dụng các chức năng của hệ thống theo đúng quy định. Đồng thời, bạn có trách nhiệm bảo mật thông tin tài khoản, không chia sẻ cho người khác và sử dụng hệ thống một cách trung thực, hợp pháp.</p>
                <ul>
                    <li>Cung cấp thông tin chính xác, trung thực khi đăng ký và sử dụng dịch vụ.</li>
                    <li>Bảo mật tài khoản, không chia sẻ thông tin đăng nhập cho người khác.</li>
                    <li>Chịu trách nhiệm về mọi hoạt động phát sinh từ tài khoản của mình.</li>
                    <li>Không sử dụng hệ thống cho mục đích vi phạm pháp luật, phát tán thông tin sai lệch, gây hại cho cá nhân/tổ chức khác.</li>
                    <li>Thông báo ngay cho chúng tôi khi phát hiện có dấu hiệu truy cập trái phép hoặc rò rỉ thông tin.</li>
                </ul>
            </div>

            <div className="terms-section">
                <h2><FaUserShield /> 3. Quyền & Nghĩa Vụ Của Hệ Thống</h2>
                <p>Chúng tôi cam kết bảo mật, lưu trữ và xử lý dữ liệu cá nhân của người dùng theo đúng quy định pháp luật và chính sách bảo mật. Hệ thống luôn nỗ lực duy trì dịch vụ ổn định, hỗ trợ người dùng tận tâm và minh bạch trong mọi hoạt động xử lý dữ liệu.</p>
                <ul>
                    <li>Bảo mật, lưu trữ và xử lý dữ liệu cá nhân của người dùng theo đúng quy định pháp luật và chính sách bảo mật.</li>
                    <li>Cung cấp dịch vụ liên tục, ổn định, hỗ trợ người dùng tận tâm.</li>
                    <li>Có quyền tạm ngưng, chấm dứt tài khoản nếu phát hiện vi phạm điều khoản hoặc có dấu hiệu gian lận, lạm dụng hệ thống.</li>
                    <li>Thông báo kịp thời cho người dùng về các thay đổi quan trọng liên quan đến tài khoản hoặc dịch vụ.</li>
                </ul>
            </div>

            <div className="terms-section">
                <h2><FaExclamationTriangle /> 4. Giới Hạn Trách Nhiệm</h2>
                <p>Chúng tôi không chịu trách nhiệm với các thiệt hại phát sinh do người dùng vi phạm điều khoản hoặc do các sự cố ngoài ý muốn như thiên tai, mất điện, tấn công mạng... Người dùng tự chịu trách nhiệm về nội dung, thông tin mình đăng tải lên hệ thống.</p>
                <ul>
                    <li>Hệ thống không chịu trách nhiệm với các thiệt hại phát sinh do người dùng vi phạm điều khoản hoặc do sự cố ngoài ý muốn (mất điện, thiên tai, tấn công mạng...).</li>
                    <li>Chúng tôi không chịu trách nhiệm về nội dung, thông tin do người dùng tự đăng tải lên hệ thống.</li>
                    <li>Chúng tôi không chịu trách nhiệm với các dịch vụ, liên kết ngoài hệ thống mà người dùng tự ý truy cập.</li>
                </ul>
            </div>

            <div className="terms-section">
                <h2><FaSyncAlt /> 5. Thay Đổi Điều Khoản</h2>
                <p>Chúng tôi có quyền cập nhật, thay đổi điều khoản sử dụng bất cứ lúc nào để phù hợp với quy định pháp luật và nhu cầu phát triển hệ thống. Mọi thay đổi sẽ được thông báo công khai trên hệ thống.</p>
                <ul>
                    <li>Chúng tôi có quyền cập nhật, thay đổi điều khoản sử dụng bất cứ lúc nào. Mọi thay đổi sẽ được thông báo trên hệ thống.</li>
                    <li>Việc tiếp tục sử dụng dịch vụ sau khi điều khoản thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.</li>
                    <li>Người dùng nên thường xuyên kiểm tra điều khoản để cập nhật các thay đổi mới nhất.</li>
                </ul>
            </div>

            <div className="terms-section terms-section--contact">
                <h2><FaEnvelopeOpenText /> Liên hệ & Hỗ trợ</h2>
                <p>Nếu bạn có bất kỳ thắc mắc nào về điều khoản sử dụng, vui lòng liên hệ: <a href="mailto:terms@hivcare.vn">terms@hivcare.vn</a></p>
            </div>
        </div>
    );
};

export default Terms; 