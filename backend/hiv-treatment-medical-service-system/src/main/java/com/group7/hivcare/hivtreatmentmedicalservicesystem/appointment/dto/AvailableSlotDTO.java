package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailableSlotDTO {
    private LocalTime time;
    private boolean available;
} 