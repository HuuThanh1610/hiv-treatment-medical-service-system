package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreatePrescriptionDTO {
    private Integer treatmentPlanId;
    private Integer medicationId;
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private String notes;
} 