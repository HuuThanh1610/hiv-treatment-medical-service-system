package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionRequestDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface PrescriptionMedicationService {
    List<PrescriptionMedicationDTO> createPrescriptionWithMedications(PrescriptionRequestDTO dto);
    List<PrescriptionMedicationDTO> createPrescriptionWithMedications(Integer treatmentPlanId, PrescriptionRequestDTO dto);
    List<PrescriptionMedicationDTO> getPrescriptionWithMedications(Integer prescriptionId);
    List<PrescriptionMedicationDTO> getMedicationsByTreatmentPlanId(Integer treatmentPlanId);
}
