package com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.PatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.CreatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.UpdatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.mapper.PatientTreatmentPlanMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.mapper.PrescriptionMedicationMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class PatientTreatmentPlanMapperImpl implements PatientTreatmentPlanMapper {
    @Autowired
    private ARVProtocolRepository arvProtocolRepository;

    @Autowired
    private LabRequestRepository labRequestRepository;

    @Autowired
    private PatientsRepository patientsRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private PrescriptionMedicationRepository prescriptionMedicationRepository;

    @Autowired
    private PrescriptionMedicationMapper prescriptionMedicationMapper;

    @Autowired
    MedicalServicesRepository treatmentPlanRepository;

    @Autowired
    MedicalServicesRepository medicationRepository;
    @Override
    public PatientTreatmentPlanDTO toDTO(PatientTreatmentPlan entity) {
        if (entity == null) {
            return null;
        }
        
        // Get patient info
        Patients patient = entity.getPatient();
        String patientFullName = (patient != null && patient.getUser() != null) ? patient.getUser().getFullName() : null;
        
        // Get doctor info
        Doctor doctor = entity.getDoctor();
        String doctorFullName = (doctor != null && doctor.getUser() != null) ? doctor.getUser().getFullName() : null;
        
        // Get ARV protocol name
        String arvProtocolName = (entity.getArvProtocol() != null) ? entity.getArvProtocol().getName() : null;
        
        // Get prescription medications
        List<PrescriptionMedicationDTO> medicationList = new ArrayList<>();
        try {
            System.out.println("Fetching medications for treatment plan ID: " + entity.getId());
            List<PrescriptionMedication> medications = prescriptionMedicationRepository.findByTreatmentPlanIdAndActiveTrue(entity.getId());
            System.out.println("Found " + medications.size() + " medications for treatment plan " + entity.getId());
            medicationList = medications.stream()
                    .map(prescriptionMedicationMapper::convertToDTO)
                    .collect(Collectors.toList());
            System.out.println("Converted to " + medicationList.size() + " DTOs");
        } catch (Exception e) {
            // Log the error and return empty list
            System.err.println("Error fetching medications for treatment plan " + entity.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        return PatientTreatmentPlanDTO.builder()
                .id(entity.getId())
                .patientId(entity.getPatient() != null ? entity.getPatient().getId() : null)
                .doctorId(entity.getDoctor() != null ? entity.getDoctor().getId() : null)
                .patientName(patientFullName)
                .doctorName(doctorFullName)
                .arvProtocolName(arvProtocolName)
                .prescriptionMedicationDTOList(medicationList)
                .startDate(entity.getStartDate())
                .notes(entity.getNotes())
                .active(entity.getActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    @Override
    public PatientTreatmentPlan toEntity(CreatePatientTreatmentPlanDTO dto) {
        if (dto == null) {
            return null;
        }

        PatientTreatmentPlan entity = new PatientTreatmentPlan();
        
        // Validate and set patient
        Patients patient = patientsRepository.findById(dto.getPatientId())
            .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + dto.getPatientId()));
        entity.setPatient(patient);
        
        // Validate and set doctor
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
            .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
        entity.setDoctor(doctor);
        
        // Validate and set ARV protocol
        ARVProtocol arvProtocol = arvProtocolRepository.findById(dto.getArvProtocolId())
            .orElseThrow(() -> new EntityNotFoundException("ARV Protocol not found with ID: " + dto.getArvProtocolId()));
        entity.setArvProtocol(arvProtocol);
        
        if (dto.getStartDate() == null) {
            entity.setStartDate(LocalDate.now());
        } else {
            entity.setStartDate(dto.getStartDate());
        }
        entity.setNotes(dto.getNotes());
        return entity;
    }

}