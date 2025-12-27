package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicationDTO {
    private Integer medicationId;
    private String name;
    private String dosage; //Chỉ định số lượng thuốc cần dùng trong một lần .
    private String frequency; // Chỉ định mỗi ngày dùng bao nhiêu lần.
    private Integer durationDays; //Chỉ định sử dụng thuốc liên tục trong bao nhiêu ngày.
    private String notes;
}
