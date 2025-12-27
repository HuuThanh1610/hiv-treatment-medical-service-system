package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRevisitAppointmentDTO {
    @NotNull(message = "ID lịch hẹn không được để trống")
    private Integer appointmentId;

    @NotNull(message = "Ngày tái khám không được để trống")
    private LocalDate revisitDate;

    private String revisitNotes;
}
