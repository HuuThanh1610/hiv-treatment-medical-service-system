package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentHistory;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVProtocolRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.TreatmentHistoryDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper.TreatmentHistoryMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TreatmentHistoryMapperImpl implements TreatmentHistoryMapper {
    
    @Autowired
    private ARVProtocolRepository arvProtocolRepository;
    
    @Override
    public TreatmentHistoryDTO toDTO(TreatmentHistory entity) {
        if (entity == null) {
            return null;
        }
        
        String oldProtocolName = null;
        String newProtocolName = null;
        
        if (entity.getOldArvProtocolId() != null) {
            oldProtocolName = arvProtocolRepository.findById(entity.getOldArvProtocolId())
                .map(protocol -> protocol.getName())
                .orElse("Không xác định");
        }
        
        if (entity.getNewArvProtocolId() != null) {
            newProtocolName = arvProtocolRepository.findById(entity.getNewArvProtocolId())
                .map(protocol -> protocol.getName())
                .orElse("Không xác định");
        }
        
        return TreatmentHistoryDTO.builder()
                .id(entity.getId())
                .treatmentPlanId(entity.getTreatmentPlan().getId())
                .oldArvProtocolId(entity.getOldArvProtocolId())
                .oldArvProtocolName(oldProtocolName)
                .newArvProtocolId(entity.getNewArvProtocolId())
                .newArvProtocolName(newProtocolName)
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .reason(entity.getReason())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .patientId(entity.getTreatmentPlan().getPatient().getId())
                .patientName(entity.getTreatmentPlan().getPatient().getUser().getFullName())
                .doctorId(entity.getTreatmentPlan().getDoctor().getId())
                .doctorName(entity.getTreatmentPlan().getDoctor().getUser().getFullName())
                .build();
    }
    
    @Override
    public List<TreatmentHistoryDTO> toDTOList(List<TreatmentHistory> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}

