package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMedicationScheduleDTO {
    private Integer treatmentPlanId;
    private String medicationName;
    private String dosage;
    private String frequency;
    private String timeOfDay; // VD: "08:00,20:00"
    private Integer durationDays; // Số ngày cần uống thuốc
} 