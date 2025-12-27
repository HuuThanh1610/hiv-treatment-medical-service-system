package com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientCreateDTO {
    private String email;
    private String password;
    private String role; 
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String medicalRecordNumber;
    private Boolean pregnant;
} 