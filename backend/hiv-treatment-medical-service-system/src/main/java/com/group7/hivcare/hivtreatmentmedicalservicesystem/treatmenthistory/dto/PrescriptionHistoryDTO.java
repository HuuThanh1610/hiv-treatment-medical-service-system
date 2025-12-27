package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO trả về cho Frontend khi gọi API /api/prescription-history/patient/{id}
 * Chứa đầy đủ thông tin để Frontend hiển thị lịch sử thay đổi đơn thuốc
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionHistoryDTO {
    private Integer id;
    private Integer treatmentPlanId;
    private Integer prescriptionId; // Frontend dùng để hiển thị "Đơn thuốc: #2"
    private String changeReason;
    private LocalDateTime createdAt; // ✅ Frontend dùng để hiển thị ngày thay vì N/A

    // Thông tin bệnh nhân và bác sĩ (đã resolve từ User entity)
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;

    // ✅ Danh sách thuốc trong đơn thuốc cũ - Frontend dùng để tạo tên đơn thuốc
    private List<MedicationInfo> oldMedications;
    
    /**
     * Inner class chứa thông tin chi tiết từng thuốc trong đơn thuốc
     * Frontend dùng MedicationInfo.name để tạo tên đơn thuốc hiển thị
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationInfo {
        private Integer medicationId;
        private String name; // ✅ Tên thuốc (Lamivudine, Efavirenz) - Frontend dùng để hiển thị
        private String dosage; // Liều lượng thuốc
        private String frequency; // Tần suất uống thuốc
        private Integer durationDays; // Số ngày sử dụng thuốc
        private String notes;
    }
} 