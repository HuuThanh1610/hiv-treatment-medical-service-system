package com.group7.hivcare.hivtreatmentmedicalservicesystem.patienttreatmentplan.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentPlanStatus;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto.PrescriptionMedicationDTO;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientTreatmentPlanDTO {
    private Integer id;
    private Integer patientId;
    private Integer doctorId;
    private String patientName;
    private String doctorName;
    private String arvProtocolName;
    private LocalDate startDate;
    private String notes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Danh sách thuốc kèm theo
    private List<PrescriptionMedicationDTO> prescriptionMedicationDTOList;
}