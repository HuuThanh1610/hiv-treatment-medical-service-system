package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto;

import java.time.LocalDateTime;

public class DoctorScheduleRequestDTO {
    private Integer id;
    private Integer scheduleId;
    private Integer doctorId;
    private String doctorName;
    private String reason;
    private String status;
    private Integer substituteDoctorId;
    private String substituteDoctorName;
    private String adminNote;
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Integer getScheduleId() { return scheduleId; }
    public void setScheduleId(Integer scheduleId) { this.scheduleId = scheduleId; }
    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }
    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getSubstituteDoctorId() { return substituteDoctorId; }
    public void setSubstituteDoctorId(Integer substituteDoctorId) { this.substituteDoctorId = substituteDoctorId; }
    public String getSubstituteDoctorName() { return substituteDoctorName; }
    public void setSubstituteDoctorName(String substituteDoctorName) { this.substituteDoctorName = substituteDoctorName; }
    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
}
