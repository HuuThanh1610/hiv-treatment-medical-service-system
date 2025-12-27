package com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.CreatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.PatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.UpdatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientFeedback;

public interface PatientFeedbackMapper {
    PatientFeedback toEntity(CreatePatientFeedbackDTO dto, Appointment appointment);

    PatientFeedback toEntity(UpdatePatientFeedbackDTO dto, PatientFeedback existingFeedback);

    PatientFeedbackDTO toDTO(PatientFeedback entity);
}
