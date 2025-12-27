package com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.PatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.CreatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto.UpdatePatientTreatmentPlanDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientTreatmentPlan;

public interface PatientTreatmentPlanMapper {
    PatientTreatmentPlanDTO toDTO(PatientTreatmentPlan entity);
    PatientTreatmentPlan toEntity(CreatePatientTreatmentPlanDTO dto);
}