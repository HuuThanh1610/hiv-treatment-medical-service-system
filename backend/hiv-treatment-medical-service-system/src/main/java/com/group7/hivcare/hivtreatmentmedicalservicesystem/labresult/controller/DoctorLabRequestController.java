package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestItemDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.DoctorLabRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service.LabRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller riêng cho Bác sĩ quản lý yêu cầu xét nghiệm trong dashboard.
 * Chỉ DOCTOR được phép truy cập các API này.
 */
@RestController
@RequestMapping("/api/doctor/lab-requests")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DOCTOR')")
public class DoctorLabRequestController {

    private final LabRequestService service;

    /**
     * API bác sĩ tạo yêu cầu xét nghiệm cho bệnh nhân đang khám.
     * Chỉ DOCTOR được phép tạo.
     */
    @PostMapping
    public ResponseEntity<LabRequestDTO> createLabRequest(@RequestBody LabRequestDTO dto) {
        if (dto == null) {
            return ResponseEntity.badRequest().build();
        }
        // Bác sĩ chỉ có thể tạo yêu cầu xét nghiệm
        LabRequestDTO created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * API bác sĩ tạo yêu cầu xét nghiệm nhanh cho bệnh nhân đang khám.
     * Chỉ DOCTOR được phép tạo.
     */
    @PostMapping("/quick-create")
    public ResponseEntity<LabRequestDTO> createQuickLabRequest(@RequestBody DoctorLabRequestDTO dto) {
        if (dto == null) {
            return ResponseEntity.badRequest().build();
        }
        LabRequestDTO created = service.createDoctorLabRequest(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * API bác sĩ xem danh sách yêu cầu xét nghiệm của mình.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/my-requests")
    public ResponseEntity<List<LabRequestDTO>> getMyLabRequests() {
        // Lấy ID của bác sĩ đang đăng nhập
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String doctorEmail = auth.getName();
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * API bác sĩ xem chi tiết yêu cầu xét nghiệm.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/{id}")
    public ResponseEntity<LabRequestDTO> getLabRequestById(@PathVariable Integer id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        LabRequestDTO dto = service.getById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * API bác sĩ xem yêu cầu xét nghiệm theo bệnh nhân.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabRequestDTO>> getLabRequestsByPatient(@PathVariable Integer patientId) {
        if (patientId == null || patientId <= 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    /**
     * API bác sĩ xem yêu cầu xét nghiệm theo lịch hẹn.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<LabRequestDTO>> getLabRequestsByAppointment(@PathVariable Integer appointmentId) {
        if (appointmentId == null || appointmentId <= 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.getByAppointmentId(appointmentId));
    }

    /**
     * API bác sĩ xem yêu cầu xét nghiệm theo trạng thái.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<LabRequestDTO>> getLabRequestsByStatus(@PathVariable String status) {
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.getByStatus(status));
    }

    /**
     * API bác sĩ xem yêu cầu xét nghiệm khẩn cấp.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/urgent")
    public ResponseEntity<List<LabRequestDTO>> getUrgentLabRequests() {
        return ResponseEntity.ok(service.getUrgentRequests());
    }

    /**
     * API bác sĩ cập nhật trạng thái yêu cầu xét nghiệm.
     * Chỉ DOCTOR được phép cập nhật.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<LabRequestDTO> updateLabRequestStatus(
            @PathVariable Integer id, 
            @RequestParam String status) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        LabRequestDTO updated = service.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * API bác sĩ xem tất cả items của một yêu cầu xét nghiệm.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/{labRequestId}/items")
    public ResponseEntity<List<LabRequestItemDTO>> getLabRequestItems(@PathVariable Integer labRequestId) {
        if (labRequestId == null || labRequestId <= 0) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(service.getItemsByLabRequestId(labRequestId));
    }

    /**
     * API bác sĩ xem chi tiết một item xét nghiệm.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/items/{id}")
    public ResponseEntity<LabRequestItemDTO> getLabRequestItemById(@PathVariable Integer id) {
        if (id == null || id <= 0) {
            return ResponseEntity.badRequest().build();
        }
        LabRequestItemDTO dto = service.getItemById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * API bác sĩ xem yêu cầu xét nghiệm của bệnh nhân đang khám hôm nay.
     * Chỉ DOCTOR được phép xem.
     */
    @GetMapping("/today-appointments")
    public ResponseEntity<List<LabRequestDTO>> getTodayAppointmentLabRequests() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * API debug để kiểm tra dữ liệu LabRequest.
     * Chỉ DOCTOR được phép truy cập.
     */
    @GetMapping("/debug/{labRequestId}")
    public ResponseEntity<String> debugLabRequestData(@PathVariable Integer labRequestId) {
        service.debugLabRequestData(labRequestId);
        return ResponseEntity.ok("Debug completed. Check console logs.");
    }
} 