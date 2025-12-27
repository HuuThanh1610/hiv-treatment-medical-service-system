/**
 * AppointmentController.java - REST Controller cho appointment management
 *
 * Chức năng:
 * - CRUD operations cho appointments
 * - Appointment booking với medical declaration
 * - Status updates (confirmed, cancelled, completed)
 * - Available slots checking
 * - Doctor và patient appointment views
 * - Role-based access control
 * - Integration với payment system
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.controller;

// DTOs
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentResponseDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AvailableSlotDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentStatusUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.CreateAppointmentWithDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentWithDeclarationDTO;

// Services và Repositories
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service.AppointmentService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;

// Spring Framework
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AppointmentController {
    @GetMapping("/appointments/my-substitute-appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getSubstituteDoctorAppointments(Authentication authentication) {
        Integer doctorId = doctorRepository.findByUserId(
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bác sĩ"))
                .getId();
        return ResponseEntity.ok(appointmentService.getSubstituteDoctorAppointments(doctorId));
    }

    private final AppointmentService appointmentService;
    private final PatientsRepository patientsRepository;
    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;

    @PostMapping("/appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDTO> createAppointment(
            @RequestBody AppointmentRequestDTO request,
            Authentication authentication) {
        // Lấy patientId từ user đang đăng nhập
        Integer patientId = patientsRepository.findByUserId(
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bệnh nhân"))
                .getId();
        return ResponseEntity.ok(appointmentService.createAppointment(request, patientId));
    }

    @PostMapping("/appointments/with-declaration")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentWithDeclarationDTO> createAppointmentWithDeclaration(
            @RequestBody CreateAppointmentWithDeclarationDTO request,
            Authentication authentication) {
        
        // Debug log: Log incoming request
        System.out.println("=== DEBUG: Incoming request ===");
        System.out.println("Request: " + request);
        System.out.println("HealthNotes: '" + request.getHealthNotes() + "'");
        System.out.println("Symptoms: '" + request.getSymptoms() + "'");
        System.out.println("CurrentMedications: '" + request.getCurrentMedications() + "'");
        System.out.println("Allergies: '" + request.getAllergies() + "'");
        System.out.println("EmergencyContact: '" + request.getEmergencyContact() + "'");
        System.out.println("EmergencyPhone: '" + request.getEmergencyPhone() + "'");
        System.out.println("IsPregnant: " + request.isPregnant());
        
        // Lấy patientId từ user đang đăng nhập và gán vào request
        Integer patientId = patientsRepository.findByUserId(
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bệnh nhân"))
                .getId();
        
        // Tạo request mới với patientId từ user đăng nhập
        CreateAppointmentWithDeclarationDTO requestWithPatientId = CreateAppointmentWithDeclarationDTO.builder()
                .patientId(patientId)
                .doctorId(request.getDoctorId())
                .medicalServiceId(request.getMedicalServiceId())
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .notes(request.getNotes())
                .isPregnant(request.isPregnant())
                .healthNotes(request.getHealthNotes())
                .symptoms(request.getSymptoms())
                .currentMedications(request.getCurrentMedications())
                .allergies(request.getAllergies())
                .emergencyContact(request.getEmergencyContact())
                .emergencyPhone(request.getEmergencyPhone())
                .build();
        
        // Debug log: Log processed request
        System.out.println("=== DEBUG: Processed request ===");
        System.out.println("PatientId: " + patientId);
        System.out.println("RequestWithPatientId: " + requestWithPatientId);
        
        AppointmentWithDeclarationDTO result = appointmentService.createAppointmentWithDeclaration(requestWithPatientId);
        
        // Debug log: Log result
        System.out.println("=== DEBUG: Result ===");
        System.out.println("Result: " + result);
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/appointments/doctor-create")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> createAppointmentByDoctor(
            @RequestBody AppointmentRequestDTO request) {
        if (request.getPatientId() == null) {
            throw new RuntimeException("Thiếu patientId");
        }
        return ResponseEntity.ok(appointmentService.createAppointment(request, request.getPatientId()));
    }

    @GetMapping("/appointments/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'STAFF')")
    public ResponseEntity<AppointmentResponseDTO> getAppointmentById(@PathVariable Integer id,
            Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Set<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());

        if (roles.contains("ROLE_PATIENT")) {
            return ResponseEntity.ok(appointmentService.getAppointmentByIdForPatient(id, userDetails.getUsername()));
        } else if (roles.contains("ROLE_DOCTOR")) {
            return ResponseEntity.ok(appointmentService.getAppointmentByIdForDoctor(id, userDetails.getUsername()));
        } else if (roles.contains("ROLE_STAFF")) {
            return ResponseEntity.ok(appointmentService.getAppointmentById(id));
        }

        throw new AccessDeniedException("Không có quyền truy cập");
    }

    @GetMapping("/appointments/my-appointments")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentResponseDTO>> getMyAppointments(Authentication authentication) {
        Integer patientId = patientsRepository.findByUserId(
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bệnh nhân"))
                .getId();
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    @GetMapping("/appointments/my-doctor-appointments")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<AppointmentResponseDTO>> getDoctorAppointments(Authentication authentication) {
        Integer doctorId = doctorRepository.findByUserId(
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bác sĩ"))
                .getId();
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    @PutMapping("/appointments/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDTO> updateAppointment(
            @PathVariable Integer id,
            @RequestBody AppointmentRequestDTO request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(id, request));
    }

    @DeleteMapping("/appointments/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Void> deleteAppointment(
            @PathVariable Integer id,
            @RequestParam(required = false, defaultValue = "Bệnh nhân hủy lịch hẹn") String cancellationReason) {
        appointmentService.deleteAppointment(id, cancellationReason);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/appointments/{id}/checkin")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentResponseDTO> patientCheckIn(
            @PathVariable Integer id,
            Authentication authentication) {
        // Lấy patientId từ user đang đăng nhập
        Integer patientId = patientsRepository.findByUserId(
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bệnh nhân"))
                .getId();
        
        return ResponseEntity.ok(appointmentService.patientCheckIn(id, patientId));
    }
    
        // API cập nhật bác sĩ thay thế cho lịch hẹn
    @PutMapping("/appointments/{id}/substitute")
    @PreAuthorize("hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> updateSubstituteDoctor(
            @PathVariable Integer id,
            @RequestParam Integer substituteDoctorId) {
        return ResponseEntity.ok(appointmentService.updateSubstituteDoctor(id, substituteDoctorId));
    }

    @PostMapping("/appointments/{id}/confirm")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> confirmAppointment(
            @PathVariable Integer id,
            Authentication authentication) {
        Integer doctorId = doctorRepository.findByUserId(
                userRepository.findByEmail(authentication.getName())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                        .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bác sĩ"))
                .getId();
        return ResponseEntity.ok(appointmentService.confirmAppointment(id, doctorId));
    }



    @GetMapping("/doctors/{doctorId}/available-slots")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'STAFF')")
    public ResponseEntity<List<AvailableSlotDTO>> getDoctorAvailableSlots(
            @PathVariable Integer doctorId,
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(appointmentService.getDoctorAvailableSlots(doctorId, date));
    }

    @PatchMapping("/appointments/{id}/status")
    @PreAuthorize("hasRole('STAFF') or hasRole('DOCTOR')")
    public ResponseEntity<AppointmentResponseDTO> updateAppointmentStatus(
            @PathVariable Integer id,
            @RequestBody AppointmentStatusUpdateDTO statusUpdateDTO) {
        return ResponseEntity.ok(appointmentService.updateAppointmentStatus(id, statusUpdateDTO));
    }

    @GetMapping("/appointments/all")
    @PreAuthorize("hasRole('STAFF')")
    public ResponseEntity<List<AppointmentResponseDTO>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }
}