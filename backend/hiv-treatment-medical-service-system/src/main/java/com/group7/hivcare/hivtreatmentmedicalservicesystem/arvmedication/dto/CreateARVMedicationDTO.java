package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateARVMedicationDTO {
    @NotBlank(message = "Mã thuốc không được để trống")
    private String code;
    
    @NotBlank(message = "Tên thuốc không được để trống")
    private String name;
    
    private String description;

    private String drugClass;
    
    private String form;
    
    private String strength;
    
    private String manufacturer;

}