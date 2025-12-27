package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.CreateRevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.RevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.mapper.RevisitAppointmentMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointmentStatus;
import org.springframework.stereotype.Component;

@Component
public class RevisitAppointmentMapperImpl implements RevisitAppointmentMapper {
    @Override
    public RevisitAppointmentDTO convertToDTO(RevisitAppointment revisitAppointment) {
        if (revisitAppointment == null) {
            return null;
        }
        RevisitAppointmentDTO dto = new RevisitAppointmentDTO();
        dto.setId(revisitAppointment.getId());
        dto.setAppointmentId(revisitAppointment.getAppointment() != null ? revisitAppointment.getAppointment().getId() : null);
        dto.setRevisitDate(revisitAppointment.getRevisitDate());
        dto.setRevisitNotes(revisitAppointment.getRevisitNotes());
        dto.setRevisitAppointmentStatus(revisitAppointment.getRevisitAppointmentStatus());
        return dto;
    }

    @Override
    public RevisitAppointment convertToEntity(CreateRevisitAppointmentDTO createRevisitAppointmentDTO) {
        if (createRevisitAppointmentDTO == null) {
            return null;
        }

        RevisitAppointment entity = new RevisitAppointment();
        // appointment sẽ được set trong service (do cần lấy từ repository)
        entity.setRevisitDate(createRevisitAppointmentDTO.getRevisitDate());
        entity.setRevisitNotes(createRevisitAppointmentDTO.getRevisitNotes());
        entity.setRevisitAppointmentStatus(RevisitAppointmentStatus.PENDING); // Trạng thái mặc định
        return entity;
    }

}
