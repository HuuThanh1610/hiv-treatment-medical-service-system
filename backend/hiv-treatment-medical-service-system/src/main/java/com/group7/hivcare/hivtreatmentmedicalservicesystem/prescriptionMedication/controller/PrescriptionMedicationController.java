package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.service.PrescriptionMedicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prescription-medications")
@CrossOrigin(origins = "*")
public class PrescriptionMedicationController {

    @Autowired
    private PrescriptionMedicationService prescriptionMedicationService;

    @GetMapping("/treatment-plan/{treatmentPlanId}")
    public ResponseEntity<List<PrescriptionMedicationDTO>> getMedicationsByTreatmentPlan(
            @PathVariable Integer treatmentPlanId) {
        try {
            List<PrescriptionMedicationDTO> medications = prescriptionMedicationService.getMedicationsByTreatmentPlanId(treatmentPlanId);
            return ResponseEntity.ok(medications);
        } catch (Exception e) {
            // Log error và trả về empty list thay vì throw error
            System.err.println("Error getting medications for treatment plan " + treatmentPlanId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Trả về empty list
        }
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<PrescriptionMedicationDTO>> getMedicationsByPrescription(
            @PathVariable Integer prescriptionId) {
        try {
            List<PrescriptionMedicationDTO> medications = prescriptionMedicationService.getPrescriptionWithMedications(prescriptionId);
            return ResponseEntity.ok(medications);
        } catch (Exception e) {
            // Log error và trả về empty list thay vì throw error
            System.err.println("Error getting medications for prescription " + prescriptionId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(List.of()); // Trả về empty list
        }
    }
}
