package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    List<Appointment> findBySubstituteDoctorId(Integer substituteDoctorId);
    List<Appointment> findByDoctorIdAndAppointmentDate(Integer doctorId, LocalDate appointmentDate);
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(Integer doctorId, LocalDate appointmentDate, String status);
    
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :appointmentDate AND CAST(a.appointmentTime AS string) = CAST(:appointmentTime AS string)")
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTime(@Param("doctorId") Integer doctorId, @Param("appointmentDate") LocalDate appointmentDate, @Param("appointmentTime") LocalTime appointmentTime);
    
    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :appointmentDate AND CAST(a.appointmentTime AS string) = CAST(:appointmentTime AS string) AND a.id != :id")
    boolean existsByDoctorIdAndAppointmentDateAndAppointmentTimeAndIdNot(@Param("doctorId") Integer doctorId, @Param("appointmentDate") LocalDate appointmentDate, @Param("appointmentTime") LocalTime appointmentTime, @Param("id") Integer id);
    
    List<Appointment> findByPatientId(Integer patientId);
    List<Appointment> findByDoctorId(Integer doctorId);
} 