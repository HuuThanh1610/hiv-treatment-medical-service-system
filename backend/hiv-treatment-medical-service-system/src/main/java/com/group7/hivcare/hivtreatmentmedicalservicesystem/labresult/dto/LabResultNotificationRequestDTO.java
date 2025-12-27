package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResultNotificationRequestDTO {
    private Integer labRequestItemId;
    private String resultValue;
    private String notes;
    private String notificationType; // RESULT_ENTRY, ABNORMAL_RESULT, CRITICAL_VALUE
} 