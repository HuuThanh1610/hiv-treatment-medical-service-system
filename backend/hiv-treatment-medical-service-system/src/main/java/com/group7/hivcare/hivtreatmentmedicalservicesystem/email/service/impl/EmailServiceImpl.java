package com.group7.hivcare.hivtreatmentmedicalservicesystem.email.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.email.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender emailSender;

    @Override
    public void sendVerificationEmail(String to, String verificationCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Xác nhận đăng ký tài khoản");
        message.setText("Mã xác nhận của bạn là: " + verificationCode + "\n\n" +
                "Mã này sẽ hết hạn sau 10 phút.\n" +
                "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.");
        
        emailSender.send(message);
    }

    @Override
    public void sendRevisitAppointmentCreatedEmail(String to, String patientName, String doctorName, String revisitDate, String notes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Nhắc hẹn tái khám - HIV Care");

        StringBuilder content = new StringBuilder();
        content.append("Kính gửi ").append(patientName).append(",\n\n");
        content.append("🔔 Đây là thông báo nhắc hẹn tái khám từ bác sĩ ").append(doctorName).append(".\n\n");
        content.append("📅 Thông tin hẹn tái khám:\n");
        content.append("- Ngày hẹn tái khám: ").append(revisitDate).append("\n");
        content.append("- Bác sĩ phụ trách: ").append(doctorName).append("\n");
        if (notes != null && !notes.trim().isEmpty()) {
            content.append("- Ghi chú từ bác sĩ: ").append(notes).append("\n");
        }
        content.append("\n✅ Lưu ý quan trọng:\n");
        content.append("- Vui lòng đến đúng ngày đã hẹn để đảm bảo quá trình điều trị hiệu quả\n");
        content.append("- Mang theo sổ khám bệnh và đơn thuốc cũ\n");
        content.append("- Nếu có thay đổi lịch trình, vui lòng liên hệ phòng khám trước\n\n");
        content.append("💊 Hãy tiếp tục tuân thủ phác đồ điều trị và duy trì lối sống lành mạnh.\n\n");
        content.append("Chúc bạn nhiều sức khỏe!\n");
        content.append("Trân trọng,\n");
        content.append("Hệ thống chăm sóc HIV - HIV Care");

        message.setText(content.toString());
        emailSender.send(message);
    }

    @Override
    public void sendRevisitAppointmentReminderEmail(String to, String patientName, String doctorName, String revisitDate, String notes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Nhắc nhở lịch hẹn tái khám - Ngày mai");
        
        StringBuilder content = new StringBuilder();
        content.append("Kính gửi ").append(patientName).append(",\n\n");
        content.append("Đây là thông báo nhắc nhở về lịch hẹn tái khám của bạn.\n\n");
        content.append("Chi tiết lịch hẹn:\n");
        content.append("- Ngày tái khám: ").append(revisitDate).append(" (NGÀY MAI)\n");
        content.append("- Bác sĩ phụ trách: ").append(doctorName).append("\n");
        if (notes != null && !notes.trim().isEmpty()) {
            content.append("- Ghi chú: ").append(notes).append("\n");
        }
        content.append("\nVui lòng chuẩn bị:\n");
        content.append("- Đến đúng giờ hẹn\n");
        content.append("- Mang theo các loại thuốc đang sử dụng\n");
        content.append("- Chuẩn bị các câu hỏi cần tư vấn\n\n");
        content.append("Nếu không thể đến, vui lòng liên hệ với phòng khám để sắp xếp lại.\n\n");
        content.append("Trân trọng,\n");
        content.append("Hệ thống chăm sóc HIV");
        
        message.setText(content.toString());
        emailSender.send(message);
    }
} 