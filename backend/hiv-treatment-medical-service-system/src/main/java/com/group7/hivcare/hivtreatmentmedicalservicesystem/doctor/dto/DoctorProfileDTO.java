package com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto;

import lombok.Data;

@Data
public class DoctorProfileDTO {
    private String specialty;
    private String qualifications;
    private Integer maxAppointmentsPerDay;
} 