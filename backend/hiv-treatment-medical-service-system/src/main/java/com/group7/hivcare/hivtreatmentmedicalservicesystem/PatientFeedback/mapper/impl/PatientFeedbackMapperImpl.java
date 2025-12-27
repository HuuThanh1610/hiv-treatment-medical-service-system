package com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.CreatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.PatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.UpdatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.mapper.PatientFeedbackMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientFeedback;
import org.springframework.stereotype.Component;

@Component
public class PatientFeedbackMapperImpl implements PatientFeedbackMapper {
    @Override
    public PatientFeedback toEntity(CreatePatientFeedbackDTO dto, Appointment appointment) {
        if (dto == null || appointment == null) return null;

        return PatientFeedback.builder()
                .appointment(appointment)
                .staffRating(dto.getStaffRating())
                .waitingTimeRating(dto.getWaitingTimeRating())
                .facilityRating(dto.getFacilityRating())
                .doctorRating(dto.getDoctorRating())
                .additionalComments(dto.getAdditionalComments())
                .build();
    }

    @Override
    public PatientFeedback toEntity(UpdatePatientFeedbackDTO dto, PatientFeedback existingFeedback) {
        if (dto == null || existingFeedback == null) return null;

        existingFeedback.setStaffRating(dto.getStaffRating());
        existingFeedback.setWaitingTimeRating(dto.getWaitingTimeRating());
        existingFeedback.setFacilityRating(dto.getFacilityRating());
        existingFeedback.setDoctorRating(dto.getDoctorRating());
        existingFeedback.setAdditionalComments(dto.getAdditionalComments());

        return existingFeedback;
    }

    @Override
    public PatientFeedbackDTO toDTO(PatientFeedback entity) {
        if (entity == null) return null;

        PatientFeedbackDTO dto = new PatientFeedbackDTO();
        dto.setId(entity.getId());
        dto.setAppointmentId(entity.getAppointment().getId());
        dto.setStaffRating(entity.getStaffRating());
        dto.setWaitingTimeRating(entity.getWaitingTimeRating());
        dto.setFacilityRating(entity.getFacilityRating());
        dto.setDoctorRating(entity.getDoctorRating());
        dto.setAdditionalComments(entity.getAdditionalComments());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Additional fields
        if (entity.getAppointment() != null) {
            if (entity.getAppointment().getPatient() != null && entity.getAppointment().getPatient().getUser() != null) {
                dto.setPatientName(entity.getAppointment().getPatient().getUser().getFullName());
            }
            if (entity.getAppointment().getDoctor() != null && entity.getAppointment().getDoctor().getUser() != null) {
                dto.setDoctorName(entity.getAppointment().getDoctor().getUser().getFullName());
            }
            dto.setAppointmentDate(entity.getAppointment().getAppointmentDate().atTime(entity.getAppointment().getAppointmentTime()));
        }

        // Calculate average rating
        double average = (entity.getStaffRating() + entity.getWaitingTimeRating() +
                         entity.getFacilityRating() + entity.getDoctorRating()) / 4.0;
        dto.setAverageRating(Math.round(average * 10.0) / 10.0); // Round to 1 decimal place

        return dto;
    }
}
