package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.ARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.CreateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.UpdateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.mapper.ARVMedicationMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.service.ARVMedicationService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVMedicationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ARVMedicationServiceImpl implements ARVMedicationService {

    @Autowired
    private ARVMedicationRepository repository;

    @Autowired
    private ARVMedicationMapper mapper;

    @Override
    public List<ARVMedicationDTO> getAll() {
        return repository.findAll().stream()
                .map(mapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ARVMedicationDTO getById(Integer id) {
        ARVMedication arvMedication = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ARV medication không tồn tại"));
        return mapper.convertToDTO(arvMedication);
    }

    @Override
    public ARVMedicationDTO create(CreateARVMedicationDTO dto) {
        ARVMedication entity = mapper.convertToEntity(dto);
        ARVMedication saved = repository.save(entity);
        return mapper.convertToDTO(saved);
    }

    @Override
    public ARVMedicationDTO update(Integer id, UpdateARVMedicationDTO dto) {
        ARVMedication existing = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ARV medication không tồn tại"));
        
        ARVMedication updated = mapper.convertToEntity(dto, existing);
        ARVMedication saved = repository.save(updated);
        return mapper.convertToDTO(saved);
    }

    @Override
    public void delete(Integer id) {
        ARVMedication existing = repository.findById(id).orElseThrow(() -> new EntityNotFoundException("ARV medication không tồn tại"));
        existing.setActive(false);
        repository.save(existing);
    }

    @Override
    public List<ARVMedicationDTO> getAllARVMedicationsIsActive() {
        return repository.findByActiveTrue().stream()
                .map(mapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ARVMedicationDTO getARVMedicationIsActive(Integer id) {
        ARVMedication arvMedication = repository.findById(id)
                .filter(ARVMedication::getActive)
                .orElseThrow(() -> new EntityNotFoundException("ARV medication không tồn tại"));
        return mapper.convertToDTO(arvMedication);
    }

    @Override
    public void reactivateARVMedication(Integer id) {
        ARVMedication arvMedication = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ARV medication không tồn tại"));
        arvMedication.setActive(true);
        repository.save(arvMedication);
    }
}