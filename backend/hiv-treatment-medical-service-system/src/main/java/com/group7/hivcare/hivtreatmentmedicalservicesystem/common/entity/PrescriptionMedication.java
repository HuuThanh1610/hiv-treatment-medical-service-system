package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "prescription_medications")
public class PrescriptionMedication {
    @EmbeddedId //Định nghĩa khóa chính bao gồm nhiều cột
    private PrescriptionMedicationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false, insertable = false, updatable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", nullable = false, insertable = false, updatable = false)
    private ARVMedication arvMedication;

    @Column(name = "dosage", nullable = false,columnDefinition = "NVARCHAR(225)")
    private String dosage; //Chỉ định số lượng thuốc cần dùng trong một lần .

    @Column(name = "frequency", nullable = false,columnDefinition = "NVARCHAR(225)")
    private String frequency; // Chỉ định mỗi ngày dùng bao nhiêu lần.

    @Column(name = "duration_days")
    private Integer durationDays; //Chỉ định sử dụng thuốc liên tục trong bao nhiêu ngày.

    @Column(name = "notes", columnDefinition = "NVARCHAR(225)")
    private String notes;

}
