package com.group7.hivcare.hivtreatmentmedicalservicesystem.labtesttype.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LabTestTypeDTO {
    private Integer id;
    
    @NotBlank(message = "Lab test type name must not be blank")
    @Size(min = 2, max = 255, message = "Lab test type name must be between 2 and 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private double price;

    @Size(max = 255, message = "Normal range must not exceed 255 characters")
    private String normalRange;

    @Size(max = 255, message = "Unit must not exceed 255 characters")
    private String unit;
}
