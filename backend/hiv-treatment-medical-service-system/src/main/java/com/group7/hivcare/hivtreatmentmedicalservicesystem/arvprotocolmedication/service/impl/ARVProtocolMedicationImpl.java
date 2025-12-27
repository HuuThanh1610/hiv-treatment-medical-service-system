package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVMedicationForProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.mapper.ARVProtocolMedicationMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.mapper.impl.ARVProtocolMedicationMapperImpl;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.service.ARVProtocolMedicationService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVProtocolMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVProtocolRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ARVProtocolMedicationImpl  implements ARVProtocolMedicationService{
    private final ARVProtocolRepository protocolRepo;
    private final ARVMedicationRepository medicationRepo;
    private final ARVProtocolMedicationRepository arvProtocolMedicationRepo;
    private final ARVProtocolMedicationMapper arvProtocolMedicationMapper;

    @Override
    @Transactional
    public ARVProtocolDTO createARVProtocolWithMedications(ARVProtocolRequestDTO dto) {
        // Tạo phác đồ ARV
        ARVProtocol protocol = ARVProtocol.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .recommendation(dto.getRecommendation())
                .treatmentLevel(dto.getTreatmentLevel())
                .sideEffects(dto.getSideEffects())
                .contraindications(dto.getContraindications())
                .targetGroup(dto.getTargetGroup())
                .active(dto.getActive())
                .build();
        ARVProtocol protocolSaved = protocolRepo.save(protocol);

        // Thêm thuốc liên quan
        for (ARVProtocolMedicationDTO medDto : dto.getArvProtocolMedicationsDTO()) {
            ARVMedication medication = medicationRepo.findById(medDto.getMedicationId()).orElseThrow(() -> new EntityNotFoundException("Thuốc không tồn tại"));

            ARVProtocolMedication entity = ARVProtocolMedication.builder()
                    .id(new ARVProtocolMedicationId(protocolSaved.getId(), medication.getId()))
                    .arvProtocol(protocol)
                    .arvMedication(medication)
                    .dosage(medDto.getDosage())
                    .frequency(medDto.getFrequency())
                    .duration(medDto.getDuration())
                    .sideEffects(medDto.getSideEffects())
                    .note(medDto.getNote())
                    .build();

            arvProtocolMedicationRepo.save(entity);
        }

        return arvProtocolMedicationMapper.convertToDTO(protocol);
    }

    @Override
    @Transactional
    public ARVProtocolDTO updateARVProtocolWithMedications(Integer id, ARVProtocolRequestDTO dto) {
        // Tìm phác đồ ARV hiện có
        ARVProtocol protocol = protocolRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Phác đồ ARV không tồn tại"));
        // Cập nhật thông tin phác đồ
        protocol.setName(dto.getName());
        protocol.setDescription(dto.getDescription());
        protocol.setRecommendation(dto.getRecommendation());
        protocol.setTreatmentLevel(dto.getTreatmentLevel());
        protocol.setSideEffects(dto.getSideEffects());
        protocol.setContraindications(dto.getContraindications());
        protocol.setTargetGroup(dto.getTargetGroup());
        protocol.setActive(dto.getActive());
        protocolRepo.save(protocol);
        // Xóa các thuốc liên quan hiện tại
        arvProtocolMedicationRepo.deleteByArvProtocolId(id);

        // Thêm hoặc cập nhật thuốc liên quan
        for (ARVProtocolMedicationDTO medDto : dto.getArvProtocolMedicationsDTO()) {
            ARVMedication medication = medicationRepo.findById(medDto.getMedicationId())
                    .orElseThrow(() -> new EntityNotFoundException("Thuốc không tồn tại"));

            ARVProtocolMedication entity = ARVProtocolMedication.builder()
                    .id(new ARVProtocolMedicationId(protocol.getId(), medication.getId()))
                    .arvProtocol(protocol)
                    .arvMedication(medication)
                    .dosage(medDto.getDosage())
                    .frequency(medDto.getFrequency())
                    .duration(medDto.getDuration())
                    .sideEffects(medDto.getSideEffects())
                    .note(medDto.getNote())
                    .build();

            arvProtocolMedicationRepo.save(entity);
        }

        return arvProtocolMedicationMapper.convertToDTO(protocol);
    }

    @Override
    public List<ARVMedicationForProtocolDTO> getARVMedicationForProtocol(Integer protocolId) {
        return arvProtocolMedicationRepo.findAllByProtocolId(protocolId).stream()
                .map(arvProtocolMedicationMapper::convertToMedicationForProtocolDTO)
                .collect(Collectors.toList());
    }


}
