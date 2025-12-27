package com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.dto.AdminOverviewDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.admin.service.AdminOverviewService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorScheduleRequestRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PaymentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;

@Service
public class AdminOverviewServiceImpl implements AdminOverviewService {

    @Autowired
    private AppointmentRepository appointmentRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private PatientsRepository patientsRepository;
    @Autowired
    private DoctorScheduleRequestRepository doctorScheduleRequestRepository;
    @Autowired
    private PaymentRepository paymentRepository;

    @Override
    public AdminOverviewDTO getOverview() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(DayOfWeek.SUNDAY);
        LocalDate startOfMonth = today.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth());

        long totalAppointmentsToday = appointmentRepository.findAll().stream()
                .filter(a -> today.equals(a.getAppointmentDate()))
                .count();
        long totalAppointmentsThisWeek = appointmentRepository.findAll().stream()
                .filter(a -> !a.getAppointmentDate().isBefore(startOfWeek) && !a.getAppointmentDate().isAfter(endOfWeek))
                .count();
        long totalAppointmentsThisMonth = appointmentRepository.findAll().stream()
                .filter(a -> !a.getAppointmentDate().isBefore(startOfMonth) && !a.getAppointmentDate().isAfter(endOfMonth))
                .count();
        long totalCompletedAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "COMPLETED".equalsIgnoreCase(a.getStatus()))
                .count();
        long totalConfirmedAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "CONFIRMED".equalsIgnoreCase(a.getStatus()))
                .count();
        long totalPendingAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "PENDING".equalsIgnoreCase(a.getStatus()))
                .count();
        long totalCancelledAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "CANCELLED".equalsIgnoreCase(a.getStatus()))
                .count();
        long totalActiveDoctors = doctorRepository.findAll().stream()
                .filter(d -> d.getUser() != null && Boolean.TRUE.equals(d.getUser().getActive()))
                .count();
        // Đếm bệnh nhân active (có user active và role PATIENT)
        long totalActivePatients = patientsRepository.findAll().stream()
            .filter(p -> p.getUser() != null
                    && Boolean.TRUE.equals(p.getUser().getActive())
                    && p.getUser().getRole() != null
                    && "PATIENT".equalsIgnoreCase(p.getUser().getRole().getName()))
            .count();
        long totalPendingDayOffRequests = doctorScheduleRequestRepository.findByStatus(DoctorScheduleRequest.Status.PENDING).size();
        
        // Tính tổng số lượt khám đã check-in
        long totalCheckedInAppointments = appointmentRepository.findAll().stream()
                .filter(a -> "CHECKED_IN".equalsIgnoreCase(a.getStatus()))
                .count();
        
        // Tính tổng doanh thu đã thanh toán
        double totalPaidRevenue = paymentRepository.getTotalPaidRevenue() != null ? 
                paymentRepository.getTotalPaidRevenue().doubleValue() : 0.0;

        return new AdminOverviewDTO(
                totalAppointmentsToday,
                totalAppointmentsThisWeek,
                totalAppointmentsThisMonth,
                totalCompletedAppointments,
                totalPendingAppointments,
                totalCancelledAppointments,
                totalConfirmedAppointments,
                totalActiveDoctors,
                totalActivePatients,
                totalPendingDayOffRequests,
                totalCheckedInAppointments,
                totalPaidRevenue
        );
    }
}
