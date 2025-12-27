package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ARVMedicationForProtocolDTO {
    private Integer medicationId;
    private String code; // Mã thuốc (VD: TDF, 3TC)
    private String name;
    private String description;
    private String drugClass;// Phân loại thuốc (NRTI, NNRTI, PI, v.v.)
    private String dosage;     // liều lượng
    private String duration;   // thời gian điều trị
    private String sideEffects; // Tác dụng phụ của thuốc
    private String frequency; // Chỉ định mỗi ngày dùng bao nhiêu lần. VD: 2 lần/ngày
    private String note;       // ghi chú
}
