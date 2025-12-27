package com.group7.hivcare.hivtreatmentmedicalservicesystem.notification.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final JavaMailSender mailSender;

    @Override
    public void sendNewSubstituteScheduleNotification(String to, String doctorName, String date, String startTime,
            String endTime, String notes) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Thông báo ca trực thay thế mới");
        String content = String.format(
                "Kính gửi Bác sĩ %s,\n\n" +
                        "Bạn vừa được phân công ca trực thay thế với thông tin sau:\n" +
                        "- Ngày: %s\n" +
                        "- Thời gian: %s - %s\n",
                doctorName, date, startTime, endTime);
        if (notes != null && !notes.isEmpty()) {
            content += String.format("- Ghi chú: %s\n", notes);
        }
        content += "\nVui lòng kiểm tra lịch làm việc của bạn trên hệ thống.\n\nTrân trọng,\nHệ thống quản lý điều trị HIV";
        message.setText(content);
        mailSender.send(message);
    }

    /**
     * Gửi email thông báo duyệt/từ chối đơn xin nghỉ cho bác sĩ
     * 
     * @param to         email bác sĩ
     * @param doctorName tên bác sĩ
     * @param approved   true nếu duyệt, false nếu từ chối
     * @param reason     lý do từ chối (nếu có)
     */
    public void sendLeaveRequestResult(String to, String doctorName, boolean approved, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Kết quả đơn xin nghỉ");
        String content;
        if (approved) {
            content = String.format(
                    "Kính gửi Bác sĩ %s,\n\n" +
                            "Đơn xin nghỉ của bạn đã được phê duyệt.\n\n" +
                            "Chúc bạn nhiều sức khỏe!\n\n" +
                            "Trân trọng,\nHệ thống quản lý điều trị HIV",
                    doctorName);
        } else {
            content = String.format(
                    "Kính gửi Bác sĩ %s,\n\n" +
                            "Đơn xin nghỉ của bạn đã bị từ chối.%s\n\n" +
                            "Nếu có thắc mắc, vui lòng liên hệ quản trị viên.\n\n" +
                            "Trân trọng,\nHệ thống quản lý điều trị HIV",
                    doctorName,
                    (reason != null && !reason.isEmpty()) ? ("\nLý do: " + reason) : "");
        }
        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendAppointmentConfirmation(String to, String patientName, String doctorName,
            String appointmentDate, String appointmentTime,
            String medicalServiceName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Xác nhận lịch hẹn khám bệnh");

        String content = String.format(
                "Kính gửi %s,\n\n" +
                        "Chúng tôi xác nhận đã nhận được yêu cầu đặt lịch hẹn của bạn với thông tin như sau:\n\n" +
                        "Bác sĩ: %s\n" +
                        "Dịch vụ: %s\n" +
                        "Ngày khám: %s\n" +
                        "Giờ khám: %s\n\n" +
                        "Lịch hẹn của bạn đang ở trạng thái chờ xác nhận từ bác sĩ. " +
                        "Chúng tôi sẽ thông báo ngay khi bác sĩ xác nhận lịch hẹn.\n\n" +
                        "Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.\n\n" +
                        "Trân trọng,\n" +
                        "Hệ thống đặt lịch khám bệnh",
                patientName, doctorName, medicalServiceName, appointmentDate, appointmentTime);

        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendNewAppointmentNotification(String to, String doctorName, String patientName,
            String appointmentDate, String appointmentTime,
            String medicalServiceName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Thông báo lịch hẹn khám bệnh mới");

        String content = String.format(
                "Kính gửi Bác sĩ %s,\n\n" +
                        "Bạn có một lịch hẹn khám bệnh mới với thông tin như sau:\n\n" +
                        "Bệnh nhân: %s\n" +
                        "Dịch vụ: %s\n" +
                        "Ngày khám: %s\n" +
                        "Giờ khám: %s\n\n" +
                        "Vui lòng đăng nhập vào hệ thống để xác nhận lịch hẹn này.\n\n" +
                        "Trân trọng,\n" +
                        "Hệ thống đặt lịch khám bệnh",
                doctorName, patientName, medicalServiceName, appointmentDate, appointmentTime);

        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendAppointmentCancellation(String to, String recipientName, String otherPartyName,
            String appointmentDate, String appointmentTime,
            String medicalServiceName, String cancellationReason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Thông báo hủy lịch hẹn khám bệnh");

        String content = String.format(
                "Kính gửi %s,\n\n" +
                        "Lịch hẹn khám bệnh của bạn đã bị hủy với thông tin như sau:\n\n" +
                        "Bác sĩ: %s\n" +
                        "Dịch vụ: %s\n" +
                        "Ngày khám: %s\n" +
                        "Giờ khám: %s\n" +
                        "Lý do hủy: %s\n\n" +
                        "Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với chúng tôi.\n\n" +
                        "Trân trọng,\n" +
                        "Hệ thống đặt lịch khám bệnh",
                recipientName, otherPartyName, medicalServiceName, appointmentDate, appointmentTime,
                cancellationReason);

        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendStaffApprovalNotification(String to, String doctorName, String patientName,
            String appointmentDate, String appointmentTime,
            String medicalServiceName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Thông báo lịch hẹn mới đã được xác nhận");

        String content = String.format(
                "Kính gửi Bác sĩ %s,\n\n" +
                        "Một lịch hẹn khám bệnh mới đã được xác nhận và thêm vào lịch của bạn với thông tin như sau:\n\n"
                        +
                        "Bệnh nhân: %s\n" +
                        "Dịch vụ: %s\n" +
                        "Ngày khám: %s\n" +
                        "Giờ khám: %s\n\n" +
                        "Vui lòng kiểm tra lịch của bạn để chuẩn bị cho buổi khám bệnh.\n\n" +
                        "Trân trọng,\n" +
                        "Hệ thống đặt lịch khám bệnh",
                doctorName, patientName, medicalServiceName, appointmentDate, appointmentTime);

        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendMedicationReminder(String to, String patientName, String medicationName,
            String dosage, String time, String reminderId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Nhắc nhở uống thuốc ARV - " + medicationName);

        String content = String.format(
                "Kính gửi %s,\n\n" +
                        "Đây là nhắc nhở uống thuốc ARV của bạn:\n\n" +
                        "📋 Thông tin thuốc:\n" +
                        "- Tên thuốc: %s\n" +
                        "- Liều dùng: %s\n" +
                        "- Thời gian uống: %s\n\n" +
                        "✅ Hãy uống thuốc ngay bây giờ để đảm bảo hiệu quả điều trị.\n\n" +
                        "💡 Lưu ý quan trọng:\n" +
                        "- Uống thuốc đúng giờ và đủ liều\n" +
                        "- Không bỏ lỡ liều nào\n" +
                        "- Nếu có tác dụng phụ, hãy liên hệ bác sĩ ngay\n\n" +
                        "🔗 Xác nhận đã uống thuốc tại đây: http://localhost:5173/profile\n\n" +
                        "Chúc bạn nhiều sức khỏe!\n" +
                        "Trân trọng,\n" +
                        "Hệ thống quản lý điều trị HIV",
                patientName, medicationName, dosage, time);

        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendAppointmentReminder(String to, String patientName, String doctorName,
            String appointmentDate, String appointmentTime,
            String medicalServiceName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Nhắc nhở lịch tái khám - " + appointmentDate);

        String content = String.format(
                "Kính gửi %s,\n\n" +
                        "Bạn có một lịch tái khám sắp tới với thông tin như sau:\n\n" +
                        "📅 Thông tin lịch hẹn:\n" +
                        "- Bác sĩ: %s\n" +
                        "- Dịch vụ: %s\n" +
                        "- Ngày khám: %s\n" +
                        "- Giờ khám: %s\n\n" +
                        "✅ Hướng dẫn chuẩn bị:\n" +
                        "- Đến trước 15 phút so với giờ hẹn\n" +
                        "- Mang theo giấy tờ tùy thân\n" +
                        "- Mang theo sổ khám bệnh và đơn thuốc cũ\n" +
                        "- Nhịn ăn nếu có yêu cầu xét nghiệm\n\n" +
                        "Chúc bạn nhiều sức khỏe!\n" +
                        "Trân trọng,\n" +
                        "Hệ thống quản lý điều trị HIV",
                patientName, doctorName, medicalServiceName, appointmentDate, appointmentTime);

        message.setText(content);
        mailSender.send(message);
    }

    @Override
    public void sendPatientCheckInNotification(String to, String doctorName, String patientName,
                                             String appointmentDate, String appointmentTime,
                                             String medicalServiceName, String checkInTime) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Thông báo bệnh nhân đã check-in");
        
        String content = String.format(
                "Kính gửi Bác sĩ %s,\n\n" +
                "Bệnh nhân %s đã check-in cho lịch khám với thông tin sau:\n" +
                "- Dịch vụ: %s\n" +
                "- Ngày khám: %s\n" +
                "- Giờ hẹn: %s\n" +
                "- Thời gian check-in: %s\n\n" +
                "Bệnh nhân đã có mặt và sẵn sàng cho ca khám.\n\n" +
                "Trân trọng,\n" +
                "Hệ thống quản lý điều trị HIV",
                doctorName, patientName, medicalServiceName, appointmentDate, appointmentTime, checkInTime);

        message.setText(content);
        mailSender.send(message);
    }
}