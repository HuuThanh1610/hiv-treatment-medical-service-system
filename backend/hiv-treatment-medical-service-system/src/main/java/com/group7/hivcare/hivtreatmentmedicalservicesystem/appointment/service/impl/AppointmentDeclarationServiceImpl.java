package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.CreateAppointmentWithDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentWithDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.mapper.AppointmentDeclarationMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service.AppointmentDeclarationService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentDeclaration;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentDeclarationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.MedicalServicesRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.MedicalServices;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentDeclarationServiceImpl implements AppointmentDeclarationService {

    private final AppointmentDeclarationRepository declarationRepository;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalServicesRepository medicalServicesRepository;
    private final PatientsRepository patientsRepository;
    private final AppointmentDeclarationMapper mapper;

    @Override
    @Transactional
    public AppointmentWithDeclarationDTO createAppointmentWithDeclaration(CreateAppointmentWithDeclarationDTO request) {
        // 1. Tạo appointment trước
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        MedicalServices medicalService = medicalServicesRepository.findById(request.getMedicalServiceId())
                .orElseThrow(() -> new RuntimeException("Medical service not found"));
        Patients patient = patientsRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .medicalService(medicalService)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status("PENDING")
                .notes(request.getNotes())
                .build();
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // 2. Tạo appointment declaration
        System.out.println("=== DEBUG: Creating declaration ===");
        System.out.println("Request HealthNotes: '" + request.getHealthNotes() + "'");
        System.out.println("Request Symptoms: '" + request.getSymptoms() + "'");
        System.out.println("Request CurrentMedications: '" + request.getCurrentMedications() + "'");
        System.out.println("Request Allergies: '" + request.getAllergies() + "'");
        System.out.println("Request EmergencyContact: '" + request.getEmergencyContact() + "'");
        System.out.println("Request EmergencyPhone: '" + request.getEmergencyPhone() + "'");
        
        AppointmentDeclaration declaration = AppointmentDeclaration.builder()
                .appointment(savedAppointment)
                .isPregnant(request.isPregnant())
                .healthNotes(request.getHealthNotes())
                .symptoms(request.getSymptoms())
                .currentMedications(request.getCurrentMedications())
                .allergies(request.getAllergies())
                .emergencyContact(request.getEmergencyContact())
                .emergencyPhone(request.getEmergencyPhone())
                .build();
        
        System.out.println("=== DEBUG: Declaration before save ===");
        System.out.println("Declaration HealthNotes: '" + declaration.getHealthNotes() + "'");
        System.out.println("Declaration Symptoms: '" + declaration.getSymptoms() + "'");
        System.out.println("Declaration CurrentMedications: '" + declaration.getCurrentMedications() + "'");
        System.out.println("Declaration Allergies: '" + declaration.getAllergies() + "'");
        System.out.println("Declaration EmergencyContact: '" + declaration.getEmergencyContact() + "'");
        System.out.println("Declaration EmergencyPhone: '" + declaration.getEmergencyPhone() + "'");
        
        AppointmentDeclaration savedDeclaration = declarationRepository.save(declaration);
        

        
        // 3. Trả về kết quả
        return AppointmentWithDeclarationDTO.builder()
                .appointmentId(savedAppointment.getId())
                .patientId(savedAppointment.getPatient().getId())
                .patientName(savedAppointment.getPatient().getUser().getFullName())
                .doctorId(savedAppointment.getDoctor().getId())
                .doctorName(savedAppointment.getDoctor().getUser().getFullName())
                .medicalServiceId(savedAppointment.getMedicalService().getId())
                .medicalServiceName(savedAppointment.getMedicalService().getName())
                .appointmentDate(savedAppointment.getAppointmentDate())
                .appointmentTime(savedAppointment.getAppointmentTime())
                .status(savedAppointment.getStatus())
                .notes(savedAppointment.getNotes())
                .declarationId(savedDeclaration.getId())
                .isPregnant(savedDeclaration.isPregnant())
                .healthNotes(savedDeclaration.getHealthNotes())
                .symptoms(savedDeclaration.getSymptoms())
                .currentMedications(savedDeclaration.getCurrentMedications())
                .allergies(savedDeclaration.getAllergies())
                .emergencyContact(savedDeclaration.getEmergencyContact())
                .emergencyPhone(savedDeclaration.getEmergencyPhone())
                .build();
    }

    @Override
    @Transactional
    public AppointmentDeclarationDTO createDeclaration(AppointmentDeclarationDTO dto) {
        // Kiểm tra xem đã có khai báo cho appointment này chưa
        declarationRepository.findByAppointmentId(dto.getAppointmentId())
                .ifPresent(existing -> {
                    throw new RuntimeException("Đã có khai báo cho lịch hẹn này");
                });
        
        AppointmentDeclaration entity = mapper.toEntity(dto);
        AppointmentDeclaration saved = declarationRepository.save(entity);
        return mapper.toDTO(saved);
    }

    @Override
    @Transactional
    public AppointmentDeclarationDTO updateDeclaration(Integer id, AppointmentDeclarationDTO dto) {
        AppointmentDeclaration existing = declarationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khai báo không tồn tại"));
        
        // Cập nhật thông tin
        existing.setPregnant(dto.isPregnant());
        existing.setHealthNotes(dto.getHealthNotes());
        existing.setSymptoms(dto.getSymptoms());
        existing.setCurrentMedications(dto.getCurrentMedications());
        existing.setAllergies(dto.getAllergies());
        existing.setEmergencyContact(dto.getEmergencyContact());
        existing.setEmergencyPhone(dto.getEmergencyPhone());
        
        AppointmentDeclaration saved = declarationRepository.save(existing);
        return mapper.toDTO(saved);
    }

    @Override
    public AppointmentDeclarationDTO getById(Integer id) {
        AppointmentDeclaration entity = declarationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khai báo không tồn tại"));
        return mapper.toDTO(entity);
    }

    @Override
    public AppointmentDeclarationDTO getByAppointmentId(Integer appointmentId) {
        AppointmentDeclaration entity = declarationRepository.findByAppointmentId(appointmentId)
                .orElse(null);
        return entity != null ? mapper.toDTO(entity) : null;
    }

    @Override
    public List<AppointmentDeclarationDTO> getByPatientId(Integer patientId) {
        List<AppointmentDeclaration> entities = declarationRepository.findByPatientIdOrderByAppointmentDateDesc(patientId);
        return mapper.toDTOList(entities);
    }

    @Override
    public List<AppointmentDeclarationDTO> getByDoctorId(Integer doctorId) {
        List<AppointmentDeclaration> entities = declarationRepository.findByDoctorIdOrderByAppointmentDateDesc(doctorId);
        return mapper.toDTOList(entities);
    }

    @Override
    public boolean isPatientPregnant(Integer patientId, LocalDate appointmentDate) {
        return declarationRepository.findPregnantStatusByPatientAndDate(patientId, appointmentDate)
                .orElse(false);
    }

    @Override
    public List<AppointmentDeclarationDTO> getPregnantPatientsByDateRange(LocalDate startDate, LocalDate endDate) {
        List<AppointmentDeclaration> entities = declarationRepository.findPregnantPatientsByDateRange(startDate, endDate);
        return mapper.toDTOList(entities);
    }

    @Override
    @Transactional
    public void deleteDeclaration(Integer id) {
        if (!declarationRepository.existsById(id)) {
            throw new RuntimeException("Khai báo không tồn tại");
        }
        declarationRepository.deleteById(id);
    }
} 