package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.CreateMedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.MedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.UpdateMedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.service.MedicalServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.springframework.security.authorization.AuthorityReactiveAuthorizationManager.hasAnyRole;

@RestController
@RequestMapping("/api/medical-services")
@PreAuthorize("isAuthenticated()")
public class MedicalServicesController {

    @Autowired
    private MedicalServiceService medicalServiceService;

    @GetMapping
    public ResponseEntity<List<MedicalServiceDTO>> getAllMedicalServices() {
        return ResponseEntity.ok(medicalServiceService.getAllMedicalServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalServiceDTO> getMedicalServiceById(@PathVariable Integer id) {
        return ResponseEntity.ok(medicalServiceService.getMedicalServiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<MedicalServiceDTO> create(@RequestBody CreateMedicalServiceDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medicalServiceService.createMedicalService(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<MedicalServiceDTO> update(@PathVariable Integer id, @RequestBody UpdateMedicalServiceDTO dto) {
        return ResponseEntity.ok(medicalServiceService.updateMedicalService(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        medicalServiceService.deleteMedicalService(id);
        return ResponseEntity.ok("Dich vụ y tế đã được xóa thành công");
    }
} 