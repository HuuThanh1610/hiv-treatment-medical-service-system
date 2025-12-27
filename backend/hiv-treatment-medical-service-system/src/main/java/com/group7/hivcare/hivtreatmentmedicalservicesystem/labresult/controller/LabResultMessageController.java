package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabResultMessageDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabResultNotificationRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service.LabResultMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-result-messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LabResultMessageController {

    private final LabResultMessageService labResultMessageService;

    /**
     * Tạo thông báo khi nhập chỉ số xét nghiệm
     */
    @PostMapping("/notifications")
    public ResponseEntity<LabResultMessageDTO> createNotification(
            @RequestBody LabResultNotificationRequestDTO request) {
        LabResultMessageDTO notification = labResultMessageService.createLabResultNotification(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }

    /**
     * Lấy tất cả thông báo của bệnh nhân
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabResultMessageDTO>> getPatientNotifications(
            @PathVariable Integer patientId) {
        List<LabResultMessageDTO> notifications = labResultMessageService.getPatientNotifications(patientId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Lấy tất cả thông báo của bác sĩ
     */
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<LabResultMessageDTO>> getDoctorNotifications(
            @PathVariable Integer doctorId) {
        List<LabResultMessageDTO> notifications = labResultMessageService.getDoctorNotifications(doctorId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Lấy thông báo chưa đọc của bệnh nhân
     */
    @GetMapping("/patient/{patientId}/unread")
    public ResponseEntity<List<LabResultMessageDTO>> getUnreadPatientNotifications(
            @PathVariable Integer patientId) {
        List<LabResultMessageDTO> notifications = labResultMessageService.getUnreadPatientNotifications(patientId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Lấy thông báo chưa đọc của bác sĩ
     */
    @GetMapping("/doctor/{doctorId}/unread")
    public ResponseEntity<List<LabResultMessageDTO>> getUnreadDoctorNotifications(
            @PathVariable Integer doctorId) {
        List<LabResultMessageDTO> notifications = labResultMessageService.getUnreadDoctorNotifications(doctorId);
        return ResponseEntity.ok(notifications);
    }

    /**
     * Đánh dấu thông báo đã đọc
     */
    @PutMapping("/notifications/{labRequestItemId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable Integer labRequestItemId) {
        labResultMessageService.markNotificationAsRead(labRequestItemId);
        return ResponseEntity.ok().build();
    }

    /**
     * Phân tích kết quả và tạo thông báo tự động
     */
    @PostMapping("/analyze/{labRequestItemId}")
    public ResponseEntity<LabResultMessageDTO> analyzeAndCreateNotification(
            @PathVariable Integer labRequestItemId,
            @RequestParam String resultValue) {
        LabResultMessageDTO notification = labResultMessageService.analyzeAndCreateNotification(
                labRequestItemId, resultValue);
        return ResponseEntity.ok(notification);
    }

    /**
     * Lấy thông báo quan trọng (HIGH, CRITICAL)
     */
    @GetMapping("/important")
    public ResponseEntity<List<LabResultMessageDTO>> getImportantNotifications() {
        List<LabResultMessageDTO> notifications = labResultMessageService.getImportantNotifications();
        return ResponseEntity.ok(notifications);
    }

    /**
     * Đếm số thông báo chưa đọc của bệnh nhân
     */
    @GetMapping("/patient/{patientId}/unread-count")
    public ResponseEntity<Long> countUnreadPatientNotifications(
            @PathVariable Integer patientId) {
        long count = labResultMessageService.countUnreadPatientNotifications(patientId);
        return ResponseEntity.ok(count);
    }

    /**
     * Đếm số thông báo chưa đọc của bác sĩ
     */
    @GetMapping("/doctor/{doctorId}/unread-count")
    public ResponseEntity<Long> countUnreadDoctorNotifications(
            @PathVariable Integer doctorId) {
        long count = labResultMessageService.countUnreadDoctorNotifications(doctorId);
        return ResponseEntity.ok(count);
    }
} 