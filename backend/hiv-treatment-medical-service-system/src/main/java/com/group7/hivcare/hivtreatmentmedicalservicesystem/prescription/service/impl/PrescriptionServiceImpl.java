package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.CreatePrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.PrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.dto.UpdatePrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescription.service.PrescriptionService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PrescriptionServiceImpl implements PrescriptionService {
    @Override
    public PrescriptionDTO create(CreatePrescriptionDTO dto) {
        return null;
    }

    @Override
    public PrescriptionDTO update(Integer id, UpdatePrescriptionDTO dto) {
        return null;
    }

    @Override
    public void delete(Integer id) {

    }

    @Override
    public PrescriptionDTO getById(Integer id) {
        return null;
    }

    @Override
    public List<PrescriptionDTO> getByTreatmentPlanId(Integer treatmentPlanId) {
        return List.of();
    }
}
