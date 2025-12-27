package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabRequestDTO {
    private int id;
    private int appointmentId;
    private int patientId;
    private Integer doctorId; // allow null for independent requests
    private LocalDateTime requestDate;
    private boolean isUrgent;
    private String status; // 'Pending', 'Completed'
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<LabRequestItemDTO> labRequestItems;
    
    private String patientName;
    private String doctorName;
    private String appointmentDate;
}