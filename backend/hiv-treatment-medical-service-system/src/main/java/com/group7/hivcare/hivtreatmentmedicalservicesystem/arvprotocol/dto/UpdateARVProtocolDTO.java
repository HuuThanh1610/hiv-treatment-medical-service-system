package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RecommendationType;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TargetGroup;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentLevel;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateARVProtocolDTO {
    @NotBlank(message = "Tên ARV Protocol không được để trống")
    private String name;
    private String description;
    private RecommendationType recommendation; // Khuyến cáo (ví dụ: "Ưu tiên", "Có thể thay thế")
    private TreatmentLevel treatmentLevel; //Bậc điều trị (ví dụ: "Bậc 1", "Bậc 2")
    private String sideEffects;// Tác dụng phụ
    private String contraindications;// Chống chỉ định
    private TargetGroup targetGroup;
}
