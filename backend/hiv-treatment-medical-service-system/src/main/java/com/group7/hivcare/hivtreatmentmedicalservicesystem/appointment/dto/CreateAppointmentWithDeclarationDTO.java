package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentWithDeclarationDTO {
    
    // Thông tin tạo appointment
    @NotNull(message = "ID bệnh nhân không được để trống")
    private Integer patientId;
    
    @NotNull(message = "ID bác sĩ không được để trống")
    private Integer doctorId;
    
    @NotNull(message = "ID dịch vụ y tế không được để trống")
    private Integer medicalServiceId;
    
    @NotNull(message = "Ngày khám không được để trống")
    private LocalDate appointmentDate;
    
    @NotNull(message = "Giờ khám không được để trống")
    private LocalTime appointmentTime;
    
    private String notes;
    
    // Thông tin khai báo sức khỏe
    private boolean isPregnant = false;
    
    private String healthNotes;
    
    private String symptoms;
    
    private String currentMedications;
    
    private String allergies;
    
    private String emergencyContact;
    
    private String emergencyPhone;
} 