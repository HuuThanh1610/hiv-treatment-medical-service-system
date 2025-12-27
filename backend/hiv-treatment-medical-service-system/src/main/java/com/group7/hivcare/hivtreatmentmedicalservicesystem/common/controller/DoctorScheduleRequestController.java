package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.DoctorScheduleRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/doctor-schedule-requests")
public class DoctorScheduleRequestController {
    @Autowired
    private DoctorScheduleRequestService requestService;

    // Bác sĩ gửi yêu cầu nghỉ/đổi ca
    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorScheduleRequestDTO> createRequest(@RequestBody DoctorScheduleRequestDTO dto) {
        return ResponseEntity.ok(requestService.createRequest(dto));
    }

    // Admin lấy tất cả yêu cầu
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorScheduleRequestDTO>> getAll() {
        return ResponseEntity.ok(requestService.getAllRequests());
    }

    // Lấy yêu cầu theo trạng thái
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorScheduleRequestDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(requestService.getRequestsByStatus(status));
    }

    // Lấy yêu cầu của 1 bác sĩ
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('DOCTOR') or hasRole('ADMIN')")
    public ResponseEntity<List<DoctorScheduleRequestDTO>> getByDoctor(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(requestService.getRequestsByDoctor(doctorId));
    }

    // Admin duyệt yêu cầu và chọn bác sĩ thay thế
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorScheduleRequestDTO> approve(@PathVariable Integer id, @RequestParam Integer substituteDoctorId, @RequestParam(required = false) String adminNote) {
        return ResponseEntity.ok(requestService.approveRequest(id, substituteDoctorId, adminNote));
    }

    // Admin từ chối yêu cầu
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorScheduleRequestDTO> reject(@PathVariable Integer id, @RequestParam(required = false) String adminNote) {
        return ResponseEntity.ok(requestService.rejectRequest(id, adminNote));
    }
}
