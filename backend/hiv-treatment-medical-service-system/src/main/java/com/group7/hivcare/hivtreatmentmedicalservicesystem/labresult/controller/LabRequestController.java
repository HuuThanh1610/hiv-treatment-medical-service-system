package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestItemDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service.LabRequestService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.ArrayList;

/**
 * Controller xử lý các API liên quan đến Yêu cầu xét nghiệm (LabRequest).
 * ADMIN và STAFF được phép tạo, cập nhật, xóa.
 * DOCTOR được phép xem và cập nhật trạng thái.
 */
@RestController
@RequestMapping("/api/lab-requests")
@RequiredArgsConstructor
public class LabRequestController {

    private final LabRequestService service;

    /**
     * API tạo mới yêu cầu xét nghiệm.
     * ADMIN, STAFF và DOCTOR được phép tạo.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<LabRequestDTO> create(@RequestBody LabRequestDTO dto) {
        LabRequestDTO created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * API lấy danh sách tất cả yêu cầu xét nghiệm.
     * ADMIN, STAFF và DOCTOR đều được phép xem.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<List<LabRequestDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    /**
     * API lấy yêu cầu xét nghiệm theo ID.
     * ADMIN, STAFF và DOCTOR đều được phép xem.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<LabRequestDTO> getById(@PathVariable Integer id) {
        LabRequestDTO dto = service.getById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * API lấy yêu cầu xét nghiệm theo bệnh nhân.
     * ADMIN, STAFF và DOCTOR được phép xem.
     */
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<List<LabRequestDTO>> getByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    /**
     * API lấy yêu cầu xét nghiệm theo bác sĩ.
     * ADMIN, STAFF và DOCTOR đều được phép xem.
     */
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<List<LabRequestDTO>> getByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getByDoctorId(doctorId));
    }

    /**
     * API lấy yêu cầu xét nghiệm theo lịch hẹn.
     * ADMIN, STAFF và DOCTOR đều được phép xem.
     */
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<List<LabRequestDTO>> getByAppointmentId(@PathVariable Integer appointmentId) {
        return ResponseEntity.ok(service.getByAppointmentId(appointmentId));
    }

    /**
     * API lấy yêu cầu xét nghiệm theo trạng thái.
     * ADMIN, STAFF và DOCTOR đều được phép xem.
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<List<LabRequestDTO>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    /**
     * API lấy yêu cầu xét nghiệm khẩn cấp.
     * ADMIN, STAFF và DOCTOR đều được phép xem.
     */
    @GetMapping("/urgent")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<List<LabRequestDTO>> getUrgentRequests() {
        return ResponseEntity.ok(service.getUrgentRequests());
    }

    /**
     * API cập nhật yêu cầu xét nghiệm.
     * ADMIN và STAFF được phép cập nhật.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<LabRequestDTO> update(@PathVariable Integer id, @RequestBody LabRequestDTO dto) {
        LabRequestDTO updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * API cập nhật trạng thái yêu cầu xét nghiệm.
     * ADMIN, STAFF và DOCTOR được phép cập nhật trạng thái.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<LabRequestDTO> updateStatus(@PathVariable Integer id, @RequestParam String status) {
        LabRequestDTO updated = service.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * API xóa yêu cầu xét nghiệm.
     * Chỉ ADMIN và STAFF được phép xóa.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Lab Request Item endpoints

    /**
     * API tạo mới item xét nghiệm.
     * ADMIN và STAFF được phép tạo.
     */
    @PostMapping("/items")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<LabRequestItemDTO> createItem(@RequestBody LabRequestItemDTO dto) {
        LabRequestItemDTO created = service.createItem(dto);
        return ResponseEntity.ok(created);
    }

    /**
     * API lấy item xét nghiệm theo ID.
     * ADMIN, STAFF và DOCTOR được phép xem.
     */
    @GetMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<LabRequestItemDTO> getItemById(@PathVariable Integer id) {
        LabRequestItemDTO dto = service.getItemById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * API lấy tất cả items của một yêu cầu xét nghiệm.
     * ADMIN, STAFF và DOCTOR được phép xem.
     */
    @GetMapping("/{labRequestId}/items")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<List<LabRequestItemDTO>> getItemsByLabRequestId(@PathVariable Integer labRequestId) {
        return ResponseEntity.ok(service.getItemsByLabRequestId(labRequestId));
    }

    /**
     * API cập nhật item xét nghiệm.
     * ADMIN và STAFF được phép cập nhật.
     */
    @PutMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<LabRequestItemDTO> updateItem(@PathVariable Integer id, @RequestBody LabRequestItemDTO dto) {
        LabRequestItemDTO updated = service.updateItem(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * API xóa item xét nghiệm.
     * Chỉ ADMIN và STAFF được phép xóa.
     */
    @DeleteMapping("/items/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Void> deleteItem(@PathVariable Integer id) {
        service.deleteItem(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== PATIENT APIs ====================

    /**
     * PATIENT: Tạo yêu cầu xét nghiệm độc lập (không cần appointment)
     */
    @PostMapping("/patient/create")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<LabRequestDTO> createByPatient(@RequestBody LabRequestDTO dto, Authentication authentication) {
        // Auto-assign patientId from authentication
        String patientEmail = authentication.getName();
        // TODO: Get patientId from email - implement this in service
        // dto.setPatientId(patientIdFromEmail);
        
        // Set default values for independent lab request
        if (dto.getAppointmentId() <= 0) {
            dto.setAppointmentId(0); // 0 means no appointment
        }
        if (dto.getStatus() == null || dto.getStatus().trim().isEmpty()) {
            dto.setStatus("Pending");
        }
        
        LabRequestDTO created = service.create(dto);
        return ResponseEntity.ok(created);
    }

    // Patient specific endpoints - chỉ lấy kết quả của chính mình

    /**
     * API bệnh nhân lấy kết quả xét nghiệm của chính mình.
     * Chỉ PATIENT được phép truy cập và chỉ lấy kết quả của chính mình.
     */
    @GetMapping("/patient/my-results")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<LabRequestItemDTO>> getMyLabResults() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String patientEmail = authentication.getName();
        return ResponseEntity.ok(service.getMyLabResults(patientEmail));
    }

    /**
     * API bệnh nhân lấy kết quả xét nghiệm theo trạng thái của chính mình.
     * Chỉ PATIENT được phép truy cập và chỉ lấy kết quả của chính mình.
     */
    @GetMapping("/patient/my-results/status/{status}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<LabRequestItemDTO>> getMyLabResultsByStatus(@PathVariable String status) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String patientEmail = authentication.getName();
        return ResponseEntity.ok(service.getMyLabResultsByStatus(patientEmail, status));
    }

    /**
     * API bệnh nhân lấy kết quả xét nghiệm theo khoảng thời gian của chính mình.
     * Chỉ PATIENT được phép truy cập và chỉ lấy kết quả của chính mình.
     */
    @GetMapping("/patient/my-results/date-range")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<LabRequestItemDTO>> getMyLabResultsByDateRange(
            @RequestParam String startDate, 
            @RequestParam String endDate) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String patientEmail = authentication.getName();
        return ResponseEntity.ok(service.getMyLabResultsByDateRange(patientEmail, startDate, endDate));
    }

    /**
     * API bệnh nhân lấy chi tiết kết quả xét nghiệm của chính mình.
     * Chỉ PATIENT được phép truy cập và chỉ lấy kết quả của chính mình.
     */
    @GetMapping("/patient/my-results/item/{itemId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<LabRequestItemDTO> getMyLabResultItem(@PathVariable Integer itemId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String patientEmail = authentication.getName();
        return ResponseEntity.ok(service.getMyLabResultItem(patientEmail, itemId));
    }
} 