package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequestDTO {
    @NotNull(message = "ID bác sĩ không được để trống")
    private Integer doctorId;

    // Cho phép bác sĩ tạo lịch hẹn cho bệnh nhân
    private Integer patientId;

    @NotNull(message = "ID dịch vụ y tế không được để trống")
    private Integer medicalServiceId;

    @NotNull(message = "Ngày khám không được để trống")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate appointmentDate;

    @NotNull(message = "Giờ khám không được để trống")
    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime appointmentTime;

    private String notes;
}