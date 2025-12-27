package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ARVProtocolMedicationDTO {
    private Integer medicationId;
    private String medicationName; // Tên thuốc để hiển thị
    private String dosage;     // liều lượng
    private String duration;   // thời gian điều trị
    private String sideEffects; // Tác dụng phụ của thuốc
    private String frequency; // Chỉ định mỗi ngày dùng bao nhiêu lần. VD: 2 lần/ngày
    private String note;       // ghi chú
}
