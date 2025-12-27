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
@Table(name = "appointment_declarations")
public class AppointmentDeclaration {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    // Quan hệ với Appointment (chính)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false)
    private Appointment appointment;
    
    // Thông tin khai báo sức khỏe
    @Column(name = "is_pregnant", nullable = false)
    @Builder.Default
    private boolean isPregnant = false;
    
    @Column(name = "health_notes", columnDefinition = "NVARCHAR(MAX)")
    private String healthNotes;
    
    @Column(name = "symptoms", columnDefinition = "NVARCHAR(MAX)")
    private String symptoms;
    
    @Column(name = "current_medications", columnDefinition = "NVARCHAR(MAX)")
    private String currentMedications;
    
    @Column(name = "allergies", columnDefinition = "NVARCHAR(MAX)")
    private String allergies;
    
    @Column(name = "emergency_contact", columnDefinition = "NVARCHAR(MAX)")
    private String emergencyContact;
    
    @Column(name = "emergency_phone")
    private String emergencyPhone;
    
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
} 