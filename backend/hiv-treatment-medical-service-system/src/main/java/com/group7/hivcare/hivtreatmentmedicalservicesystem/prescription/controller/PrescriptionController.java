package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.CreatePrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.UpdatePrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.PrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.service.PrescriptionService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.service.PrescriptionMedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private PrescriptionMedicationService prescriptionMedicationService;

    @PostMapping("/treatment-plan/{treatmentPlanId}")
    public ResponseEntity<List<PrescriptionMedicationDTO>> createPrescriptionForTreatmentPlan(
            @PathVariable Integer treatmentPlanId,
            @RequestBody PrescriptionRequestDTO dto) {
        return ResponseEntity.ok(prescriptionMedicationService.createPrescriptionWithMedications(treatmentPlanId, dto));
    }

    @GetMapping("/treatment-plan/{treatmentPlanId}/medications")
    public ResponseEntity<List<PrescriptionMedicationDTO>> getPrescriptionMedicationsByTreatmentPlan(
            @PathVariable Integer treatmentPlanId) {
        List<PrescriptionMedicationDTO> medications = prescriptionMedicationService.getMedicationsByTreatmentPlanId(treatmentPlanId);
        return ResponseEntity.ok(medications);
    }

//    @PutMapping("/{id}")
//    public ResponseEntity<PrescriptionDTO> update(@PathVariable Integer id, @RequestBody UpdatePrescriptionDTO dto) {
//        PrescriptionDTO updated = prescriptionService.update(id, dto);
//        if (updated == null) return ResponseEntity.notFound().build();
//        return ResponseEntity.ok(updated);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> delete(@PathVariable Integer id) {
//        prescriptionService.delete(id);
//        return ResponseEntity.noContent().build();
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<PrescriptionDTO> getById(@PathVariable Integer id) {
//        PrescriptionDTO prescription = prescriptionService.getById(id);
//        if (prescription == null) return ResponseEntity.notFound().build();
//        return ResponseEntity.ok(prescription);
//    }
//
//    @GetMapping("/treatment-plan/{treatmentPlanId}")
//    public ResponseEntity<List<PrescriptionDTO>> getByTreatmentPlanId(@PathVariable Integer treatmentPlanId) {
//        return ResponseEntity.ok(prescriptionService.getByTreatmentPlanId(treatmentPlanId));
//    }
} 