package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "treatment_history")
public class TreatmentHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "treatment_plan_id", nullable = false)
    private PatientTreatmentPlan treatmentPlan;

    @Column(name = "old_arv_protocol_id")
    private Integer oldArvProtocolId;

    @Column(name = "new_arv_protocol_id")
    private Integer newArvProtocolId;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date" , nullable = false)
    private LocalDate endDate;
    
    @Column(name = "reason", columnDefinition = "NVARCHAR(225)")
    private String reason;
    
    @Column(name = "notes",columnDefinition = "NVARCHAR(225)")
    private String notes;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (endDate == null) endDate = LocalDate.now();
    }
}