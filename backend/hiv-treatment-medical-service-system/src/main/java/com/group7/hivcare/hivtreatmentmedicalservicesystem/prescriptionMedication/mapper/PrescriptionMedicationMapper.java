package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;

public interface PrescriptionMedicationMapper {
    PrescriptionMedicationDTO convertToDTO (PrescriptionMedication prescriptionMedication);
}
