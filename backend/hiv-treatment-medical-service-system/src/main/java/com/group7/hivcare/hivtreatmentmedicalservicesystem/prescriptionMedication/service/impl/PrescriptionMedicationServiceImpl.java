package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientTreatmentPlanRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PrescriptionMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PrescriptionRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.mapper.PrescriptionMedicationMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.service.PrescriptionMedicationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PrescriptionMedicationServiceImpl implements PrescriptionMedicationService {
    @Autowired
    private PatientTreatmentPlanRepository patientTreatmentPlanRepository;

    @Autowired
    private PrescriptionRepository prescriptionRepository;

    @Autowired
    private ARVMedicationRepository arvMedicationRepository;

    @Autowired
    private PrescriptionMedicationRepository prescriptionMedicationRepository;

    @Autowired
    private PrescriptionMedicationMapper prescriptionMedicationMapper;

    @Override
    public List<PrescriptionMedicationDTO> createPrescriptionWithMedications(PrescriptionRequestDTO dto) {
        //Tìm kế hoạch điều trị
        PatientTreatmentPlan treatmentPlan = patientTreatmentPlanRepository.findById(dto.getTreatmentPlanId())
            .orElseThrow(() -> new EntityNotFoundException("Kế hoạch điều trị không tồn tại với ID: " + dto.getTreatmentPlanId()));
            
        //Tạo đơn thuốc
        Prescription prescription = Prescription.builder()
                .treatmentPlan(treatmentPlan)
                .active(true)
                .build();
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Thêm thuốc cho đơn thuốc
        List<PrescriptionMedication> medications = new ArrayList<>();
        for(PrescriptionMedicationDTO preDto : dto.getPrescriptionMedicationDTOList()) {
            ARVMedication medication = arvMedicationRepository.findById(preDto.getMedicationId())
                .orElseThrow(() -> new EntityNotFoundException("Thuốc không tồn tại với ID: " + preDto.getMedicationId()));
                
            PrescriptionMedication preMed = PrescriptionMedication.builder()
                    .id(new PrescriptionMedicationId(savedPrescription.getId(), medication.getId()))
                    .prescription(savedPrescription)
                    .arvMedication(medication)
                    .dosage(preDto.getDosage())
                    .frequency(preDto.getFrequency())
                    .durationDays(preDto.getDurationDays())
                    .notes(preDto.getNotes())
                    .build();
            medications.add(preMed);
        }
        
        // Save all medications at once
        prescriptionMedicationRepository.saveAll(medications);

        return prescriptionMedicationRepository.findAllByPrescriptionId(savedPrescription.getId()).stream()
                .map(prescriptionMedicationMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionMedicationDTO> createPrescriptionWithMedications(Integer treatmentPlanId, PrescriptionRequestDTO dto) {
        //Tìm kế hoạch điều trị
        PatientTreatmentPlan treatmentPlan = patientTreatmentPlanRepository.findById(treatmentPlanId)
            .orElseThrow(() -> new EntityNotFoundException("Kế hoạch điều trị không tồn tại với ID: " + treatmentPlanId));
            
        //Tạo đơn thuốc
        Prescription prescription = Prescription.builder()
                .treatmentPlan(treatmentPlan)
                .active(true)
                .build();
        Prescription savedPrescription = prescriptionRepository.save(prescription);

        // Thêm thuốc cho đơn thuốc
        List<PrescriptionMedication> medications = new ArrayList<>();
        for(PrescriptionMedicationDTO preDto : dto.getPrescriptionMedicationDTOList()) {
            ARVMedication medication = arvMedicationRepository.findById(preDto.getMedicationId())
                .orElseThrow(() -> new EntityNotFoundException("Thuốc không tồn tại với ID: " + preDto.getMedicationId()));
                
            PrescriptionMedication preMed = PrescriptionMedication.builder()
                    .id(new PrescriptionMedicationId(savedPrescription.getId(), medication.getId()))
                    .prescription(savedPrescription)
                    .arvMedication(medication)
                    .dosage(preDto.getDosage())
                    .frequency(preDto.getFrequency())
                    .durationDays(preDto.getDurationDays())
                    .notes(preDto.getNotes())
                    .build();
            medications.add(preMed);
        }
        
        // Save all medications at once
        prescriptionMedicationRepository.saveAll(medications);

        return prescriptionMedicationRepository.findAllByPrescriptionId(savedPrescription.getId()).stream()
                .map(prescriptionMedicationMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionMedicationDTO> getPrescriptionWithMedications(Integer prescriptionId) {
        return prescriptionMedicationRepository.findAllByPrescriptionId(prescriptionId).stream()
                .map(prescriptionMedicationMapper::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PrescriptionMedicationDTO> getMedicationsByTreatmentPlanId(Integer treatmentPlanId) {
        System.out.println("🔍 Getting medications for treatment plan ID: " + treatmentPlanId);
        
        List<PrescriptionMedication> medications = prescriptionMedicationRepository.findByTreatmentPlanIdAndActiveTrue(treatmentPlanId);
        System.out.println("📊 Found " + medications.size() + " prescription medications for treatment plan " + treatmentPlanId);
        
        if (medications.isEmpty()) {
            System.out.println("⚠️ No prescription medications found. Possible reasons:");
            System.out.println("  - No prescriptions created for this treatment plan");
            System.out.println("  - All prescriptions are inactive");
            System.out.println("  - Treatment plan ID does not exist");
        } else {
            System.out.println("✅ Found medications:");
            for (int i = 0; i < medications.size(); i++) {
                PrescriptionMedication med = medications.get(i);
                System.out.println("  " + (i+1) + ". " + med.getArvMedication().getName() + 
                                 " - " + med.getDosage() + " - " + med.getFrequency());
            }
        }
        
        List<PrescriptionMedicationDTO> result = medications.stream()
                .map(prescriptionMedicationMapper::convertToDTO)
                .collect(Collectors.toList());
        
        System.out.println("🎯 Returning " + result.size() + " DTOs to frontend");
        return result;
    }


}
