package com.group7.hivcare.hivtreatmentmedicalservicesystem.prescriptionMedication.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolMedicationDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionRequestDTO {
    private Integer treatmentPlanId;

    // Danh sách thuốc kèm theo
    private List<PrescriptionMedicationDTO> prescriptionMedicationDTOList;
}
