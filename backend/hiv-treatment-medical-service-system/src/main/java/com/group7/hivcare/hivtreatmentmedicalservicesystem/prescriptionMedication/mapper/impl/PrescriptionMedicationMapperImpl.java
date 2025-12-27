package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.mapper.PrescriptionMedicationMapper;
import org.springframework.stereotype.Component;

@Component
public class PrescriptionMedicationMapperImpl implements PrescriptionMedicationMapper {
    @Override
    public PrescriptionMedicationDTO convertToDTO(PrescriptionMedication prescriptionMedication) {
        PrescriptionMedicationDTO medicationDTO = new PrescriptionMedicationDTO();
        medicationDTO.setMedicationId(prescriptionMedication.getArvMedication().getId());
        medicationDTO.setName(prescriptionMedication.getArvMedication().getName());
        medicationDTO.setDosage(prescriptionMedication.getDosage());
        medicationDTO.setFrequency(prescriptionMedication.getFrequency());
        medicationDTO.setDurationDays(prescriptionMedication.getDurationDays());
        medicationDTO.setNotes(prescriptionMedication.getNotes());
        return medicationDTO;
    }
}
