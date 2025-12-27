package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

public enum AppointmentStatus {
    PENDING,       // Đặt lịch xong, chưa xác nhận
    CONFIRMED,     // Bệnh nhân đã xác nhận lịch -> staff thao tác
    CHECKED_IN,    // Đã đến khám (check-in) -> bệnh nhân thao tác
    COMPLETED,     // Đã khám xong -> bác sĩ thao tác
    CANCELLED,     // Đã hủy -> staff thao tác
    NO_SHOW        // Không đến khám
}