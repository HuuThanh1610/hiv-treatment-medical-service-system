package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderStatusDTO {
    private Integer reminderId;
    private String status; // PENDING, SENT, COMPLETED, MISSED
    private String notes;
} 