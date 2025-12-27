package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.MedicationSchedule;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientTreatmentPlan;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.MedicationScheduleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientTreatmentPlanRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PrescriptionMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.exception.customexceptions.NotFoundException;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.CreateMedicationScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.CreateMedicationScheduleFromPrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.MedicationScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.service.MedicationScheduleService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service.TreatmentReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicationScheduleServiceImpl implements MedicationScheduleService {

    private final MedicationScheduleRepository medicationScheduleRepository;
    private final PatientTreatmentPlanRepository treatmentPlanRepository;
    private final PrescriptionMedicationRepository prescriptionMedicationRepository;
    private final TreatmentReminderService treatmentReminderService;

    @Override
    public MedicationScheduleDTO createMedicationSchedule(CreateMedicationScheduleDTO createDTO) {
        PatientTreatmentPlan treatmentPlan = treatmentPlanRepository.findById(createDTO.getTreatmentPlanId())
                .orElseThrow(() -> new NotFoundException("Treatment plan not found"));

        MedicationSchedule schedule = MedicationSchedule.builder()
                .treatmentPlan(treatmentPlan)
                .medicationName(createDTO.getMedicationName())
                .dosage(createDTO.getDosage())
                .frequency(createDTO.getFrequency())
                .timeOfDay(createDTO.getTimeOfDay())
                .durationDays(createDTO.getDurationDays()) // Sử dụng duration từ DTO
                .build();

        MedicationSchedule savedSchedule = medicationScheduleRepository.save(schedule);
        
        // Tự động tạo nhắc nhở uống thuốc hàng ngày khi tạo lịch uống thuốc
        try {
            treatmentReminderService.createDailyMedicationReminders(savedSchedule.getId());
            log.info("Created daily medication reminders for schedule: {}", savedSchedule.getId());
        } catch (Exception e) {
            log.error("Failed to create daily medication reminders for schedule {}: {}", savedSchedule.getId(), e.getMessage());
        }
        
        return convertToDTO(savedSchedule);
    }

    @Override
    public MedicationScheduleDTO getMedicationScheduleById(Integer id) {
        MedicationSchedule schedule = medicationScheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Medication schedule not found"));
        return convertToDTO(schedule);
    }

    @Override
    public List<MedicationScheduleDTO> getMedicationSchedulesByTreatmentPlan(Integer treatmentPlanId) {
        List<MedicationSchedule> schedules = medicationScheduleRepository.findByTreatmentPlanId(treatmentPlanId);
        return schedules.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<MedicationScheduleDTO> getMedicationSchedulesByPatient(Integer patientId) {
        List<MedicationSchedule> schedules = medicationScheduleRepository.findByTreatmentPlanPatientId(patientId);
        return schedules.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public MedicationScheduleDTO updateMedicationSchedule(Integer id, CreateMedicationScheduleDTO updateDTO) {
        MedicationSchedule schedule = medicationScheduleRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Medication schedule not found"));

        schedule.setMedicationName(updateDTO.getMedicationName());
        schedule.setDosage(updateDTO.getDosage());
        schedule.setFrequency(updateDTO.getFrequency());
        schedule.setTimeOfDay(updateDTO.getTimeOfDay());

        MedicationSchedule updatedSchedule = medicationScheduleRepository.save(schedule);
        return convertToDTO(updatedSchedule);
    }

    @Override
    public void deleteMedicationSchedule(Integer id) {
        if (!medicationScheduleRepository.existsById(id)) {
            throw new NotFoundException("Medication schedule not found");
        }
        medicationScheduleRepository.deleteById(id);
        log.info("Deleted medication schedule: {}", id);
    }

    @Override
    public List<MedicationScheduleDTO> createRemindersFromMedicationSchedule(Integer medicationScheduleId) {
        // Logic này sẽ được xử lý bởi TreatmentReminderService
        // Đây chỉ là placeholder để kết nối với reminder system
        log.info("Creating reminders from medication schedule: {}", medicationScheduleId);
        return getMedicationSchedulesByTreatmentPlan(medicationScheduleId);
    }

    @Override
    public MedicationScheduleDTO createMedicationScheduleFromPrescription(CreateMedicationScheduleFromPrescriptionDTO createDTO) {
        // Tìm treatment plan
        PatientTreatmentPlan treatmentPlan = treatmentPlanRepository.findById(createDTO.getTreatmentPlanId())
                .orElseThrow(() -> new NotFoundException("Treatment plan not found"));

        // Tìm prescription medication theo ID
        PrescriptionMedication prescriptionMedication = prescriptionMedicationRepository
                .findByTreatmentPlanIdAndMedicationId(createDTO.getTreatmentPlanId(), createDTO.getMedicationId())
                .orElseThrow(() -> new NotFoundException("Prescription medication not found for this treatment plan"));

        // Tạo medication schedule từ prescription medication
        MedicationSchedule schedule = MedicationSchedule.builder()
                .treatmentPlan(treatmentPlan)
                .medicationName(prescriptionMedication.getArvMedication().getName())
                .dosage(prescriptionMedication.getDosage())
                .frequency(prescriptionMedication.getFrequency())
                .timeOfDay(createDTO.getTimeOfDay())
                .durationDays(prescriptionMedication.getDurationDays()) // Sử dụng duration từ prescription
                .build();

        MedicationSchedule savedSchedule = medicationScheduleRepository.save(schedule);
        
        // Tự động tạo nhắc nhở uống thuốc hàng ngày khi tạo lịch uống thuốc
        try {
            treatmentReminderService.createDailyMedicationReminders(savedSchedule.getId());
            log.info("Created daily medication reminders for schedule: {}", savedSchedule.getId());
        } catch (Exception e) {
            log.error("Failed to create daily medication reminders for schedule {}: {}", savedSchedule.getId(), e.getMessage());
        }
        
        return convertToDTO(savedSchedule);
    }

    // Helper method
    private MedicationScheduleDTO convertToDTO(MedicationSchedule schedule) {
        return MedicationScheduleDTO.builder()
                .id(schedule.getId())
                .treatmentPlanId(schedule.getTreatmentPlan().getId())
                .medicationName(schedule.getMedicationName())
                .dosage(schedule.getDosage())
                .frequency(schedule.getFrequency())
                .timeOfDay(schedule.getTimeOfDay())
                .durationDays(schedule.getDurationDays())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }
} 