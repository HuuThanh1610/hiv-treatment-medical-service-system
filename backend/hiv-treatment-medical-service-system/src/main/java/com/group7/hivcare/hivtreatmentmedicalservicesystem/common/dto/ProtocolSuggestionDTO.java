package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TargetGroup;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolSuggestionDTO {
    private Integer arvProtocolId;
    private String protocolName;
    private String description;
    private Double confidenceScore; // Điểm tin cậy (0-100)
    private String reason; // Lý do đề xuất
    private List<String> matchingCriteria; // Các tiêu chí phù hợp
    private List<String> contraindications; // Chống chỉ định
    private TargetGroup targetGroup;
}