package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDeclarationDTO {
    
    // ID của lịch hẹn (bắt buộc)
    @NotNull(message = "ID lịch hẹn không được để trống")
    private Integer appointmentId;
    
    // Thông tin khai báo sức khỏe
    private boolean isPregnant = false; // Trạng thái mang thai
    
    private String healthNotes; // Ghi chú về tình trạng sức khỏe
    
    private String symptoms; // Triệu chứng hiện tại
    
    private String currentMedications; // Thuốc đang sử dụng
    
    private String allergies; // Dị ứng (nếu có)
    
    private String emergencyContact; // Liên hệ khẩn cấp
    
    private String emergencyPhone; // Số điện thoại khẩn cấp
} 