package com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.dto.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {
    private final ConsultationService consultationService;

    // Tạo phiên tư vấn mới
    @PostMapping("/start")
    public ResponseEntity<ConsultationSessionDTO> startSession(@RequestBody StartConsultationDTO dto,
            Authentication authentication) {
        return ResponseEntity.ok(consultationService.startSession(dto, authentication));
    }

    // Lấy danh sách phiên tư vấn của user
    @GetMapping("/my-sessions")
    public ResponseEntity<List<ConsultationSessionDTO>> getMySessions(Authentication authentication) {
        return ResponseEntity.ok(consultationService.getMySessions(authentication));
    }

    // Gửi tin nhắn trong phiên tư vấn
    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<ConsultationMessageDTO> sendMessage(@PathVariable Integer sessionId,
            @RequestBody SendMessageDTO dto, Authentication authentication) {
        return ResponseEntity.ok(consultationService.sendMessage(sessionId, dto, authentication));
    }

    // Lấy lịch sử tin nhắn của một phiên tư vấn
    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<List<ConsultationMessageDTO>> getMessages(@PathVariable Integer sessionId) {
        return ResponseEntity.ok(consultationService.getMessages(sessionId));
    }

    // Đóng phiên tư vấn
    @PostMapping("/{sessionId}/close")
    public ResponseEntity<Void> closeSession(@PathVariable Integer sessionId, Authentication authentication) {
        consultationService.closeSession(sessionId, authentication);
        return ResponseEntity.ok().build();
    }

    // Xóa phiên tư vấn
    @DeleteMapping("/{sessionId}")
    public ResponseEntity<Void> deleteSession(@PathVariable Integer sessionId, Authentication authentication) {
        consultationService.deleteSession(sessionId, authentication);
        return ResponseEntity.ok().build();
    }
}