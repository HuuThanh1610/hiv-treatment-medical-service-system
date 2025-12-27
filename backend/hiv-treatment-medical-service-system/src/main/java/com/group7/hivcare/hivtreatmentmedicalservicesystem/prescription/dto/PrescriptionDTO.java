package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionDTO {
    private Integer id;
    private Integer treatmentPlanId;

    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 