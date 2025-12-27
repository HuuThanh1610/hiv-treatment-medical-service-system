package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMedicationScheduleFromPrescriptionDTO {
    private Integer treatmentPlanId;
    private Integer medicationId; // ID của prescription medication
    private String timeOfDay; // VD: "08:00,20:00"
}
