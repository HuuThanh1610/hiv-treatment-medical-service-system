package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentStatus;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZonedDateTime;

@Data
public class AppointmentResponseDTO {
    private Integer id;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private Integer medicalServiceId;
    private String medicalServiceName;
    private Double medicalServicePrice;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private AppointmentStatus status;
    private String notes;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    // Bác sĩ thay thế (nếu có)
    private Integer substituteDoctorId;
    private String substituteDoctorName;
    public Integer getSubstituteDoctorId() {
        return substituteDoctorId;
    }
    public void setSubstituteDoctorId(Integer substituteDoctorId) {
        this.substituteDoctorId = substituteDoctorId;
    }
    public String getSubstituteDoctorName() {
        return substituteDoctorName;
    }
    public void setSubstituteDoctorName(String substituteDoctorName) {
        this.substituteDoctorName = substituteDoctorName;
    }
}