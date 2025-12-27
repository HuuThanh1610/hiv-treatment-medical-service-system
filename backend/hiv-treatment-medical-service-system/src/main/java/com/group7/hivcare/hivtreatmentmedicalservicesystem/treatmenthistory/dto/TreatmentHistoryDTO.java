package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentHistoryDTO {
    private Integer id;
    private Integer treatmentPlanId;
    private Integer oldArvProtocolId;
    private String oldArvProtocolName;
    private Integer newArvProtocolId;
    private String newArvProtocolName;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String notes;
    private LocalDateTime createdAt;
    
    // Thông tin bệnh nhân và bác sĩ
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
}