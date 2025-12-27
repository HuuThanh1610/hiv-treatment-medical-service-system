package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentDeclaration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentDeclarationRepository extends JpaRepository<AppointmentDeclaration, Integer> {
    
    // Lấy khai báo theo appointmentId
    Optional<AppointmentDeclaration> findByAppointmentId(Integer appointmentId);
    
    // Lấy tất cả khai báo của một bệnh nhân (thông qua appointment) - sắp xếp theo thời gian tạo khai báo
    @Query("SELECT ad FROM AppointmentDeclaration ad WHERE ad.appointment.patient.id = :patientId ORDER BY ad.createdAt DESC")
    List<AppointmentDeclaration> findByPatientIdOrderByAppointmentDateDesc(@Param("patientId") Integer patientId);
    
    // Lấy tất cả khai báo của một bác sĩ (thông qua appointment) - sắp xếp theo thời gian tạo khai báo
    @Query("SELECT ad FROM AppointmentDeclaration ad WHERE ad.appointment.doctor.id = :doctorId ORDER BY ad.createdAt DESC")
    List<AppointmentDeclaration> findByDoctorIdOrderByAppointmentDateDesc(@Param("doctorId") Integer doctorId);
    
    // Lấy khai báo theo patient và ngày khám (thông qua appointment)
    @Query("SELECT ad FROM AppointmentDeclaration ad WHERE ad.appointment.patient.id = :patientId AND ad.appointment.appointmentDate = :appointmentDate")
    Optional<AppointmentDeclaration> findByPatientIdAndAppointmentDate(@Param("patientId") Integer patientId, @Param("appointmentDate") LocalDate appointmentDate);
    
    // Lấy danh sách bệnh nhân mang thai trong khoảng thời gian
    @Query("SELECT ad FROM AppointmentDeclaration ad WHERE ad.isPregnant = true AND ad.appointment.appointmentDate BETWEEN :startDate AND :endDate")
    List<AppointmentDeclaration> findPregnantPatientsByDateRange(@Param("startDate") LocalDate startDate, 
                                                                @Param("endDate") LocalDate endDate);
    
    // Kiểm tra xem bệnh nhân có khai báo mang thai trong ngày cụ thể không
    @Query("SELECT ad.isPregnant FROM AppointmentDeclaration ad WHERE ad.appointment.patient.id = :patientId AND ad.appointment.appointmentDate = :appointmentDate")
    Optional<Boolean> findPregnantStatusByPatientAndDate(@Param("patientId") Integer patientId, 
                                                        @Param("appointmentDate") LocalDate appointmentDate);
} 