package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.ARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.CreateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.UpdateARVMedicationDTO;

import java.util.List;

public interface ARVMedicationService {
    List<ARVMedicationDTO> getAll();
    ARVMedicationDTO getById(Integer id);
    ARVMedicationDTO create(CreateARVMedicationDTO dto);
    ARVMedicationDTO update(Integer id, UpdateARVMedicationDTO dto);
    void delete(Integer id);
    List<ARVMedicationDTO> getAllARVMedicationsIsActive();
    ARVMedicationDTO getARVMedicationIsActive(Integer id);
    void reactivateARVMedication(Integer id);
}