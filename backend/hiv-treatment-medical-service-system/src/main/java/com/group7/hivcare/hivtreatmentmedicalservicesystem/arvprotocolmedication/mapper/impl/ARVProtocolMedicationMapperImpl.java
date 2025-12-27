package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVMedicationForProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.mapper.ARVProtocolMedicationMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocol;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocolMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RecommendationType;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentLevel;
import org.springframework.stereotype.Component;

@Component
public class ARVProtocolMedicationMapperImpl implements ARVProtocolMedicationMapper {
    @Override
    public ARVMedicationForProtocolDTO convertToMedicationForProtocolDTO(ARVProtocolMedication arvProtocolMedication) {
        ARVMedicationForProtocolDTO arvDTO = new ARVMedicationForProtocolDTO();
        arvDTO.setMedicationId(arvProtocolMedication.getArvMedication().getId());
        arvDTO.setCode(arvProtocolMedication.getArvMedication().getCode());
        arvDTO.setDescription(arvProtocolMedication.getArvMedication().getDescription());
        arvDTO.setName(arvProtocolMedication.getArvMedication().getName());
        arvDTO.setDrugClass(arvProtocolMedication.getArvMedication().getDrugClass());
        arvDTO.setDosage(arvProtocolMedication.getDosage());
        arvDTO.setDuration(arvProtocolMedication.getDuration());
        arvDTO.setSideEffects(arvProtocolMedication.getSideEffects());
        arvDTO.setFrequency(arvProtocolMedication.getFrequency());
        arvDTO.setNote(arvProtocolMedication.getNote());
        return arvDTO;
    }

    @Override
    public ARVProtocolDTO convertToDTO (ARVProtocol arvProtocol) {
        ARVProtocolDTO arvProtocolDTO = new ARVProtocolDTO();
        arvProtocolDTO.setId(arvProtocol.getId());
        arvProtocolDTO.setName(arvProtocol.getName());
        arvProtocolDTO.setDescription(arvProtocol.getDescription());
        arvProtocolDTO.setRecommendation(arvProtocol.getRecommendation());
        arvProtocolDTO.setTreatmentLevel(arvProtocol.getTreatmentLevel());
        arvProtocolDTO.setSideEffects(arvProtocol.getSideEffects());
        arvProtocolDTO.setContraindications(arvProtocol.getContraindications());
        arvProtocolDTO.setTargetGroup(arvProtocol.getTargetGroup());
        arvProtocolDTO.setActive(arvProtocol.getActive());
        return arvProtocolDTO;
    }
}
