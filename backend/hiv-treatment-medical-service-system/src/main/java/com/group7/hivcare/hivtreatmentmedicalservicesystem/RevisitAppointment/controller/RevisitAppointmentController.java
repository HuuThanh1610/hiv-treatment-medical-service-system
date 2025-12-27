package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.CreateRevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.RevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.service.RevisitAppointmentSchedulerService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.service.RevisitAppointmentService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/revisit-appointments")
@RequiredArgsConstructor
public class RevisitAppointmentController {
    private final RevisitAppointmentService revisitAppointmentService;
    private final RevisitAppointmentSchedulerService revisitAppointmentSchedulerService;
    private final DoctorRepository doctorRepository;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<RevisitAppointmentDTO> createRevisitAppointment(
            @Valid @RequestBody CreateRevisitAppointmentDTO dto) {
        return ResponseEntity.ok(revisitAppointmentService.createRevisitAppointment(dto));
    }


    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<RevisitAppointmentDTO> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(revisitAppointmentService.getById(id));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<RevisitAppointmentDTO> getByAppointmentId(@PathVariable Integer appointmentId) {
        return ResponseEntity.ok(revisitAppointmentService.getByAppointmentId(appointmentId));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<RevisitAppointmentDTO>> getByPatientId(
            @PathVariable Integer patientId,
            Authentication authentication) {
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_PATIENT"))) {
            Integer authPatientId = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                    .getId();
            if (!authPatientId.equals(patientId)) {
                throw new RuntimeException("Bạn không có quyền xem tái khám của bệnh nhân này");
            }
        }
        return ResponseEntity.ok(revisitAppointmentService.getByPatientId(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<RevisitAppointmentDTO>> getByDoctorId(
            @PathVariable Integer doctorId,
            Authentication authentication) {
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"))) {
            Integer authDoctorId = doctorRepository.findByUserId(
                            userRepository.findByEmail(authentication.getName())
                                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                                    .getId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bác sĩ"))
                    .getId();
            if (!authDoctorId.equals(doctorId)) {
                throw new RuntimeException("Bạn không có quyền xem tái khám của bác sĩ này");
            }
        }
        return ResponseEntity.ok(revisitAppointmentService.getByDoctorId(doctorId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<Void> deleteRevisitAppointment(
            @PathVariable Integer id,
            Authentication authentication) {
        Integer doctorId = doctorRepository.findByUserId(
                        userRepository.findByEmail(authentication.getName())
                                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"))
                                .getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bác sĩ"))
                .getId();
        revisitAppointmentService.deleteRevisitAppointment(id, doctorId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/send-reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<String> sendRemindersForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        revisitAppointmentSchedulerService.sendRemindersForDate(date);
        return ResponseEntity.ok("Đã gửi email nhắc nhở cho ngày: " + date);
    }

    @PostMapping("/send-tomorrow-reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<String> sendTomorrowReminders() {
        revisitAppointmentSchedulerService.sendRemindersForDate(LocalDate.now().plusDays(1));
        return ResponseEntity.ok("Đã gửi email nhắc nhở cho ngày mai");
    }
}
