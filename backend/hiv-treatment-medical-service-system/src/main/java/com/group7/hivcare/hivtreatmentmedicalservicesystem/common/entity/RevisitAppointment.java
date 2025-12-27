package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "revisit_appointments")
public class RevisitAppointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    @Column(name = "revisit_date", nullable = false)
    private LocalDate revisitDate;

    @Column(name = "revisit_notes", columnDefinition = "NVARCHAR(MAX)")
    private String revisitNotes;

    @Column(name = "revisit_appointment_status", columnDefinition = "nvarchar(50)")
    @Enumerated(EnumType.STRING)
    private RevisitAppointmentStatus revisitAppointmentStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt ;

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