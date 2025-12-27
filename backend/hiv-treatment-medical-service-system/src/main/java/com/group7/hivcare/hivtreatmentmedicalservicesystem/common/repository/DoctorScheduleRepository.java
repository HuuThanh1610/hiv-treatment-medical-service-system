package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DoctorScheduleRepository extends JpaRepository<DoctorSchedule, Integer> {
    List<DoctorSchedule> findByDoctorIdAndStatus(Integer doctorId, com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus status);
    List<DoctorSchedule> findByDoctorId(Integer doctorId);
    List<DoctorSchedule> findByDoctorIdAndDayOfWeek(Integer doctorId, String dayOfWeek);
    List<DoctorSchedule> findByDoctorIdAndDate(Integer doctorId, LocalDate date);
    void deleteByDoctorIdAndDayOfWeek(Integer doctorId, String dayOfWeek);
    void deleteByDoctorIdAndDate(Integer doctorId, LocalDate date);
} 