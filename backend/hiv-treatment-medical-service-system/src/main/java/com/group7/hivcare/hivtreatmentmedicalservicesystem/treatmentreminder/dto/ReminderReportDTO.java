package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReminderReportDTO {
    private LocalDate reportDate;
    private Integer totalReminders;
    private Integer sentReminders;
    private Integer completedReminders;
    private Integer missedReminders;
    private Integer pendingReminders;
    private Double complianceRate; // Tỷ lệ tuân thủ
    private List<ReminderTypeSummaryDTO> typeSummary;
    private List<PatientComplianceDTO> patientCompliance;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class ReminderTypeSummaryDTO {
    private String reminderType;
    private Integer total;
    private Integer completed;
    private Integer missed;
    private Double complianceRate;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class PatientComplianceDTO {
    private Integer patientId;
    private String patientName;
    private Integer totalReminders;
    private Integer completedReminders;
    private Integer missedReminders;
    private Double complianceRate;
} 