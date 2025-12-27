package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class DoctorScheduleRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private DoctorSchedule schedule;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor; // Người gửi yêu cầu

    @Enumerated(EnumType.STRING)
    private Status status; // PENDING, APPROVED, REJECTED

    @ManyToOne
    @JoinColumn(name = "substitute_doctor_id")
    private Doctor substituteDoctor; // Bác sĩ thay thế

    @Column(name = "reason", columnDefinition = "NVARCHAR(225)")
    private String reason;

    @Column(name = "admin_note", columnDefinition = "NVARCHAR(225)")
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public enum Status {
        PENDING, APPROVED, REJECTED
    }

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }
    public DoctorSchedule getSchedule() {
        return schedule;
    }
    public void setSchedule(DoctorSchedule schedule) {
        this.schedule = schedule;
    }
    public Doctor getDoctor() {
        return doctor;
    }
    public void setDoctor(Doctor doctor) {
        this.doctor = doctor;
    }
    public Status getStatus() {
        return status;
    }
    public void setStatus(Status status) {
        this.status = status;
    }
    public Doctor getSubstituteDoctor() {
        return substituteDoctor;
    }
    public void setSubstituteDoctor(Doctor substituteDoctor) {
        this.substituteDoctor = substituteDoctor;
    }
    public String getReason() {
        return reason;
    }
    public void setReason(String reason) {
        this.reason = reason;
    }
    public String getAdminNote() {
        return adminNote;
    }
    public void setAdminNote(String adminNote) {
        this.adminNote = adminNote;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    public LocalDateTime getProcessedAt() {
        return processedAt;
    }
    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
