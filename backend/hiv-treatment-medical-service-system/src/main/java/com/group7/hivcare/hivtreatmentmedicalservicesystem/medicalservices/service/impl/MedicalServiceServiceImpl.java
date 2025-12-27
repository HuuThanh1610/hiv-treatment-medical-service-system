package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.MedicalServices;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.MedicalServicesRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.CreateMedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.MedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.UpdateMedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.service.MedicalServiceService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalServiceServiceImpl implements MedicalServiceService {

    @Autowired
    private MedicalServicesRepository medicalServicesRepository;

    @Override
    public List<MedicalServiceDTO> getAllMedicalServices() {
        return medicalServicesRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MedicalServiceDTO getMedicalServiceById(Integer id) {
        MedicalServices medicalService = medicalServicesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medical service not found"));
        return convertToDTO(medicalService);
    }

    @Override
    public MedicalServiceDTO createMedicalService(CreateMedicalServiceDTO dto) {
        MedicalServices medicalService = new MedicalServices();
        medicalService.setName(dto.getName());
        medicalService.setDescription(dto.getDescription());
        medicalService.setDefaultDuration(dto.getDefaultDuration());
        medicalService.setPrice(dto.getPrice());
        MedicalServices savedMedicalService = medicalServicesRepository.save(medicalService);
        return convertToDTO(savedMedicalService);
    }

    @Override
    public MedicalServiceDTO updateMedicalService(Integer id, UpdateMedicalServiceDTO dto) {
        MedicalServices medicalService = medicalServicesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dịch vụ y tế không tồn tại"));
        medicalService.setName(dto.getName());
        medicalService.setDescription(dto.getDescription());
        medicalService.setDefaultDuration(dto.getDefaultDuration());
        medicalService.setPrice(dto.getPrice());
        MedicalServices savedMedicalService = medicalServicesRepository.save(medicalService);
        return convertToDTO(savedMedicalService);
    }

    @Override
    public void deleteMedicalService(Integer id) {
        MedicalServices medicalService = medicalServicesRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Dịch vụ y tế không tồn tại"));
        medicalServicesRepository.delete(medicalService);
    }

    private MedicalServiceDTO convertToDTO(MedicalServices medicalService) {
        MedicalServiceDTO dto = new MedicalServiceDTO();
        dto.setId(medicalService.getId());
        dto.setName(medicalService.getName());
        dto.setDescription(medicalService.getDescription());
        dto.setDefaultDuration(medicalService.getDefaultDuration());
        dto.setPrice(medicalService.getPrice());
        return dto;
    }

} 