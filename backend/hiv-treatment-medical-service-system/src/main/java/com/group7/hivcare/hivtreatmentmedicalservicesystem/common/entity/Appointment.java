package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"patient", "doctor", "medicalService", "payments"})
@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patients patient;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // Bác sĩ thay thế (nếu có)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "substitute_doctor_id")
    private Doctor substituteDoctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private MedicalServices medicalService;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;
    
    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column (columnDefinition = "NVARCHAR(25)")
    private String status;

    @Column (columnDefinition = "NVARCHAR(255)")
    private String notes;

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

    public Appointment(Patients patient, Doctor doctor, MedicalServices medicalService, LocalDate appointmentDate, LocalTime appointmentTime, String status, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.patient = patient;
        this.doctor = doctor;
        this.medicalService = medicalService;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.status = status;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @OneToMany(mappedBy = "appointment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<TreatmentReminder> treatmentReminders = new ArrayList<>();

    @OneToMany(mappedBy = "appointment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<LabRequest> labRequests = new ArrayList<>();

    // Quan hệ với AppointmentDeclaration
    @OneToOne(mappedBy = "appointment", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private AppointmentDeclaration appointmentDeclaration;

}

