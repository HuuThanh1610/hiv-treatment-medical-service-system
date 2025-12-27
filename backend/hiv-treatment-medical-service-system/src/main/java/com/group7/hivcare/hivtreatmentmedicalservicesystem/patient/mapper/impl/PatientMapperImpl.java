package com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientCreateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.mapper.PatientMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.RoleRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PatientMapperImpl implements PatientMapper {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public PatientDTO toDTO(Patients patient) {
        return toDTO(patient, false);
    }

    public PatientDTO toDTO(Patients patient, boolean isAdminView) {
        if (patient == null)
            return null;
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        if (patient.getUser() != null) {
            // Nếu là admin view hoặc user không ẩn danh, hiển thị thông tin thật
            if (isAdminView || !Boolean.TRUE.equals(patient.getUser().getAnonymous())) {
                dto.setFullName(patient.getUser().getFullName());
                dto.setEmail(patient.getUser().getEmail());
                dto.setPhoneNumber(patient.getUser().getPhoneNumber());
                dto.setAddress(patient.getUser().getAddress());
            } else {
                dto.setFullName("Bệnh nhân Ẩn danh");
                dto.setEmail("Ẩn");
                dto.setPhoneNumber("Ẩn");
                dto.setAddress("Ẩn");
            }
            dto.setDateOfBirth(patient.getUser().getBirthday());
            dto.setGender(patient.getUser().getGender());
        }
        dto.setMedicalRecordNumber(patient.getMedicalRecordNumber());
        dto.setPregnant(patient.isPregnant());
        dto.setIsPregnant(patient.getIsPregnant());
        return dto;
    }

    @Override
    public Patients fromCreateDTO(PatientCreateDTO dto) {
        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setRole(
                roleRepository.findByName(dto.getRole()).orElseThrow(() -> new RuntimeException("Role not found")));
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setGender(dto.getGender());
        user.setBirthday(dto.getDateOfBirth());
        user.setAddress(dto.getAddress());
        Patients patient = new Patients();
        patient.setMedicalRecordNumber(dto.getMedicalRecordNumber());
        patient.setUser(user);
        return patient;
    }

    @Override
    public void updateEntity(Patients patient, PatientUpdateDTO dto) {
        if (patient.getUser() != null) {
            patient.getUser().setFullName(dto.getFullName());
            patient.getUser().setPhoneNumber(dto.getPhoneNumber());
            patient.getUser().setGender(dto.getGender());
            patient.getUser().setAddress(dto.getAddress());
            patient.getUser().setBirthday(dto.getDateOfBirth());
        }
        patient.setMedicalRecordNumber(dto.getMedicalRecordNumber());
        if (dto.getPregnant() != null) {
            patient.setPregnant(dto.getPregnant());
        }
        if (dto.getIsPregnant() != null) {
            patient.setIsPregnant(dto.getIsPregnant());
        }
    }
}