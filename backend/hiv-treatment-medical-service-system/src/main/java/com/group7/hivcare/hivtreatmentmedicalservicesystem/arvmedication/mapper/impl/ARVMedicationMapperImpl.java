package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.ARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.CreateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto.UpdateARVMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.mapper.ARVMedicationMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVMedication;

import org.springframework.stereotype.Component;

@Component
public class ARVMedicationMapperImpl implements ARVMedicationMapper {

    @Override
    public ARVMedicationDTO convertToDTO(ARVMedication entity) {
        if (entity == null) {
            return null;
        }

        ARVMedicationDTO dto = new ARVMedicationDTO();
        dto.setId(entity.getId());
        dto.setCode(entity.getCode());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setDrugClass(entity.getDrugClass());
        dto.setForm(entity.getForm());
        dto.setStrength(entity.getStrength());
        dto.setManufacturer(entity.getManufacturer());
        dto.setActive(entity.getActive());
        return dto;
    }

    @Override
    public ARVMedication convertToEntity(CreateARVMedicationDTO dto) {
        if (dto == null) {
            return null;
        }

        ARVMedication entity = new ARVMedication();
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setDrugClass(dto.getDrugClass());
        entity.setForm(dto.getForm());
        entity.setStrength(dto.getStrength());
        entity.setManufacturer(dto.getManufacturer());
        return entity;
    }

    @Override
    public ARVMedication convertToEntity(UpdateARVMedicationDTO dto, ARVMedication existingEntity) {
        if (dto == null || existingEntity == null) {
            return existingEntity;
        }

        if (dto.getCode() != null) {
            existingEntity.setCode(dto.getCode());
        }
        if (dto.getName() != null) {
            existingEntity.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            existingEntity.setDescription(dto.getDescription());
        }
        if (dto.getForm() != null) {
            existingEntity.setForm(dto.getForm());
        }

        if (dto.getDrugClass() != null) {
            existingEntity.setDrugClass(dto.getDrugClass());
        }

        if (dto.getStrength() != null) {
            existingEntity.setStrength(dto.getStrength());
        }
        if (dto.getManufacturer() != null) {
            existingEntity.setManufacturer(dto.getManufacturer());
        }
        if (dto.getActive() != null) {
            existingEntity.setActive(dto.getActive());
        }

        return existingEntity;
    }
}