package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RevisitAppointmentRepository extends JpaRepository<RevisitAppointment, Integer> {
    // Tìm tái khám theo ID lịch hẹn
    Optional<RevisitAppointment> findByAppointmentId(Integer appointmentId);

    // Tìm tất cả tái khám của một bệnh nhân
    List<RevisitAppointment> findByAppointmentPatientId(Integer patientId);

    // Tìm tất cả tái khám của một bác sĩ
    List<RevisitAppointment> findByAppointmentDoctorId(Integer doctorId);

    // Tìm tái khám theo bệnh nhân và ngày
    Optional<RevisitAppointment> findByAppointmentPatientIdAndRevisitDate(Integer patientId, LocalDate revisitDate);

    // Tìm tất cả tái khám theo ngày (để gửi email reminder)
    List<RevisitAppointment> findByRevisitDate(LocalDate revisitDate);

}
