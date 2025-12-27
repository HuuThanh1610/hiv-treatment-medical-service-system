package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentStatus;
import com.fasterxml.jackson.annotation.JsonSetter;
import lombok.Data;

@Data
public class AppointmentStatusUpdateDTO {
    private AppointmentStatus status;
    private String notes;
    
    // Getter để đảm bảo status luôn là enum
    public AppointmentStatus getStatus() {
        return status;
    }
    
    // Setter với Jackson annotation để xử lý JSON deserialization
    @JsonSetter("status")
    public void setStatus(Object status) {
        if (status instanceof AppointmentStatus) {
            this.status = (AppointmentStatus) status;
        } else if (status instanceof String) {
            try {
                this.status = AppointmentStatus.valueOf(((String) status).toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Trạng thái không hợp lệ: " + status + ". Các trạng thái hợp lệ: PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW");
            }
        } else {
            throw new IllegalArgumentException("Trạng thái phải là string hoặc AppointmentStatus enum");
        }
    }
} 