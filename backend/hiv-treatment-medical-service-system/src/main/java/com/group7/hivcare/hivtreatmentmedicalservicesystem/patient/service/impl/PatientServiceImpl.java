package com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.service.PatientService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.mapper.PatientMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientServiceImpl implements PatientService {
    @Autowired
    private PatientsRepository patientRepository;

    @Autowired
    private PatientMapper patientMapper;

    @Autowired
    private UserRepository userRepository;

    @Override
    public PatientDTO getCurrentPatient(String email) {
        Patients patient = patientRepository.findByUserEmail(email);
        if (patient == null) {
            throw new RuntimeException("Patient not found");
        }
        return patientMapper.toDTO(patient);
    }

    @Override
    public PatientDTO updateCurrentPatient(String email, PatientUpdateDTO dto) {
        Patients patient = patientRepository.findByUserEmail(email);
        if (patient == null) {
            throw new RuntimeException("Patient not found");
        }
        patientMapper.updateEntity(patient, dto);
        patientRepository.save(patient);
        return patientMapper.toDTO(patient);
    }

    @Override
    public PatientDTO updatePregnancyStatus(String email, Boolean isPregnant) {
        Patients patient = patientRepository.findByUserEmail(email);
        if (patient == null) {
            throw new RuntimeException("Patient not found");
        }
        patient.setIsPregnant(isPregnant);
        patientRepository.save(patient);
        return patientMapper.toDTO(patient);
    }

    @Override
    public PatientDTO getPatientById(Integer id) {
        Patients patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));

        // Kiểm tra quyền của người gọi
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isDoctor = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
        boolean isStaff = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));

        // Admin luôn xem được thông tin thật
        // Bác sĩ và nhân viên chỉ xem được thông tin thật nếu bệnh nhân không ẩn danh
        boolean canViewRealInfo = isAdmin || ((isDoctor || isStaff) && !Boolean.TRUE.equals(patient.getUser().getAnonymous()));

        return ((com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.mapper.impl.PatientMapperImpl) patientMapper).toDTO(patient, canViewRealInfo);
    }

    @Override
    public List<PatientDTO> getAllPatients() {
        List<Patients> patients = patientRepository.findAll();

        // Kiểm tra xem người gọi có phải admin không
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return patients.stream()
                .map(patient -> ((com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.mapper.impl.PatientMapperImpl) patientMapper).toDTO(patient, isAdmin))
                .collect(Collectors.toList());
    }

    @Override
    public void deactivatePatient(Integer id) {
        Patients patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));
        patient.getUser().setActive(false);
        patientRepository.save(patient);
    }

    @Override
    public PatientDTO createPatient(PatientCreateDTO dto) {
        Patients patient = patientMapper.fromCreateDTO(dto);
        // Lưu user trước
        User user = patient.getUser();
        user = userRepository.save(user);
        patient.setUser(user);
        patientRepository.save(patient);
        return patientMapper.toDTO(patient);
    }

    @Override
    public PatientDTO updatePatient(Integer id, PatientUpdateDTO dto) {
        Patients patient = patientRepository.findById(id).orElseThrow(() -> new RuntimeException("Patient not found"));
        patientMapper.updateEntity(patient, dto);
        patientRepository.save(patient);
        return patientMapper.toDTO(patient);
    }
}