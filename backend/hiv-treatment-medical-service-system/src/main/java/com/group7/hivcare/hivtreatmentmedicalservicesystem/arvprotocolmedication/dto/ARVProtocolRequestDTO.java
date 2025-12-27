package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RecommendationType;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TargetGroup;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentLevel;
import lombok.*;

import java.util.List;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ARVProtocolRequestDTO {
    private String name;
    private String description;
    private RecommendationType recommendation; //Khuyến cáo VD: ưu tiên, thay thế -> enum
    private TreatmentLevel treatmentLevel; ; // ->enum bậc 1, 2 , 3
    private String sideEffects;
    private String contraindications;
    private TargetGroup targetGroup;
    private Boolean active;

    // Danh sách thuốc kèm theo
    private List<ARVProtocolMedicationDTO> arvProtocolMedicationsDTO;
}
