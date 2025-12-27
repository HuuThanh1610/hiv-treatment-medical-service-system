package com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.LabTestType;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.LabTestTypeRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.dto.LabTestTypeDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.service.LabTestTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabTestTypeServiceImpl implements LabTestTypeService {

    private final LabTestTypeRepository repository;

    private LabTestTypeDTO toDTO(LabTestType entity) {
        LabTestTypeDTO dto = new LabTestTypeDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setPrice(entity.getPrice());
        dto.setNormalRange(entity.getNormalRange());
        dto.setUnit(entity.getUnit());
        return dto;
    }

    private LabTestType toEntity(LabTestTypeDTO dto) {
        return LabTestType.builder()
                .id(dto.getId() != null ? dto.getId() : 0)
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .normalRange(dto.getNormalRange())
                .unit(dto.getUnit())
                .build();
    }

    @Override
    public LabTestTypeDTO create(LabTestTypeDTO dto) {
        LabTestType entity = toEntity(dto);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return toDTO(repository.save(entity));
    }

    @Override
    public List<LabTestTypeDTO> getAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public LabTestTypeDTO getById(Integer id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public LabTestTypeDTO update(Integer id, LabTestTypeDTO dto) {
        LabTestType existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab Test Type not found with ID: " + id));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setUpdatedAt(LocalDateTime.now());
        return toDTO(repository.save(existing));
    }

    @Override
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    @Override
    public LabTestTypeDTO updatePrice(Integer id, double price) {
        LabTestType existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab Test Type not found with ID: " + id));
        existing.setPrice(price);
        existing.setUpdatedAt(LocalDateTime.now());
        return toDTO(repository.save(existing));
    }
}
