package com.group7.hivcare.hivtreatmentmedicalservicesystem.email.service;

public interface EmailService {
    void sendVerificationEmail(String to, String verificationCode);
    
    void sendRevisitAppointmentCreatedEmail(String to, String patientName, String doctorName, String revisitDate, String notes);
    
    void sendRevisitAppointmentReminderEmail(String to, String patientName, String doctorName, String revisitDate, String notes);
} 