package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.CreatePrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.UpdatePrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.PrescriptionDTO;
import java.util.List;

public interface PrescriptionService {
    PrescriptionDTO create(CreatePrescriptionDTO dto);
    PrescriptionDTO update(Integer id, UpdatePrescriptionDTO dto);
    void delete(Integer id);
    PrescriptionDTO getById(Integer id);
    List<PrescriptionDTO> getByTreatmentPlanId(Integer treatmentPlanId);
} 