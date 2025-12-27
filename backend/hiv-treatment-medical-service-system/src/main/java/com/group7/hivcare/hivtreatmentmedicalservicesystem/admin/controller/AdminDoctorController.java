package com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.CreateDoctorRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.service.DoctorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/doctors")
public class AdminDoctorController {

    @Autowired
    private DoctorService doctorService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DoctorDTO> createDoctor(@RequestBody CreateDoctorRequestDTO request) {
        return ResponseEntity.ok(doctorService.createDoctorWithUser(request));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateDoctor(@PathVariable Integer id) {
        doctorService.deactivateDoctor(id);
        return ResponseEntity.noContent().build();
    }
} 