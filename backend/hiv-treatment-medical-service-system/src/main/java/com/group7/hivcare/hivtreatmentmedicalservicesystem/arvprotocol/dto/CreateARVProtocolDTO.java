package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto;


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
public class CreateARVProtocolDTO {
    @NotBlank(message = "Tên ARV Protocol không được để trống")
    private String name;
    private String description;
    private RecommendationType recommendation; //Khuyến cáo VD: ưu tiên, thay thế -> enum
    private TreatmentLevel treatmentLevel; // ->enum bậc 1, 2 , 3
    private String sideEffects;// Tác dụng phụ
    private String contraindications;// Chống chỉ định
    private TargetGroup targetGroup;
}
