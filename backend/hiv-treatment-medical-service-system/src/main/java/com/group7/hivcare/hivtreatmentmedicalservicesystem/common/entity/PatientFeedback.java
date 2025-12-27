package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "patient_feedbacks")
public class PatientFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "appointment_id", nullable = false, unique = true)
    private Appointment appointment;

    // Đánh giá thái độ nhân viên tiếp đón (1-5 sao)
    @Column(name = "staff_rating", nullable = false)
    private Integer staffRating;

    // Đánh giá thời gian chờ khám (1-5 sao)
    @Column(name = "waiting_time_rating", nullable = false)
    private Integer waitingTimeRating;

    // Đánh giá cơ sở vật chất, vệ sinh (1-5 sao)
    @Column(name = "facility_rating", nullable = false)
    private Integer facilityRating;

    // Đánh giá bác sĩ (1-5 sao)
    @Column(name = "doctor_rating", nullable = false)
    private Integer doctorRating;

    // Góp ý thêm
    @Column(name = "additional_comments", columnDefinition = "NVARCHAR(MAX)")
    private String additionalComments;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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
