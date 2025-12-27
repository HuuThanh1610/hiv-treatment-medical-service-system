package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.dto.TreatmentReminderDTO;

import java.util.List;

public interface ReminderNotificationService {
    
    /**
     * Gửi thông báo nhắc nhở qua email
     */
    void sendReminderNotification(TreatmentReminderDTO reminder);
    
    /**
     * Gửi thông báo hàng loạt cho các nhắc nhở cần gửi
     */
    void sendBulkReminderNotifications(List<TreatmentReminderDTO> reminders);
    
    /**
     * Gửi thông báo nhắc nhở uống thuốc
     */
    void sendMedicationReminder(TreatmentReminderDTO reminder);
    
    /**
     * Gửi thông báo nhắc nhở tái khám
     */
    void sendAppointmentReminder(TreatmentReminderDTO reminder);
    
    /**
     * Gửi thông báo nhắc nhở bị bỏ lỡ
     */
    void sendMissedReminderNotification(TreatmentReminderDTO reminder);
    
    /**
     * Gửi báo cáo tuân thủ cho bệnh nhân
     */
    void sendComplianceReport(String patientEmail, String patientName, double complianceRate);
} 