package com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.PatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.CreatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.UpdatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentPlanStatus;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.service.PatientTreatmentPlanService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;


import java.util.List;

@RestController
@RequestMapping("/api/patient-treatment-plans")
public class PatientTreatmentPlanController {

    @Autowired
    private PatientTreatmentPlanService service;

    @Autowired
    private PatientsRepository patientsRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @GetMapping("/patient/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getMyPatientTreatmentPlans(Authentication authentication) {
      // Lấy patientId từ user đang đăng nhập
      Integer patientId = patientsRepository.findByUserId(
        userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                .getId())
        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bệnh nhân"))
        .getId();
        return ResponseEntity.ok(service.getPatientTreatmentPlansByPatientId(patientId));
    }

    @GetMapping("/doctor/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getPatientTreatmentPlansOfThisDoctor(Authentication authentication) {
        Integer doctorId = doctorRepository.findByUserId(
            userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
            .getId())
            .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bác sĩ"))
            .getId();
        return ResponseEntity.ok(service.getPatientTreatmentPlansByDoctorId(doctorId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF', 'PATIENT')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getPatientTreatmentPlans(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getPatientTreatmentPlansByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getDoctorPatientTreatmentPlans(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getPatientTreatmentPlansByDoctorId(doctorId));
    }


    @GetMapping("/patient/{patientId}/active") //Không cho get status HIDDEN
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF', 'PATIENT')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getPatientTreatmentPlansActiveByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getPatientTreatmentPlansByPatientIdAndIsActive(patientId));
    }

    @GetMapping("/doctor/{doctorId}/active")  //Không cho get status HIDDEN
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getPatientTreatmentPlansActiveByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getPatientTreatmentPlansByDoctorIdAndIsActive(doctorId));
    }


    @GetMapping("/patient/{patientId}/all") 
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getAllPatientTreatmentPlansByPatientId(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getPatientTreatmentPlansByPatientId(patientId));
    }


    @GetMapping("/doctor/{doctorId}/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getAllPatientTreatmentPlansByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(service.getPatientTreatmentPlansByDoctorId(doctorId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<PatientTreatmentPlanDTO> getById(@PathVariable Integer id) {
        PatientTreatmentPlanDTO dto = service.getById(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientTreatmentPlanDTO>> getAll() {
        List<PatientTreatmentPlanDTO> dto = service.getAll();
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }


    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<PatientTreatmentPlanDTO> create(@Valid @RequestBody CreatePatientTreatmentPlanDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<PatientTreatmentPlanDTO> update(
            @PathVariable Integer id, 
            @Valid @RequestBody UpdatePatientTreatmentPlanDTO dto) {
        PatientTreatmentPlanDTO updated = service.update(id, dto);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }



//    @PatchMapping("/{id}/resume")
//    @PreAuthorize("hasRole('DOCTOR')")
//    public ResponseEntity<PatientTreatmentPlanDTO> resumeTreatment(
//            @PathVariable Integer id,
//            @RequestParam(required = false) String reason) {
//        PatientTreatmentPlanDTO updated = service.resumeTreatment(id, reason);
//        if (updated == null) return ResponseEntity.notFound().build();
//        return ResponseEntity.ok(updated);
//    }
//
//    @PatchMapping("/{id}/discontinue")
//    @PreAuthorize("hasRole('DOCTOR')")
//    public ResponseEntity<PatientTreatmentPlanDTO> discontinueTreatment(
//            @PathVariable Integer id,
//            @RequestParam(required = false) String reason) {
//        PatientTreatmentPlanDTO updated = service.discontinueTreatment(id, reason);
//        if (updated == null) return ResponseEntity.notFound().build();
//        return ResponseEntity.ok(updated);
//    }
//
//    @PatchMapping("/{id}/hide")
//    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
//    public ResponseEntity<PatientTreatmentPlanDTO> hideTreatment(
//            @PathVariable Integer id,
//            @RequestParam(required = false) String reason) {
//        PatientTreatmentPlanDTO updated = service.hideTreatment(id, reason);
//        if (updated == null) return ResponseEntity.notFound().build();
//        return ResponseEntity.ok(updated);
//    }

    //Hiện tại chưa nên delete, chỉ hide
    //Nếu cần delete thì cần xóa các bảng liên quan
    // @DeleteMapping("/{id}")
    // @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    // public ResponseEntity<Void> delete(@PathVariable Integer id) {
    //     service.delete(id);
    //     return ResponseEntity.noContent().build();
    // }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<PatientTreatmentPlanDTO> activateTreatmentPlan(@PathVariable Integer id) {
        try {
            PatientTreatmentPlanDTO activated = service.activateTreatmentPlan(id);
            return ResponseEntity.ok(activated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<PatientTreatmentPlanDTO> deactivateTreatmentPlan(@PathVariable Integer id) {
        try {
            PatientTreatmentPlanDTO deactivated = service.deactivateTreatmentPlan(id);
            return ResponseEntity.ok(deactivated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/cleanup-reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<String> cleanupInactiveTreatmentPlanReminders() {
        try {
            int deletedCount = service.cleanupInactiveTreatmentPlanReminders();
            return ResponseEntity.ok("Đã xóa " + deletedCount + " nhắc nhở uống thuốc của các kế hoạch điều trị không còn sử dụng");
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body("Lỗi khi xóa nhắc nhở: " + e.getMessage());
        }
    }
}