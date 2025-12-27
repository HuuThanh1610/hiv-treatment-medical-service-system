/**
 * PrescriptionHistory.java - Entity class cho PrescriptionHistory table
 *
 * Chức năng:
 * - JPA Entity mapping cho prescription_history table
 * - Track lịch sử thay đổi đơn thuốc của bệnh nhân
 * - Relationship với PatientTreatmentPlan và Prescription
 * - Audit trail cho prescription changes
 * - createdAt field cho Frontend hiển thị ngày
 * - changeReason để ghi lý do thay đổi
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * PrescriptionHistory entity - đại diện cho prescription_history table
 * Lưu trữ lịch sử thay đổi đơn thuốc của bệnh nhân
 * Frontend sử dụng createdAt để hiển thị ngày thay vì N/A
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "prescription_history")
public class PrescriptionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "treatment_plan_id", nullable = false)
    private PatientTreatmentPlan treatmentPlan;

    @ManyToOne
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @Column(name = "change_reason", columnDefinition = "NVARCHAR(255)")
    private String changeReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
