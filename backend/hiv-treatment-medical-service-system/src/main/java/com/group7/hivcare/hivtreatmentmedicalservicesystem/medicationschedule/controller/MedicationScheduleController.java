package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.CreateMedicationScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.CreateMedicationScheduleFromPrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.MedicationScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.service.MedicationScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medication-schedules")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MedicationScheduleController {

    private final MedicationScheduleService medicationScheduleService;

    /**
     * Tạo medication schedule mới
     */
    @PostMapping
    public ResponseEntity<MedicationScheduleDTO> createMedicationSchedule(
            @RequestBody CreateMedicationScheduleDTO createDTO) {
        MedicationScheduleDTO schedule = medicationScheduleService.createMedicationSchedule(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
    }

    /**
     * Lấy medication schedule theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<MedicationScheduleDTO> getMedicationScheduleById(@PathVariable Integer id) {
        MedicationScheduleDTO schedule = medicationScheduleService.getMedicationScheduleById(id);
        return ResponseEntity.ok(schedule);
    }

    /**
     * Lấy tất cả medication schedule theo treatment plan
     */
    @GetMapping("/treatment-plan/{treatmentPlanId}")
    public ResponseEntity<List<MedicationScheduleDTO>> getMedicationSchedulesByTreatmentPlan(
            @PathVariable Integer treatmentPlanId) {
        List<MedicationScheduleDTO> schedules = medicationScheduleService.getMedicationSchedulesByTreatmentPlan(treatmentPlanId);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Lấy tất cả medication schedule theo patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicationScheduleDTO>> getMedicationSchedulesByPatient(
            @PathVariable Integer patientId) {
        List<MedicationScheduleDTO> schedules = medicationScheduleService.getMedicationSchedulesByPatient(patientId);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Cập nhật medication schedule
     */
    @PutMapping("/{id}")
    public ResponseEntity<MedicationScheduleDTO> updateMedicationSchedule(
            @PathVariable Integer id, @RequestBody CreateMedicationScheduleDTO updateDTO) {
        MedicationScheduleDTO schedule = medicationScheduleService.updateMedicationSchedule(id, updateDTO);
        return ResponseEntity.ok(schedule);
    }

    /**
     * Xóa medication schedule
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicationSchedule(@PathVariable Integer id) {
        medicationScheduleService.deleteMedicationSchedule(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Tạo nhắc nhở từ medication schedule
     */
    @PostMapping("/{id}/create-reminders")
    public ResponseEntity<List<MedicationScheduleDTO>> createRemindersFromMedicationSchedule(
            @PathVariable Integer id) {
        List<MedicationScheduleDTO> schedules = medicationScheduleService.createRemindersFromMedicationSchedule(id);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Tạo medication schedule từ prescription medication
     */
    @PostMapping("/from-prescription")
    public ResponseEntity<MedicationScheduleDTO> createMedicationScheduleFromPrescription(
            @RequestBody CreateMedicationScheduleFromPrescriptionDTO createDTO) {
        MedicationScheduleDTO schedule = medicationScheduleService.createMedicationScheduleFromPrescription(createDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(schedule);
    }
} 