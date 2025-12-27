package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TreatmentHistoryRepository extends JpaRepository<TreatmentHistory, Integer> {
    
    // Lấy lịch sử điều trị theo treatment plan
    List<TreatmentHistory> findByTreatmentPlanIdOrderByStartDateDesc(Integer treatmentPlanId);
    
    // Lấy lịch sử điều trị theo patient
    @Query("SELECT th FROM TreatmentHistory th WHERE th.treatmentPlan.patient.id = :patientId ORDER BY th.startDate DESC")
    List<TreatmentHistory> findByPatientIdOrderByStartDateDesc(@Param("patientId") Integer patientId);
    
    // Lấy lịch sử điều trị theo doctor
    @Query("SELECT th FROM TreatmentHistory th WHERE th.treatmentPlan.doctor.id = :doctorId ORDER BY th.startDate DESC")
    List<TreatmentHistory> findByDoctorIdOrderByStartDateDesc(@Param("doctorId") Integer doctorId);
    
    // Lấy lịch sử điều trị trong khoảng thời gian
    @Query("SELECT th FROM TreatmentHistory th WHERE th.treatmentPlan.patient.id = :patientId AND th.startDate BETWEEN :startDate AND :endDate ORDER BY th.startDate DESC")
    List<TreatmentHistory> findByPatientIdAndDateRange(@Param("patientId") Integer patientId, 
                                                      @Param("startDate") LocalDate startDate, 
                                                      @Param("endDate") LocalDate endDate);
    
    // Lấy lịch sử thay đổi protocol cụ thể
    List<TreatmentHistory> findByOldArvProtocolIdOrNewArvProtocolIdOrderByStartDateDesc(Integer oldProtocolId, Integer newProtocolId);
}