package com.group7.hivcare.hivtreatmentmedicalservicesystem.arvmedication.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ARVMedicationDTO {
    private Integer id;
    private String code;
    private String name;
    private String description;
    private String drugClass;
    private String form;
    private String strength;
    private String manufacturer;//nhà sản xuất
    private Boolean active;
}