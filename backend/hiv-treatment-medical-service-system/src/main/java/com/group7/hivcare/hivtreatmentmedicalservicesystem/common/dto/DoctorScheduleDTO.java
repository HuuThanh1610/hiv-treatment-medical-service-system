package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class DoctorScheduleDTO {
    private Integer id;
    private Integer doctorId;
    private String doctorName;
    private String dayOfWeek;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String notes;
    private String status; // ACTIVE, INACTIVE, CANCELLED
}
