package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RecommendationType;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TargetGroup;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ARVProtocolDTO {
    private Integer id;
    private String name;
    private String description;
    private RecommendationType recommendation; // Khuyến cáo (ví dụ: "Ưu tiên", "Có thể thay thế")
    private TreatmentLevel treatmentLevel;//Bậc điều trị (ví dụ: "Bậc 1", "Bậc 2")
    private String sideEffects; // Tác dụng phụ
    private String contraindications; // Chống chỉ định
    //Ví dụ: Phụ nữ có thai trong 3 tháng đầu, bệnh thận
    private TargetGroup targetGroup;
    private Boolean active;
    
    // Danh sách thuốc trong phác đồ
    private List<ARVProtocolMedicationDTO> arvProtocolMedicationsDTO;
}
