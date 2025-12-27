package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.CreateRevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.RevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointment;

public interface RevisitAppointmentMapper {
    public RevisitAppointmentDTO convertToDTO(RevisitAppointment revisitAppointment);
    public RevisitAppointment convertToEntity(CreateRevisitAppointmentDTO createRevisitAppointmentDTO);
}
