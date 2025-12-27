package com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewDTO {
    private long totalAppointmentsToday;
    private long totalAppointmentsThisWeek;
    private long totalAppointmentsThisMonth;
    private long totalCompletedAppointments;
    private long totalPendingAppointments;
    private long totalCancelledAppointments;
    private long totalConfirmedAppointments;
    private long totalCheckedInAppointments;
    private long totalActiveDoctors;
    private long totalActivePatients;
    private long totalPendingDayOffRequests;
    private double totalPaidRevenue;

    // Add getter/setter for totalConfirmedAppointments if not using Lombok
}
