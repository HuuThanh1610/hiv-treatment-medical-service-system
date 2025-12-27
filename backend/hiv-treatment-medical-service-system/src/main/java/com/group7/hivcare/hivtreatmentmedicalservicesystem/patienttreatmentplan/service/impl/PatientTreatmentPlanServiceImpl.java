package com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.PatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.CreatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.UpdatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.mapper.PatientTreatmentPlanMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.service.PatientTreatmentPlanService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.mapper.PrescriptionMedicationMapper;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PatientTreatmentPlanServiceImpl implements PatientTreatmentPlanService {

    private final PatientTreatmentPlanRepository treatmentPlanRepository;
    private final TreatmentHistoryRepository historyRepository;
    private final PatientTreatmentPlanMapper mapper;
    private final PatientsRepository patientsRepository;
    private final DoctorRepository doctorRepository;
    private final ARVProtocolRepository arvProtocolRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionHistoryRepository priscriptionHistoryRepository;
    private final ARVMedicationRepository medicationRepository;
    private final ARVMedicationRepository arvMedicationRepository;
    private final PrescriptionMedicationRepository prescriptionMedicationRepository;
    private final PrescriptionMedicationMapper prescriptionMedicationMapper;
    private final TreatmentReminderRepository treatmentReminderRepository;
    private final MedicationScheduleRepository medicationScheduleRepository;
    @Override
    public List<PatientTreatmentPlanDTO> getAll() {
        List<PatientTreatmentPlan> patientTreatmentPlans = treatmentPlanRepository.findAll();
        return patientTreatmentPlans.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }


    @Override
    public List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByPatientId(Integer patientId) {
        List<PatientTreatmentPlan> patientTreatmentPlans = treatmentPlanRepository
        .findByPatientId(patientId);
        return patientTreatmentPlans.stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByDoctorId(Integer doctorId) {
        return treatmentPlanRepository.findByDoctorId(doctorId).stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByPatientIdAndIsActive(Integer patientId) {
        List<PatientTreatmentPlan> plans = treatmentPlanRepository.findByPatientId(patientId);
        return plans.stream()
            .filter(PatientTreatmentPlan::getActive)
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }
    
    @Override
    public List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByDoctorIdAndIsActive(Integer doctorId) {
        List<PatientTreatmentPlan> plans = treatmentPlanRepository.findByDoctorId(doctorId);
        return plans.stream()
            .filter(PatientTreatmentPlan::getActive)
            .map(mapper::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public PatientTreatmentPlanDTO getById(Integer id) {
        PatientTreatmentPlan patientTreatmentPlan = treatmentPlanRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Patient treatment plan không tồn tại"));
        return mapper.toDTO(patientTreatmentPlan);
    }

    @Override
    @Transactional
    public PatientTreatmentPlanDTO create(CreatePatientTreatmentPlanDTO dto) {
        log.info("Creating treatment plan with data: patientId={}, doctorId={}, arvProtocolId={}", 
                 dto.getPatientId(), dto.getDoctorId(), dto.getArvProtocolId());
        
        try {
            // Validate inputs
            if (dto.getPatientId() == null) {
                throw new IllegalArgumentException("Patient ID cannot be null");
            }
            if (dto.getDoctorId() == null) {
                throw new IllegalArgumentException("Doctor ID cannot be null");  
            }
            if (dto.getArvProtocolId() == null) {
                throw new IllegalArgumentException("ARV Protocol ID cannot be null");
            }
            
            // Check if entities exist
            Patients patient = patientsRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new EntityNotFoundException("Patient not found with ID: " + dto.getPatientId()));
            
            Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + dto.getDoctorId()));
                
            ARVProtocol arvProtocol = arvProtocolRepository.findById(dto.getArvProtocolId())
                .orElseThrow(() -> new EntityNotFoundException("ARV Protocol not found with ID: " + dto.getArvProtocolId()));
            
            // Auto-deactivate all existing active treatment plans for this patient
            List<PatientTreatmentPlan> existingActivePlans = treatmentPlanRepository
                .findByPatientId(dto.getPatientId())
                .stream()
                .filter(PatientTreatmentPlan::getActive)
                .collect(Collectors.toList());
            
            if (!existingActivePlans.isEmpty()) {
                log.info("Deactivating {} existing active treatment plans for patient ID: {}", 
                        existingActivePlans.size(), dto.getPatientId());
                
                for (PatientTreatmentPlan existingPlan : existingActivePlans) {
                    existingPlan.setActive(false);
                    treatmentPlanRepository.save(existingPlan);
                    
                    // Also deactivate associated prescriptions
                    List<Prescription> activePrescriptions = prescriptionRepository
                        .findByTreatmentPlanIdAndActiveTrue(existingPlan.getId());
                    for (Prescription prescription : activePrescriptions) {
                        prescription.setActive(false);
                        prescriptionRepository.save(prescription);
                    }
                    
                    // Delete ALL medication reminders for this deactivated treatment plan
                    try {
                        // 1. Delete reminders directly linked to treatment plan
                        List<TreatmentReminder> directReminders = treatmentReminderRepository
                            .findByTreatmentPlanIdOrderByReminderDateDesc(existingPlan.getId());
                        List<TreatmentReminder> directMedicationReminders = directReminders.stream()
                            .filter(r -> "Medication".equals(r.getReminderType()))
                            .collect(Collectors.toList());
                        
                        if (!directMedicationReminders.isEmpty()) {
                            treatmentReminderRepository.deleteAll(directMedicationReminders);
                            log.info("Deleted {} direct medication reminders for auto-deactivated treatment plan {}", 
                                    directMedicationReminders.size(), existingPlan.getId());
                        }
                        
                        // 2. Delete reminders linked through medication schedules
                        List<MedicationSchedule> medicationSchedules = medicationScheduleRepository
                            .findByTreatmentPlanId(existingPlan.getId());
                        int totalScheduleRemindersDeleted = 0;
                        
                        for (MedicationSchedule schedule : medicationSchedules) {
                            List<TreatmentReminder> scheduleReminders = treatmentReminderRepository
                                .findByMedicationScheduleIdOrderByReminderDateDesc(schedule.getId());
                            
                            if (!scheduleReminders.isEmpty()) {
                                treatmentReminderRepository.deleteAll(scheduleReminders);
                                totalScheduleRemindersDeleted += scheduleReminders.size();
                            }
                        }
                        
                        if (totalScheduleRemindersDeleted > 0) {
                            log.info("Deleted {} medication schedule reminders for auto-deactivated treatment plan {}", 
                                    totalScheduleRemindersDeleted, existingPlan.getId());
                        }
                        
                        log.info("Total auto-deleted: {} reminders for treatment plan {}", 
                            directMedicationReminders.size() + totalScheduleRemindersDeleted, existingPlan.getId());
                            
                    } catch (Exception e) {
                        log.warn("Failed to delete treatment reminders for treatment plan {}: {}", 
                                existingPlan.getId(), e.getMessage());
                    }
                }
                log.info("Successfully deactivated existing treatment plans");
            }
            
            // Create treatment plan entity
            PatientTreatmentPlan entity = PatientTreatmentPlan.builder()
                .patient(patient)
                .doctor(doctor)
                .arvProtocol(arvProtocol)
                .startDate(dto.getStartDate() != null ? dto.getStartDate() : LocalDate.now())
                .notes(dto.getNotes())
                .active(true)
                .build();
            
            log.info("Entity created successfully");
            
            // Save treatment plan
            PatientTreatmentPlan saved = treatmentPlanRepository.save(entity);
            log.info("Treatment plan saved with ID: {}", saved.getId());
            
            // Create prescription with medications if provided
            List<PrescriptionMedicationDTO> medicationList = new ArrayList<>();
            if (dto.getMedications() != null && !dto.getMedications().isEmpty()) {
                log.info("Creating prescription with {} medications", dto.getMedications().size());
                
                // Create prescription
                Prescription prescription = Prescription.builder()
                    .treatmentPlan(saved)
                    .active(true)
                    .build();
                Prescription savedPrescription = prescriptionRepository.save(prescription);
                
                // Create prescription medications
                List<PrescriptionMedication> prescriptionMedications = new ArrayList<>();
                for (PrescriptionMedicationDTO medDto : dto.getMedications()) {
                    ARVMedication medication = arvMedicationRepository.findById(medDto.getMedicationId())
                        .orElseThrow(() -> new EntityNotFoundException("Medication not found with ID: " + medDto.getMedicationId()));
                    
                    PrescriptionMedication preMed = PrescriptionMedication.builder()
                        .id(new PrescriptionMedicationId(savedPrescription.getId(), medication.getId()))
                        .prescription(savedPrescription)
                        .arvMedication(medication)
                        .dosage(medDto.getDosage())
                        .frequency(medDto.getFrequency())
                        .durationDays(medDto.getDurationDays())
                        .notes(medDto.getNotes())
                        .build();
                    prescriptionMedications.add(preMed);
                }
                
                prescriptionMedicationRepository.saveAll(prescriptionMedications);
                log.info("Created prescription with {} medications", prescriptionMedications.size());
                
                // Convert to DTOs for response
                medicationList = prescriptionMedications.stream()
                    .map(prescriptionMedicationMapper::convertToDTO)
                    .collect(Collectors.toList());
            }
            
            // Create simple DTO response
            PatientTreatmentPlanDTO responseDto = PatientTreatmentPlanDTO.builder()
                .id(saved.getId())
                .patientId(saved.getPatient().getId())
                .doctorId(saved.getDoctor().getId())
                .patientName(patient.getUser() != null ? patient.getUser().getFullName() : null)
                .doctorName(doctor.getUser() != null ? doctor.getUser().getFullName() : null)
                .arvProtocolName(arvProtocol.getName())
                .startDate(saved.getStartDate())
                .notes(saved.getNotes())
                .createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt())
                .prescriptionMedicationDTOList(medicationList)
                .build();
            
            return responseDto;
        } catch (EntityNotFoundException e) {
            log.error("Entity not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating treatment plan: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create treatment plan: " + e.getMessage());
        }
    }

    private boolean areMedicationsDifferent(List<PrescriptionMedication> oldList, List<PrescriptionMedicationDTO> newList) {
        if (oldList.size() != newList.size()) {
            return true; // số lượng thuốc khác nhau
        }

        for (PrescriptionMedication oldMed : oldList) {
            boolean foundMatch = false;
            for (PrescriptionMedicationDTO newMed : newList) {
                if (oldMed.getId().getMedicationId().equals(newMed.getMedicationId()) &&
                        oldMed.getDosage().equals(newMed.getDosage()) &&
                        oldMed.getFrequency().equals(newMed.getFrequency()) &&
                        oldMed.getDurationDays().equals(newMed.getDurationDays()) &&
                        Objects.equals(oldMed.getNotes(), newMed.getNotes())) {
                    foundMatch = true;
                    break;
                }
            }

            if (!foundMatch) {
                return true; // không tìm thấy thuốc tương ứng
            }
        }

        return false; // danh sách giống nhau
    }

    private void createNewPrescription(PatientTreatmentPlan plan, List<PrescriptionMedicationDTO> meds, String reason, Prescription oldPrescription) {
        // Lưu lịch sử đơn thuốc
        PrescriptionHistory history = PrescriptionHistory.builder()
                .treatmentPlan(plan)
                .prescription(oldPrescription)
                .changeReason(reason)
                .build();
        priscriptionHistoryRepository.save(history);

        // Vô hiệu hóa đơn thuốc cũ
        oldPrescription.setActive(false);
        prescriptionRepository.save(oldPrescription);

        // Tạo đơn thuốc mới
        Prescription newPrescription = Prescription.builder()
                .treatmentPlan(plan)
                .build();
        prescriptionRepository.save(newPrescription);

        // Thêm thuốc
        for (PrescriptionMedicationDTO preDto : meds) {
            ARVMedication medication = medicationRepository.findById(preDto.getMedicationId())
                    .orElseThrow(() -> new EntityNotFoundException("Thuốc không tồn tại"));
            PrescriptionMedication preMed = PrescriptionMedication.builder()
                    .id(new PrescriptionMedicationId(newPrescription.getId(), medication.getId()))
                    .dosage(preDto.getDosage())
                    .frequency(preDto.getFrequency())
                    .durationDays(preDto.getDurationDays())
                    .notes(preDto.getNotes())
                    .build();
            prescriptionMedicationRepository.save(preMed);
        }
    }

    @Override
    @Transactional
    public PatientTreatmentPlanDTO update(Integer id, UpdatePatientTreatmentPlanDTO dto) {
        PatientTreatmentPlan existing = treatmentPlanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient treatment plan không tồn tại"));

        boolean prescriptionChanged = false;

        // 1. Kiểm tra thay đổi phác đồ
        if (existing.getArvProtocol() != null &&
                !existing.getArvProtocol().getId().equals(dto.getArvProtocolId())) {
            ARVProtocol newProtocol = arvProtocolRepository.findById(dto.getArvProtocolId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy ARV Protocol"));

            historyRepository.save(TreatmentHistory.builder()
                    .treatmentPlan(existing)
                    .oldArvProtocolId(existing.getArvProtocol().getId())
                    .newArvProtocolId(newProtocol.getId())
                    .startDate(existing.getStartDate())
                    .reason(dto.getReasonChangeARV())
                    .notes(dto.getNotes())
                    .build());

            existing.setArvProtocol(newProtocol);
            existing.setStartDate(dto.getStartDate());
            prescriptionChanged = true; // Khi đổi protocol → luôn tạo đơn thuốc mới
        }

        // 2. Tìm đơn thuốc cũ
        List<Prescription> activePrescriptions = prescriptionRepository
                .findByTreatmentPlanIdAndActiveTrue(id);
        if (activePrescriptions.isEmpty()) {
            throw new EntityNotFoundException("Không tìm thấy đơn thuốc đang hoạt động");
        }
        Prescription oldPrescription = activePrescriptions.get(0); // Lấy đơn thuốc active đầu tiên

        // 3. Nếu cần đổi đơn thuốc (vì protocol đổi, hoặc danh sách thuốc thay đổi)
        if (prescriptionChanged || areMedicationsDifferent(
                prescriptionMedicationRepository.findByPrescriptionId(oldPrescription.getId()),
                dto.getPrescriptionMedicationDTOList())) {
            createNewPrescription(existing, dto.getPrescriptionMedicationDTOList(), dto.getReasonChangePrescription(), oldPrescription);
        }

        // 4. Ghi chú chung
        existing.setNotes(dto.getNotes());
        PatientTreatmentPlan saved = treatmentPlanRepository.save(existing);
        return mapper.toDTO(saved);
    }


    @Override
    @Transactional
    public void delete(Integer id) {
        PatientTreatmentPlan plan = treatmentPlanRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Patient treatment plan không tồn tại"));
        treatmentPlanRepository.delete(plan);
    }

    @Override
    @Transactional
    public PatientTreatmentPlanDTO activateTreatmentPlan(Integer id) {
        PatientTreatmentPlan plan = treatmentPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch điều trị"));
        
        // Deactivate all other active plans for this patient
        List<PatientTreatmentPlan> otherActivePlans = treatmentPlanRepository
            .findByPatientId(plan.getPatient().getId())
            .stream()
            .filter(p -> !p.getId().equals(id) && p.getActive())
            .collect(Collectors.toList());
        
        for (PatientTreatmentPlan otherPlan : otherActivePlans) {
            otherPlan.setActive(false);
            treatmentPlanRepository.save(otherPlan);
            
            // Also deactivate associated prescriptions
            List<Prescription> activePrescriptions = prescriptionRepository
                .findByTreatmentPlanIdAndActiveTrue(otherPlan.getId());
            for (Prescription prescription : activePrescriptions) {
                prescription.setActive(false);
                prescriptionRepository.save(prescription);
            }
            
            // Delete ALL medication reminders for deactivated treatment plan
            try {
                // 1. Delete reminders directly linked to treatment plan
                List<TreatmentReminder> directReminders = treatmentReminderRepository
                    .findByTreatmentPlanIdOrderByReminderDateDesc(otherPlan.getId());
                List<TreatmentReminder> directMedicationReminders = directReminders.stream()
                    .filter(r -> "Medication".equals(r.getReminderType()))
                    .collect(Collectors.toList());
                
                if (!directMedicationReminders.isEmpty()) {
                    treatmentReminderRepository.deleteAll(directMedicationReminders);
                    log.info("Deleted {} direct medication reminders when activating plan {}", 
                            directMedicationReminders.size(), otherPlan.getId());
                }
                
                // 2. Delete reminders linked through medication schedules
                List<MedicationSchedule> medicationSchedules = medicationScheduleRepository
                    .findByTreatmentPlanId(otherPlan.getId());
                int totalScheduleRemindersDeleted = 0;
                
                for (MedicationSchedule schedule : medicationSchedules) {
                    List<TreatmentReminder> scheduleReminders = treatmentReminderRepository
                        .findByMedicationScheduleIdOrderByReminderDateDesc(schedule.getId());
                    
                    if (!scheduleReminders.isEmpty()) {
                        treatmentReminderRepository.deleteAll(scheduleReminders);
                        totalScheduleRemindersDeleted += scheduleReminders.size();
                    }
                }
                
                if (totalScheduleRemindersDeleted > 0) {
                    log.info("Deleted {} medication schedule reminders when activating plan {}", 
                            totalScheduleRemindersDeleted, otherPlan.getId());
                }
                
            } catch (Exception e) {
                log.warn("Failed to delete medication reminders for treatment plan {}: {}", 
                        otherPlan.getId(), e.getMessage());
            }
        }
        
        // Activate this plan
        plan.setActive(true);
        PatientTreatmentPlan saved = treatmentPlanRepository.save(plan);
        
        // Activate the latest prescription for this plan
        List<Prescription> prescriptions = prescriptionRepository.findByTreatmentPlanId(id);
        if (!prescriptions.isEmpty()) {
            Prescription latestPrescription = prescriptions.stream()
                .max((p1, p2) -> p1.getCreatedAt().compareTo(p2.getCreatedAt()))
                .orElse(null);
            if (latestPrescription != null) {
                latestPrescription.setActive(true);
                prescriptionRepository.save(latestPrescription);
            }
        }
        
        log.info("Activated treatment plan with ID: {}", id);
        return mapper.toDTO(saved);
    }

    @Override
    @Transactional
    public PatientTreatmentPlanDTO deactivateTreatmentPlan(Integer id) {
        PatientTreatmentPlan plan = treatmentPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch điều trị"));
        
        plan.setActive(false);
        PatientTreatmentPlan saved = treatmentPlanRepository.save(plan);
        
        // Deactivate associated prescriptions
        List<Prescription> activePrescriptions = prescriptionRepository
            .findByTreatmentPlanIdAndActiveTrue(id);
        for (Prescription prescription : activePrescriptions) {
            prescription.setActive(false);
            prescriptionRepository.save(prescription);
        }
        
        // Delete ALL medication reminders for this treatment plan
        try {
            // 1. Delete reminders directly linked to treatment plan
            List<TreatmentReminder> directReminders = treatmentReminderRepository.findByTreatmentPlanIdOrderByReminderDateDesc(id);
            List<TreatmentReminder> directMedicationReminders = directReminders.stream()
                .filter(r -> "Medication".equals(r.getReminderType()))
                .collect(Collectors.toList());
            
            if (!directMedicationReminders.isEmpty()) {
                treatmentReminderRepository.deleteAll(directMedicationReminders);
                log.info("Deleted {} direct medication reminders for treatment plan {}", directMedicationReminders.size(), id);
            }
            
            // 2. Delete reminders linked through medication schedules
            List<MedicationSchedule> medicationSchedules = medicationScheduleRepository.findByTreatmentPlanId(id);
            int totalScheduleRemindersDeleted = 0;
            
            for (MedicationSchedule schedule : medicationSchedules) {
                List<TreatmentReminder> scheduleReminders = treatmentReminderRepository
                    .findByMedicationScheduleIdOrderByReminderDateDesc(schedule.getId());
                
                if (!scheduleReminders.isEmpty()) {
                    treatmentReminderRepository.deleteAll(scheduleReminders);
                    totalScheduleRemindersDeleted += scheduleReminders.size();
                }
            }
            
            if (totalScheduleRemindersDeleted > 0) {
                log.info("Deleted {} medication schedule reminders for treatment plan {}", totalScheduleRemindersDeleted, id);
            }
            
            log.info("Total deleted: {} reminders for deactivated treatment plan {}", 
                directMedicationReminders.size() + totalScheduleRemindersDeleted, id);
            
        } catch (Exception e) {
            log.warn("Failed to delete medication reminders for treatment plan {}: {}", id, e.getMessage());
        }
        
        log.info("Deactivated treatment plan with ID: {}", id);
        return mapper.toDTO(saved);
    }

    @Override
    @Transactional
    public int cleanupInactiveTreatmentPlanReminders() {
        try {
            // Find all medication reminders for inactive treatment plans
            List<TreatmentReminder> inactiveReminders = treatmentReminderRepository
                .findByInactiveTreatmentPlansAndMedicationType();
            
            if (!inactiveReminders.isEmpty()) {
                treatmentReminderRepository.deleteAll(inactiveReminders);
                log.info("Cleaned up {} medication reminders from inactive treatment plans", inactiveReminders.size());
                return inactiveReminders.size();
            } else {
                log.info("No medication reminders found for inactive treatment plans");
                return 0;
            }
        } catch (Exception e) {
            log.error("Failed to cleanup inactive treatment plan reminders: {}", e.getMessage());
            throw new RuntimeException("Failed to cleanup reminders: " + e.getMessage());
        }
    }

}