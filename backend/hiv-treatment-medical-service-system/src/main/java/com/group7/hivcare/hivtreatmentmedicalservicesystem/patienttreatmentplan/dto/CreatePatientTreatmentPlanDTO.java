package com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreatePatientTreatmentPlanDTO {
    @NotNull(message = "ID bệnh nhân không được để trống")
    private Integer patientId;
    
    @NotNull(message = "ID bác sĩ không được để trống")
    private Integer doctorId;
    
    @NotNull(message = "ID phác đồ ARV không được để trống")
    private Integer arvProtocolId;
    
    private LocalDate startDate;
    private String notes;
    
    // Danh sách thuốc để tạo đơn thuốc cùng lúc (optional)
    private List<PrescriptionMedicationDTO> medications;
}