package com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateDoctorRequestDTO {
    // User information only
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;
    private LocalDate birthday;
    private String gender;
    private boolean anonymous;
} 