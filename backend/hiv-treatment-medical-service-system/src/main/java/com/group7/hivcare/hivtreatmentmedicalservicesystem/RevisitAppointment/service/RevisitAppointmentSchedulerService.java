package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.RevisitAppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.email.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevisitAppointmentSchedulerService {
    
    private final RevisitAppointmentRepository revisitAppointmentRepository;
    private final EmailService emailService;
    
    /**
     * Chạy hàng ngày vào lúc 8:00 AM để gửi email nhắc nhở cho các lịch hẹn tái khám vào ngày mai
     */
    @Scheduled(cron = "0 0 8 * * *") // Chạy lúc 8:00 AM mỗi ngày
    public void sendRevisitAppointmentReminders() {
        log.info("Bắt đầu gửi email nhắc nhở lịch hẹn tái khám...");
        
        try {
            // Lấy ngày mai
            LocalDate tomorrow = LocalDate.now().plusDays(1);
            
            // Tìm tất cả lịch hẹn tái khám vào ngày mai
            List<RevisitAppointment> tomorrowAppointments = revisitAppointmentRepository.findByRevisitDate(tomorrow);
            
            log.info("Tìm thấy {} lịch hẹn tái khám vào ngày {}", tomorrowAppointments.size(), tomorrow);
            
            for (RevisitAppointment revisitAppointment : tomorrowAppointments) {
                try {
                    String patientEmail = revisitAppointment.getAppointment().getPatient().getUser().getEmail();
                    String patientName = revisitAppointment.getAppointment().getPatient().getUser().getFullName();
                    String doctorName = revisitAppointment.getAppointment().getDoctor().getUser().getFullName();
                    String revisitDateStr = revisitAppointment.getRevisitDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                    
                    emailService.sendRevisitAppointmentReminderEmail(
                        patientEmail, 
                        patientName, 
                        doctorName, 
                        revisitDateStr, 
                        revisitAppointment.getRevisitNotes()
                    );
                    
                    log.info("Đã gửi email nhắc nhở đến bệnh nhân: {} ({})", patientName, patientEmail);
                    
                } catch (Exception e) {
                    log.error("Lỗi khi gửi email nhắc nhở cho lịch hẹn tái khám ID {}: ", revisitAppointment.getId(), e);
                }
            }
            
            log.info("Hoàn thành gửi email nhắc nhở. Đã gửi {} email.", tomorrowAppointments.size());
            
        } catch (Exception e) {
            log.error("Lỗi khi thực hiện gửi email nhắc nhở lịch hẹn tái khám: ", e);
        }
    }
    
    /**
     * Method để test gửi email reminder (có thể gọi manually)
     */
    public void sendRemindersForDate(LocalDate date) {
        log.info("Gửi email nhắc nhở cho ngày: {}", date);
        
        List<RevisitAppointment> appointments = revisitAppointmentRepository.findByRevisitDate(date);
        
        for (RevisitAppointment revisitAppointment : appointments) {
            try {
                String patientEmail = revisitAppointment.getAppointment().getPatient().getUser().getEmail();
                String patientName = revisitAppointment.getAppointment().getPatient().getUser().getFullName();
                String doctorName = revisitAppointment.getAppointment().getDoctor().getUser().getFullName();
                String revisitDateStr = revisitAppointment.getRevisitDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                
                emailService.sendRevisitAppointmentReminderEmail(
                    patientEmail, 
                    patientName, 
                    doctorName, 
                    revisitDateStr, 
                    revisitAppointment.getRevisitNotes()
                );
                
                log.info("Đã gửi email nhắc nhở test đến: {}", patientEmail);
                
            } catch (Exception e) {
                log.error("Lỗi khi gửi email nhắc nhở test: ", e);
            }
        }
    }
}
