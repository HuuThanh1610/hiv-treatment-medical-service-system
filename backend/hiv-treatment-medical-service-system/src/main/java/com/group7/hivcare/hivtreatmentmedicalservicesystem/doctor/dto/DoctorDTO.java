package com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DoctorDTO {
    private Integer id;
    private Integer userId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private LocalDate birthday;
    private String gender;
    private boolean anonymous;
    private String specialty;
    private String qualifications;
    private Integer maxAppointmentsPerDay;
} 