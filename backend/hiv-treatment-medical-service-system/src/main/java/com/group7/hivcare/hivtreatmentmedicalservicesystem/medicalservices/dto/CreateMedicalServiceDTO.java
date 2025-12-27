package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMedicalServiceDTO {
    private String name;
    private String description;
    private int defaultDuration;
    private double price;
}
