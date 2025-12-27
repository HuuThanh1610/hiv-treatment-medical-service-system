package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointmentStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevisitAppointmentDTO {
    private Integer id;

    private Integer appointmentId;

    private LocalDate revisitDate;

    private String revisitNotes;

    private RevisitAppointmentStatus revisitAppointmentStatus;
}
