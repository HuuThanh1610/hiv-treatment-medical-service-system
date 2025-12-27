package com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.CreatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.PatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.UpdatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.service.PatientFeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class PatientFeedbackController {

    private final PatientFeedbackService feedbackService;

    @PostMapping
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientFeedbackDTO> createFeedback(@Valid @RequestBody CreatePatientFeedbackDTO dto) {
        return ResponseEntity.ok(feedbackService.createFeedback(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientFeedbackDTO> updateFeedback(
            @PathVariable Integer id,
            @Valid @RequestBody UpdatePatientFeedbackDTO dto) {
        return ResponseEntity.ok(feedbackService.updateFeedback(id, dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<PatientFeedbackDTO> getFeedbackById(@PathVariable Integer id) {
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('PATIENT', 'DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<PatientFeedbackDTO> getFeedbackByAppointmentId(@PathVariable Integer appointmentId) {
        return ResponseEntity.ok(feedbackService.getFeedbackByAppointmentId(appointmentId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientFeedbackDTO>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/doctor/{doctorId}")
    @PreAuthorize("hasAnyRole('DOCTOR', 'ADMIN', 'STAFF')")
    public ResponseEntity<List<PatientFeedbackDTO>> getFeedbacksByDoctorId(@PathVariable Integer doctorId) {
        return ResponseEntity.ok(feedbackService.getFeedbacksByDoctorId(doctorId));
    }

    @GetMapping("/can-feedback/{appointmentId}")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<Boolean> canPatientProvideFeedback(@PathVariable Integer appointmentId) {
        return ResponseEntity.ok(feedbackService.canPatientProvideFeedback(appointmentId));
    }

}
