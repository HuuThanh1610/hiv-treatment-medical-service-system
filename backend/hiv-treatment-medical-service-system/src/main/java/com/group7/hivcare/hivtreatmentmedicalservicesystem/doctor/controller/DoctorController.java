package com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorProfileDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.CreateDoctorRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.service.DoctorService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.DoctorScheduleService doctorScheduleService;

    @GetMapping("/schedules")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DoctorScheduleDTO>> getAllDoctorSchedules() {
        return ResponseEntity.ok(doctorScheduleService.getAllSchedules());
    }

    @GetMapping("/me/schedule-dto")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorScheduleDTO>> getMyScheduleDTO(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String status,
            Authentication authentication) {
        List<DoctorSchedule> schedules;
        if (status != null && !status.isEmpty()) {
            try {
                com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus statusEnum = com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.valueOf(status);
                schedules = doctorService.getDoctorScheduleByStatus(authentication.getName(), date, statusEnum);
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        } else {
            schedules = doctorService.getDoctorSchedule(authentication.getName(), date);
        }
        List<DoctorScheduleDTO> dtos = schedules.stream().map(s -> {
            DoctorScheduleDTO dto = new DoctorScheduleDTO();
            dto.setId(s.getId());
            dto.setDoctorId(s.getDoctor().getId());
            dto.setDoctorName(s.getDoctor().getUser().getFullName());
            dto.setDayOfWeek(s.getDayOfWeek());
            dto.setDate(s.getDate());
            dto.setStartTime(s.getStartTime());
            dto.setEndTime(s.getEndTime());
            dto.setNotes(s.getNotes());
            dto.setStatus(s.getStatus() != null ? s.getStatus().name() : "ACTIVE");
            return dto;
        }).toList();
        return ResponseEntity.ok(dtos);
    }

    @Autowired
    private DoctorService doctorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorDTO> createDoctor(@RequestBody CreateDoctorRequestDTO request) {
        return ResponseEntity.ok(doctorService.createDoctorWithUser(request));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DoctorDTO>> getAllDoctors() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DoctorDTO> getDoctorByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(doctorService.getDoctorByUserId(userId));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDTO> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(doctorService.getDoctorByEmail(authentication.getName()));
    }

    @PostMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDTO> createMyProfile(
            @RequestBody DoctorProfileDTO profileDTO,
            Authentication authentication) {
        return ResponseEntity.ok(doctorService.createDoctorProfile(authentication.getName(), profileDTO));
    }

    @PutMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<DoctorDTO> updateMyProfile(
            @RequestBody DoctorProfileDTO profileDTO,
            Authentication authentication) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(authentication.getName(), profileDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("(hasRole('DOCTOR') and @doctorService.isOwner(#id, authentication.principal.username)) or hasRole('ADMIN')")
    public ResponseEntity<DoctorDTO> updateDoctor(
            @PathVariable Integer id, 
            @RequestBody DoctorProfileDTO profileDTO,
            Authentication authentication) {
        return ResponseEntity.ok(doctorService.updateDoctorProfile(authentication.getName(), profileDTO));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateDoctor(@PathVariable Integer id) {
        doctorService.deactivateDoctor(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me/schedule")
    @PreAuthorize("hasRole('DOCTOR')")
    public ResponseEntity<List<DoctorSchedule>> getMySchedule(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication) {
        return ResponseEntity.ok(doctorService.getDoctorSchedule(authentication.getName(), date));
    }
} 