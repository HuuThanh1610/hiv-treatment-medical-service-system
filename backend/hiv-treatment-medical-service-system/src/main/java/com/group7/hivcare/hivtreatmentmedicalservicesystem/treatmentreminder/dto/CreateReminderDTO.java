package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReminderDTO {
    private Integer patientId;
    private String reminderType; // MEDICATION, APPOINTMENT
    private LocalDateTime reminderDate;
    private Integer treatmentPlanId;
    private Integer appointmentId;
    private Integer medicationScheduleId;
    private String message;
    private String medicationName;
    private String dosage;
    private LocalDateTime appointmentDateTime;
    private String doctorName;
} 