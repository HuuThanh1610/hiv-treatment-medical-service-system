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
public class UpdatePatientTreatmentPlanDTO {
    @NotNull(message = "ID phác đồ ARV không được để trống")
    private Integer arvProtocolId;
    private LocalDate startDate; // cho bác sĩ chọn ngày bắt đầu
    private String reasonChangeARV;
    private String reasonChangePrescription;
    private String notes;

    // Danh sách thuốc kèm theo
    private List<PrescriptionMedicationDTO> prescriptionMedicationDTOList;
}