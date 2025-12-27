package com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ConsultationMessageDTO {
    private Integer id;
    private Integer sessionId;
    private String senderType;
    private Integer senderId;
    private String content;
    private LocalDateTime sentAt;
}