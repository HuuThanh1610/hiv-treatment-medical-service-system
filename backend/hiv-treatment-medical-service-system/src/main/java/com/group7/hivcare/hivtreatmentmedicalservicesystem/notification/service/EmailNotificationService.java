package com.group7.hivcare.hivtreatmentmedicalservicesystem.notification.service;

public interface EmailNotificationService {
    void sendAppointmentConfirmation(String to, String patientName, String doctorName, 
                                   String appointmentDate, String appointmentTime, 
                                   String medicalServiceName);
                                   
    void sendNewAppointmentNotification(String to, String doctorName, String patientName,
                                      String appointmentDate, String appointmentTime,
                                      String medicalServiceName);
                                      
    void sendAppointmentCancellation(String to, String recipientName, String otherPartyName,
                                   String appointmentDate, String appointmentTime,
                                   String medicalServiceName, String cancellationReason);
                                   
    void sendStaffApprovalNotification(String to, String doctorName, String patientName,
                                      String appointmentDate, String appointmentTime,
                                      String medicalServiceName);
                                      
    void sendMedicationReminder(String to, String patientName, String medicationName, 
                               String dosage, String time, String reminderId);
                               
    void sendAppointmentReminder(String to, String patientName, String doctorName,
                                String appointmentDate, String appointmentTime, 
                                String medicalServiceName);
                                
    void sendPatientCheckInNotification(String to, String doctorName, String patientName,
                                      String appointmentDate, String appointmentTime,
                                      String medicalServiceName, String checkInTime);
                                      
    /**
     * Gửi email thông báo duyệt/từ chối đơn xin nghỉ cho bác sĩ
     * @param to email bác sĩ
     * @param doctorName tên bác sĩ
     * @param approved true nếu duyệt, false nếu từ chối
     * @param reason lý do từ chối (nếu có)
     */
    void sendLeaveRequestResult(String to, String doctorName, boolean approved, String reason);
    /**
     * Gửi email thông báo ca trực mới cho bác sĩ thay thế
     */
    void sendNewSubstituteScheduleNotification(String to, String doctorName, String date, String startTime, String endTime, String notes);
}