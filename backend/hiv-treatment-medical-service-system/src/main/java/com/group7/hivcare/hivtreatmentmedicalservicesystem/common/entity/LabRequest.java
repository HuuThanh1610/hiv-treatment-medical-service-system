package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
// import lombok.Getter; // removed unused import
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
@Table(name = "lab_requests")
public class LabRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id")
    @JsonIgnore
    private Appointment appointment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @JsonIgnore
    private Patients patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = true)
    @JsonIgnore
    private Doctor doctor;

    @Column(name = "request_date", nullable = false)
    private LocalDateTime requestDate;

    @Column(name = "is_urgent", nullable = false)
    private boolean isUrgent;

    @Column(name = "status", nullable = false)
    private String status; // 'Pending', 'Completed'

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "labRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private List<LabRequestItem> labRequestItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }


    @OneToMany(mappedBy = "labRequest", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<Payment> payments = new ArrayList<Payment>();
}
