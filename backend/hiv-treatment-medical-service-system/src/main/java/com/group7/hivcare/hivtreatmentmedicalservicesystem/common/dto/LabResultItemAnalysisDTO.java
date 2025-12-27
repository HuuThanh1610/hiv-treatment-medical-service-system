package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResultItemAnalysisDTO {
    private Integer testTypeId;
    private String testName;
    private String resultValue;
    private String unit;
    private String normalRange;
    private String status; // NORMAL, HIGH, LOW, CRITICAL
    private String interpretation;
    private Double price;
}