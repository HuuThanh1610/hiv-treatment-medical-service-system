package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.CreateARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.UpdateARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.service.ARVProtocolService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocol;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVProtocolMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RecommendationType;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TargetGroup;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentLevel;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVProtocolMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVProtocolRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ARVProtocolServiceImpl implements ARVProtocolService {
    @Autowired
    private ARVProtocolRepository arvProtocolRepository;
    
    @Autowired
    private ARVProtocolMedicationRepository arvProtocolMedicationRepository;

    private ARVProtocolDTO convertToDTO (ARVProtocol arvProtocol) {
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
        
        // Load và map medications
        List<ARVProtocolMedication> protocolMedications = arvProtocolMedicationRepository.findAllByProtocolId(arvProtocol.getId());
        List<ARVProtocolMedicationDTO> medicationDTOs = protocolMedications.stream()
                .map(this::convertProtocolMedicationToDTO)
                .collect(Collectors.toList());
        arvProtocolDTO.setArvProtocolMedicationsDTO(medicationDTOs);
        
        return arvProtocolDTO;
    }
    
    private ARVProtocolMedicationDTO convertProtocolMedicationToDTO(ARVProtocolMedication protocolMedication) {
        return ARVProtocolMedicationDTO.builder()
                .medicationId(protocolMedication.getArvMedication().getId())
                .medicationName(protocolMedication.getArvMedication().getName())
                .dosage(protocolMedication.getDosage())
                .frequency(protocolMedication.getFrequency())
                .duration(protocolMedication.getDuration())
                .sideEffects(protocolMedication.getSideEffects())
                .note(protocolMedication.getNote())
                .build();
    }


    @Override
    public ARVProtocolDTO getARVProtocol(Integer id) {
        ARVProtocol arvProtocol = arvProtocolRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ARV protocol không tồn tại"));
        return convertToDTO(arvProtocol);
    }

    @Override
    public List<ARVProtocolDTO> getAllARVProtocols() {
        return arvProtocolRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ARVProtocolDTO getARVProtocolIsActive(Integer id) {
        ARVProtocol arvProtocol = arvProtocolRepository.findById(id)
                .filter(ARVProtocol::getActive) //filter chi lay true
                .orElseThrow(() -> new EntityNotFoundException("ARV protocol không tồn tại"));
        return convertToDTO(arvProtocol);
    }

    @Override
    public List<ARVProtocolDTO> getAllARVProtocolsIsActive() {
        return arvProtocolRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ARVProtocolDTO updateARVProtocol(Integer id, UpdateARVProtocolDTO updateARVProtocolDTO) {
        ARVProtocol arvProtocol = arvProtocolRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ARV protocol không tồn tại"));
        arvProtocol.setName(updateARVProtocolDTO.getName());
        arvProtocol.setDescription(updateARVProtocolDTO.getDescription());
        if (updateARVProtocolDTO.getRecommendation() != null) {
        arvProtocol.setRecommendation(updateARVProtocolDTO.getRecommendation());
    }
    if (updateARVProtocolDTO.getTreatmentLevel() != null) {
        arvProtocol.setTreatmentLevel(updateARVProtocolDTO.getTreatmentLevel());
    }
        arvProtocol.setSideEffects(updateARVProtocolDTO.getSideEffects());
        arvProtocol.setContraindications(updateARVProtocolDTO.getContraindications());
        arvProtocol.setTargetGroup(updateARVProtocolDTO.getTargetGroup());
        ARVProtocol saved = arvProtocolRepository.save(arvProtocol);
        return convertToDTO(saved);
    }

    @Override
    public void deleteARVProtocol(Integer id) {
        ARVProtocol arvProtocol = arvProtocolRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ARV protocol không tồn tại"));
        arvProtocol.setActive(false);
        arvProtocolRepository.save(arvProtocol);
    }

    @Override
    public void activeARVProtocol(Integer id) {
        ARVProtocol arvProtocol = arvProtocolRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ARV protocol không tồn tại"));
        arvProtocol.setActive(true);
        arvProtocolRepository.save(arvProtocol);
    }
}
