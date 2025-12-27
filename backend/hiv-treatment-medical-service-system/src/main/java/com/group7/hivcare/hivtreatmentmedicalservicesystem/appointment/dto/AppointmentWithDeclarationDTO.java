package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentWithDeclarationDTO {
    
    // Thông tin appointment
    private Integer appointmentId;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private Integer medicalServiceId;
    private String medicalServiceName;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String status;
    private String notes;
    
    // Thông tin khai báo
    private Integer declarationId;
    private boolean isPregnant;
    private String healthNotes;
    private String symptoms;
    private String currentMedications;
    private String allergies;
    private String emergencyContact;
    private String emergencyPhone;
} 