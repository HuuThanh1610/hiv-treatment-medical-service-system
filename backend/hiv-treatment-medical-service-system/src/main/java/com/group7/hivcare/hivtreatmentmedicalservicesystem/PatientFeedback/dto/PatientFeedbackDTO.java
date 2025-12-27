package com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientFeedbackDTO {
    private Integer id;
    private Integer appointmentId;
    private Integer staffRating;
    private Integer waitingTimeRating;
    private Integer facilityRating;
    private Integer doctorRating;
    private String additionalComments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields for display
    private String patientName;
    private String doctorName;
    private LocalDateTime appointmentDate;
    private Double averageRating;
}
