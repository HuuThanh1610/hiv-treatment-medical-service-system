/**
 * ARVMedicationController.java - REST Controller cho ARV medication management
 *
 * Chức năng:
 * - CRUD operations cho ARV medications
 * - Medication catalog management
 * - Drug information và dosage guidelines
 * - Integration với prescription system
 * - Role-based access control
 * - Admin medication management
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.controller;

// DTOs
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.ARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.CreateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.UpdateARVMedicationDTO;

// Services
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.service.ARVMedicationService;

// Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller xử lý ARV medication-related requests
 * Base URL: /api/arv-medications
 * Requires authentication cho tất cả endpoints
 */
@RestController
@RequestMapping("/api/arv-medications")
@PreAuthorize("isAuthenticated()")
public class ARVMedicationController {

    @Autowired
    private ARVMedicationService service; // Service xử lý business logic cho ARV medications

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<ARVMedicationDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ARVMedicationDTO> getById(@PathVariable Integer id) {
        ARVMedicationDTO dto = service.getById(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ARVMedicationDTO> create(@RequestBody CreateARVMedicationDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ARVMedicationDTO> update(@PathVariable Integer id, @RequestBody UpdateARVMedicationDTO dto) {
        ARVMedicationDTO updated = service.update(id, dto);
        if (updated == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<List<ARVMedicationDTO>> getAllARVMedicationsIsActive() {
        return ResponseEntity.ok(service.getAllARVMedicationsIsActive());
    }

    @GetMapping("/active/{id}")
    @PreAuthorize("hasAnyRole('DOCTOR','PATIENT')")
    public ResponseEntity<ARVMedicationDTO> getARVMedicationIsActive(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getARVMedicationIsActive(id));
    }

    @PutMapping("/active/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<ARVMedicationDTO> reactivateARVMedication(@PathVariable Integer id) {
        service.reactivateARVMedication(id);
        return ResponseEntity.ok().build();
    }


}