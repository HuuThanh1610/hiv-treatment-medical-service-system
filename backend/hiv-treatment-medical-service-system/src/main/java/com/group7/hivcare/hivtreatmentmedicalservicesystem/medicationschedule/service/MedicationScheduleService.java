package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.CreateMedicationScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.CreateMedicationScheduleFromPrescriptionDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicationschedule.dto.MedicationScheduleDTO;

import java.util.List;

public interface MedicationScheduleService {
    
    /**
     * Tạo medication schedule mới
     */
    MedicationScheduleDTO createMedicationSchedule(CreateMedicationScheduleDTO createDTO);
    
    /**
     * Lấy medication schedule theo ID
     */
    MedicationScheduleDTO getMedicationScheduleById(Integer id);
    
    /**
     * Lấy tất cả medication schedule theo treatment plan
     */
    List<MedicationScheduleDTO> getMedicationSchedulesByTreatmentPlan(Integer treatmentPlanId);
    
    /**
     * Lấy tất cả medication schedule theo patient
     */
    List<MedicationScheduleDTO> getMedicationSchedulesByPatient(Integer patientId);
    
    /**
     * Cập nhật medication schedule
     */
    MedicationScheduleDTO updateMedicationSchedule(Integer id, CreateMedicationScheduleDTO updateDTO);
    
    /**
     * Xóa medication schedule
     */
    void deleteMedicationSchedule(Integer id);
    
    /**
     * Tạo nhắc nhở uống thuốc từ medication schedule
     */
    List<MedicationScheduleDTO> createRemindersFromMedicationSchedule(Integer medicationScheduleId);
    
    /**
     * Tạo medication schedule từ prescription medication
     */
    MedicationScheduleDTO createMedicationScheduleFromPrescription(CreateMedicationScheduleFromPrescriptionDTO createDTO);
} 