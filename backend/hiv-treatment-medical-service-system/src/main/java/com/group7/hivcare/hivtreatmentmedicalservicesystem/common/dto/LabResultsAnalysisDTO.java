package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
    public class LabResultsAnalysisDTO {
    private Integer patientId;
    private Integer labRequestId;
    private String patientName;
    private Integer age;
    private String gender;
    private Boolean isPregnant;
    private Boolean isChild;
    private List<LabResultItemAnalysisDTO> labResults;
    private String analysisSummary;
    private List<ProtocolSuggestionDTO> suggestedProtocols;
    private List<String> riskFactors;
    private List<String> recommendations;
}