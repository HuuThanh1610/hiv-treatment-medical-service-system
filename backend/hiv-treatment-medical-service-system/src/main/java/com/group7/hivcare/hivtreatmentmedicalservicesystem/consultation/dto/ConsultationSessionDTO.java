package com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationSessionDTO {
    private Integer id;
    private Integer patientId;
    private String patientName;
    private Integer doctorId;
    private String doctorName;
    private LocalDateTime createdAt;
    private String status;
}