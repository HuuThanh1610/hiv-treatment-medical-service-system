package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.mapper.AppointmentDeclarationMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentDeclaration;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AppointmentDeclarationMapperImpl implements AppointmentDeclarationMapper {
    
    @Autowired
    private PatientsRepository patientsRepository;
    
    @Autowired
    private DoctorRepository doctorRepository;
    
    @Autowired
    private AppointmentRepository appointmentRepository;
    
    @Override
    public AppointmentDeclarationDTO toDTO(AppointmentDeclaration entity) {
        if (entity == null) {
            return null;
        }
        
        return AppointmentDeclarationDTO.builder()
                .appointmentId(entity.getAppointment().getId())
                .isPregnant(entity.isPregnant())
                .healthNotes(entity.getHealthNotes())
                .symptoms(entity.getSymptoms())
                .currentMedications(entity.getCurrentMedications())
                .allergies(entity.getAllergies())
                .emergencyContact(entity.getEmergencyContact())
                .emergencyPhone(entity.getEmergencyPhone())
                .build();
    }
    
    @Override
    public AppointmentDeclaration toEntity(AppointmentDeclarationDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return AppointmentDeclaration.builder()
                .appointment(appointmentRepository.findById(dto.getAppointmentId())
                        .orElseThrow(() -> new EntityNotFoundException("Appointment not found")))
                .isPregnant(dto.isPregnant())
                .healthNotes(dto.getHealthNotes())
                .symptoms(dto.getSymptoms())
                .currentMedications(dto.getCurrentMedications())
                .allergies(dto.getAllergies())
                .emergencyContact(dto.getEmergencyContact())
                .emergencyPhone(dto.getEmergencyPhone())
                .build();
    }
    
    @Override
    public List<AppointmentDeclarationDTO> toDTOList(List<AppointmentDeclaration> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
} 