package com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.dto;

import lombok.Data;

@Data
public class StartConsultationDTO {
    private Integer doctorId;
    private String initialMessage;
}