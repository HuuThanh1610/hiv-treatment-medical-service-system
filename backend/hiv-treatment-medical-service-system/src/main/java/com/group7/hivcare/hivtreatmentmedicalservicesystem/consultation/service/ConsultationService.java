package com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.dto.*;
import org.springframework.security.core.Authentication;
import java.util.List;

public interface ConsultationService {
    ConsultationSessionDTO startSession(StartConsultationDTO dto, Authentication authentication);

    List<ConsultationSessionDTO> getMySessions(Authentication authentication);

    ConsultationMessageDTO sendMessage(Integer sessionId, SendMessageDTO dto, Authentication authentication);

    List<ConsultationMessageDTO> getMessages(Integer sessionId);

    void closeSession(Integer sessionId, Authentication authentication);

    void deleteSession(Integer sessionId, org.springframework.security.core.Authentication authentication);
}