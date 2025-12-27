package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResultMessageDTO {
    private Integer labRequestItemId;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private String testName;
    private String resultValue;
    private String normalRange;
    private String unit;
    private String status; // NORMAL, ABNORMAL, CRITICAL
    private String severityLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String message;
    private String notificationType; // RESULT_ENTRY, ABNORMAL_RESULT, CRITICAL_VALUE
    private LocalDateTime createdAt;
    private Boolean isRead;
} 