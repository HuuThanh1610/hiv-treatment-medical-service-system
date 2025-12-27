package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "treatment_reminders")
public class TreatmentReminder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patients patient;
    
    @Column(name = "reminder_type", nullable = false, columnDefinition = "NVARCHAR(225)")
    private String reminderType; // 'Medication', 'Appointment'
    
    @Column(name = "reminder_date", nullable = false)
    private LocalDateTime reminderDate;
    
    @Column(name = "status", nullable = false, columnDefinition = "NVARCHAR(225)")
    private String status; // 'Pending', 'Sent', 'Completed'
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "treatment_plan_id")
    private PatientTreatmentPlan treatmentPlan;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_schedule_id")
    private MedicationSchedule medicationSchedule;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public TreatmentReminder(LocalDateTime updatedAt, LocalDateTime createdAt, String status, String reminderType, LocalDateTime reminderDate, Patients patient, PatientTreatmentPlan treatmentPlan, Appointment appointment, MedicationSchedule medicationSchedule) {  
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
        this.status = status;
        this.reminderType = reminderType;
        this.reminderDate = reminderDate;
        this.patient = patient;
        this.treatmentPlan = treatmentPlan;
        this.appointment = appointment;
        this.medicationSchedule = medicationSchedule;
    }
    
}
