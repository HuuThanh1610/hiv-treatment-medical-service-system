package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;   
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "medication_schedules")
public class MedicationSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id", nullable = false)
    private PatientTreatmentPlan treatmentPlan;
    
    @Column(name = "medication_name", nullable = false, columnDefinition = "NVARCHAR(225)")
    private String medicationName;
    
    @Column(name = "dosage", nullable = false, columnDefinition = "NVARCHAR(225)")
    private String dosage;
    
    @Column(name = "frequency", nullable = false, columnDefinition = "NVARCHAR(225)")
    private String frequency;
    
    @Column(name = "time_of_day", columnDefinition = "NVARCHAR(225)")
    private String timeOfDay; // VD: "08:00,20:00"
    
    @Column(name = "duration_days")
    private Integer durationDays; // Số ngày cần uống thuốc từ prescription medication
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public MedicationSchedule(LocalDateTime updatedAt, LocalDateTime createdAt, String timeOfDay, String frequency, String dosage, String medicationName, PatientTreatmentPlan treatmentPlan) { 
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
        this.timeOfDay = timeOfDay;
        this.frequency = frequency;
        this.dosage = dosage;
        this.medicationName = medicationName;
        this.treatmentPlan = treatmentPlan;
    }

    @OneToMany(mappedBy = "medicationSchedule", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<TreatmentReminder> treatmentReminders = new ArrayList<TreatmentReminder>();
}
