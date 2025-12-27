package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto;

import lombok.Data;
import java.time.LocalDateTime;
    
@Data
public class UpdatePrescriptionDTO {
    private String dosage;
    private String frequency;
    private Integer durationDays;
    private String notes;
    private LocalDateTime updatedAt;
} 