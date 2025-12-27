package com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.CreatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.PatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.UpdatePatientFeedbackDTO;

import java.util.List;

public interface  PatientFeedbackService {
    PatientFeedbackDTO createFeedback(CreatePatientFeedbackDTO dto);

    PatientFeedbackDTO updateFeedback(Integer id, UpdatePatientFeedbackDTO dto);

    PatientFeedbackDTO getFeedbackById(Integer id);

    PatientFeedbackDTO getFeedbackByAppointmentId(Integer appointmentId);

    List<PatientFeedbackDTO> getAllFeedbacks();

    List<PatientFeedbackDTO> getFeedbacksByDoctorId(Integer doctorId);

    boolean canPatientProvideFeedback(Integer appointmentId);
}
