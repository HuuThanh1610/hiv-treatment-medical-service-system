package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.CreateRevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.RevisitAppointmentDTO;

import java.time.LocalDate;
import java.util.List;

public interface RevisitAppointmentService {
    RevisitAppointmentDTO createRevisitAppointment(CreateRevisitAppointmentDTO dto);

    RevisitAppointmentDTO getById(Integer id);

    RevisitAppointmentDTO getByAppointmentId(Integer appointmentId);

    List<RevisitAppointmentDTO> getByPatientId(Integer patientId);

    List<RevisitAppointmentDTO> getByDoctorId(Integer doctorId);

    void deleteRevisitAppointment(Integer id, Integer doctorId);

}
