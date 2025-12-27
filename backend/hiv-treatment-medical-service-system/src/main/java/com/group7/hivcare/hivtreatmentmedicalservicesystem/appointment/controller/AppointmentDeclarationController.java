package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service.AppointmentDeclarationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointment-declarations")
@RequiredArgsConstructor
public class AppointmentDeclarationController {

    private final AppointmentDeclarationService declarationService;

    // Tạo khai báo mới
    @PostMapping
    public ResponseEntity<AppointmentDeclarationDTO> createDeclaration(@Valid @RequestBody AppointmentDeclarationDTO dto) {
        AppointmentDeclarationDTO created = declarationService.createDeclaration(dto);
        return ResponseEntity.ok(created);
    }

    // Cập nhật khai báo
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDeclarationDTO> updateDeclaration(
            @PathVariable Integer id, 
            @Valid @RequestBody AppointmentDeclarationDTO dto) {
        AppointmentDeclarationDTO updated = declarationService.updateDeclaration(id, dto);
        return ResponseEntity.ok(updated);
    }

    // Lấy khai báo theo ID
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDeclarationDTO> getById(@PathVariable Integer id) {
        AppointmentDeclarationDTO declaration = declarationService.getById(id);
        return ResponseEntity.ok(declaration);
    }

    // Lấy khai báo theo appointmentId
    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<AppointmentDeclarationDTO> getByAppointmentId(@PathVariable Integer appointmentId) {
        AppointmentDeclarationDTO declaration = declarationService.getByAppointmentId(appointmentId);
        if (declaration == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(declaration);
    }

    // Lấy tất cả khai báo của một bệnh nhân
    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<AppointmentDeclarationDTO>> getByPatientId(@PathVariable Integer patientId) {
        List<AppointmentDeclarationDTO> declarations = declarationService.getByPatientId(patientId);
        return ResponseEntity.ok(declarations);
    }

    // Lấy tất cả khai báo của một bác sĩ
    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<AppointmentDeclarationDTO>> getByDoctorId(@PathVariable Integer doctorId) {
        List<AppointmentDeclarationDTO> declarations = declarationService.getByDoctorId(doctorId);
        return ResponseEntity.ok(declarations);
    }

    // Kiểm tra trạng thái mang thai của bệnh nhân
    @GetMapping("/patient/{patientId}/pregnant-status")
    public ResponseEntity<Boolean> isPatientPregnant(
            @PathVariable Integer patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate appointmentDate) {
        boolean isPregnant = declarationService.isPatientPregnant(patientId, appointmentDate);
        return ResponseEntity.ok(isPregnant);
    }

    // Lấy danh sách bệnh nhân mang thai trong khoảng thời gian
    @GetMapping("/pregnant-patients")
    public ResponseEntity<List<AppointmentDeclarationDTO>> getPregnantPatientsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AppointmentDeclarationDTO> declarations = declarationService.getPregnantPatientsByDateRange(startDate, endDate);
        return ResponseEntity.ok(declarations);
    }

    // Xóa khai báo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeclaration(@PathVariable Integer id) {
        declarationService.deleteDeclaration(id);
        return ResponseEntity.noContent().build();
    }
} 