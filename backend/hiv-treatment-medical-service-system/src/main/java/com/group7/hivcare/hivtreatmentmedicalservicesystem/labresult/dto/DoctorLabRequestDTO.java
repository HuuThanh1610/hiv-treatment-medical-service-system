package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO riêng cho bác sĩ tạo yêu cầu xét nghiệm nhanh trong quá trình khám bệnh.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorLabRequestDTO {
    
    // Thông tin cơ bản
    private Integer appointmentId;
    private Integer patientId;
    private Integer doctorId;
    private boolean isUrgent;
    
    // Danh sách các loại xét nghiệm cần làm
    private List<Integer> testTypeIds;
    
    // Ghi chú của bác sĩ
    private String doctorNotes;
    
    // Các trường bổ sung cho hiển thị
    private String patientName;
    private String appointmentDate;
    private List<String> testTypeNames;
} 