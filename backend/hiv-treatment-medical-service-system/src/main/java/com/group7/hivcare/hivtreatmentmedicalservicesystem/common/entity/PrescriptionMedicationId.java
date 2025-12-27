package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode //để so sánh 2 object và đảm bảo object hoạt động chính xác trong các cấu trúc dữ liệu dùng hash
public class PrescriptionMedicationId implements Serializable {
    @Column(name = "prescription_id")
    private Integer prescriptionId;
    @Column(name = "medication_id")
    private Integer medicationId;
}
