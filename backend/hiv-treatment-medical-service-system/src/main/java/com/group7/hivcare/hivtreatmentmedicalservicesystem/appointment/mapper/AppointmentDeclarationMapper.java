package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentDeclaration;

import java.util.List;

public interface AppointmentDeclarationMapper {
    AppointmentDeclarationDTO toDTO(AppointmentDeclaration entity);
    AppointmentDeclaration toEntity(AppointmentDeclarationDTO dto);
    List<AppointmentDeclarationDTO> toDTOList(List<AppointmentDeclaration> entities);
} 