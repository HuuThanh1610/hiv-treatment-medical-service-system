package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.ARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.CreateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.UpdateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVMedication;

public interface ARVMedicationMapper {
    ARVMedicationDTO convertToDTO(ARVMedication entity);
    ARVMedication convertToEntity(CreateARVMedicationDTO dto);
    ARVMedication convertToEntity(UpdateARVMedicationDTO dto, ARVMedication existingEntity);
}
