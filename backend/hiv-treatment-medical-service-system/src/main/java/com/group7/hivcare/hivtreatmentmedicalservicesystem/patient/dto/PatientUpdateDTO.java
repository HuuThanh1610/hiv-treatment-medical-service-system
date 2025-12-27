package com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class PatientUpdateDTO {
    private String fullName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String gender;
    private String address;
    private String medicalRecordNumber;
    private Boolean pregnant;
    private Boolean isPregnant;
} 