/**
 * PatientController.java - REST Controller cho patient management
 *
 * Chức năng:
 * - CRUD operations cho patients
 * - Patient profile management
 * - Medical history tracking
 * - Pregnancy status updates
 * - Treatment plan assignments
 * - Role-based access control
 * - Integration với user authentication
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.controller;

// DTOs
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientCreateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PregnancyStatusRequest;

// Services
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.service.PatientService;

// Spring Framework
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;

    // Lấy thông tin bệnh nhân hiện tại
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientDTO> getCurrentPatient(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(patientService.getCurrentPatient(userDetails.getUsername()));
    }

    // Cập nhật thông tin bệnh nhân hiện tại
    @PutMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientDTO> updateCurrentPatient(@AuthenticationPrincipal UserDetails userDetails, @RequestBody PatientUpdateDTO dto) {
        return ResponseEntity.ok(patientService.updateCurrentPatient(userDetails.getUsername(), dto));
    }

    // Cập nhật trạng thái mang thai
    @PutMapping("/me/pregnancy-status")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientDTO> updatePregnancyStatus(@AuthenticationPrincipal UserDetails userDetails, @RequestBody PregnancyStatusRequest request) {
        return ResponseEntity.ok(patientService.updatePregnancyStatus(userDetails.getUsername(), request.getIsPregnant()));
    }

    // Lấy thông tin bệnh nhân theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Integer id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    // Cập nhật thông tin bệnh nhân theo ID
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DOCTOR', 'PATIENT')")
    public ResponseEntity<PatientDTO> updatePatient(@PathVariable Integer id, @RequestBody PatientUpdateDTO dto) {
        return ResponseEntity.ok(patientService.updatePatient(id, dto));
    }

    // Lấy danh sách tất cả bệnh nhân
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DOCTOR')")
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        return ResponseEntity.ok(patientService.getAllPatients());
    }

    // Xóa (deactivate) bệnh nhân
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        patientService.deactivatePatient(id);
        return ResponseEntity.noContent().build();
    }

    // Tạo mới bệnh nhân
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PatientDTO> createPatient(@RequestBody PatientCreateDTO dto) {
        return ResponseEntity.ok(patientService.createPatient(dto));
    }
} 