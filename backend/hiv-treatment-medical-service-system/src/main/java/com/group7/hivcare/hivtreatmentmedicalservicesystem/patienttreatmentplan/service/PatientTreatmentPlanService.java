package com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.PatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.CreatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.UpdatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentPlanStatus;

import java.util.List;

public interface PatientTreatmentPlanService {
    List<PatientTreatmentPlanDTO> getAll();
    List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByPatientId(Integer patientId);
    List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByDoctorId(Integer doctorId);
    List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByPatientIdAndIsActive(Integer patientId);
    List<PatientTreatmentPlanDTO> getPatientTreatmentPlansByDoctorIdAndIsActive(Integer doctorId);
    PatientTreatmentPlanDTO getById(Integer id);
    PatientTreatmentPlanDTO create(CreatePatientTreatmentPlanDTO dto);
    PatientTreatmentPlanDTO update(Integer id, UpdatePatientTreatmentPlanDTO dto);
    void delete(Integer id);
    PatientTreatmentPlanDTO activateTreatmentPlan(Integer id);
    PatientTreatmentPlanDTO deactivateTreatmentPlan(Integer id);
    int cleanupInactiveTreatmentPlanReminders();
}