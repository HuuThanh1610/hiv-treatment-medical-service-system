package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.dto.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TreatmentReminderService {
    
    /**
     * Tạo nhắc nhở mới
     */
    TreatmentReminderDTO createReminder(CreateReminderDTO createReminderDTO);
    
    /**
     * Lấy tất cả nhắc nhở của bệnh nhân
     */
    List<TreatmentReminderDTO> getPatientReminders(Integer patientId);
    
    /**
     * Lấy nhắc nhở theo trạng thái của bệnh nhân
     */
    List<TreatmentReminderDTO> getPatientRemindersByStatus(Integer patientId, String status);
    
    /**
     * Lấy nhắc nhở theo loại của bệnh nhân
     */
    List<TreatmentReminderDTO> getPatientRemindersByType(Integer patientId, String reminderType);
    
    /**
     * Cập nhật trạng thái nhắc nhở
     */
    TreatmentReminderDTO updateReminderStatus(ReminderStatusDTO statusDTO);
    
    /**
     * Đánh dấu nhắc nhở đã hoàn thành
     */
    TreatmentReminderDTO markReminderCompleted(Integer reminderId);
    
    /**
     * Đánh dấu nhắc nhở bị bỏ lỡ
     */
    TreatmentReminderDTO markReminderMissed(Integer reminderId);
    
    /**
     * Gửi nhắc nhở (cập nhật trạng thái thành SENT)
     */
    TreatmentReminderDTO sendReminder(Integer reminderId);
    
    /**
     * Lấy nhắc nhở cần gửi (PENDING và đến giờ)
     */
    List<TreatmentReminderDTO> getPendingRemindersToSend();
    
    /**
     * Lấy nhắc nhở bị bỏ lỡ
     */
    List<TreatmentReminderDTO> getMissedReminders();
    
    /**
     * Tạo nhắc nhở uống thuốc từ medication schedule
     */
    List<TreatmentReminderDTO> createMedicationReminders(Integer medicationScheduleId);
    
    /**
     * Tạo nhắc nhở uống thuốc hàng ngày cho 30 ngày tiếp theo
     */
    List<TreatmentReminderDTO> createDailyMedicationReminders(Integer medicationScheduleId);
    
    /**
     * Tự động gửi nhắc nhở uống thuốc hàng ngày
     */
    void sendDailyMedicationReminders();
    
    /**
     * Tạo nhắc nhở tái khám từ appointment
     */
    TreatmentReminderDTO createAppointmentReminder(Integer appointmentId);
    
    /**
     * Tạo nhắc nhở tự động từ treatment plan
     */
    List<TreatmentReminderDTO> createRemindersFromTreatmentPlan(Integer treatmentPlanId);
    
    /**
     * Lấy báo cáo nhắc nhở theo ngày
     */
    ReminderReportDTO getDailyReport(LocalDate date);
    
    /**
     * Lấy báo cáo nhắc nhở theo tuần
     */
    ReminderReportDTO getWeeklyReport(LocalDate startDate);
    
    /**
     * Lấy báo cáo nhắc nhở theo tháng
     */
    ReminderReportDTO getMonthlyReport(int year, int month);
    
    /**
     * Lấy báo cáo tuân thủ của bệnh nhân
     */
    ReminderReportDTO getPatientComplianceReport(Integer patientId, LocalDate startDate, LocalDate endDate);
    
    /**
     * Xóa nhắc nhở
     */
    void deleteReminder(Integer reminderId);
    
    /**
     * Lấy nhắc nhở theo ID
     */
    TreatmentReminderDTO getReminderById(Integer reminderId);
    
    /**
     * Lấy tất cả nhắc nhở (cho admin)
     */
    List<TreatmentReminderDTO> getAllReminders();
    
    /**
     * Lấy nhắc nhở theo khoảng thời gian
     */
    List<TreatmentReminderDTO> getRemindersByDateRange(LocalDateTime startDate, LocalDateTime endDate);
} 