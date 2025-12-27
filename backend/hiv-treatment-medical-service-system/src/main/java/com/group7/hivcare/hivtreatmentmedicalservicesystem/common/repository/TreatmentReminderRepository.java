package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TreatmentReminderRepository extends JpaRepository<TreatmentReminder, Integer> {
    
    // Tìm nhắc nhở theo bệnh nhân
    List<TreatmentReminder> findByPatientIdOrderByReminderDateDesc(Integer patientId);
    
    // Tìm nhắc nhở theo bệnh nhân và trạng thái
    List<TreatmentReminder> findByPatientIdAndStatusOrderByReminderDateDesc(Integer patientId, String status);
    
    // Tìm nhắc nhở theo loại
    List<TreatmentReminder> findByReminderTypeOrderByReminderDateDesc(String reminderType);
    
    // Tìm nhắc nhở theo trạng thái
    List<TreatmentReminder> findByStatusOrderByReminderDateDesc(String status);
    
    // Tìm nhắc nhở chưa gửi (PENDING) và đến giờ gửi
    @Query("SELECT tr FROM TreatmentReminder tr WHERE tr.status = 'PENDING' AND tr.reminderDate <= :currentTime")
    List<TreatmentReminder> findPendingRemindersToSend(@Param("currentTime") LocalDateTime currentTime);
    
    // Tìm nhắc nhở theo khoảng thời gian
    @Query("SELECT tr FROM TreatmentReminder tr WHERE tr.reminderDate BETWEEN :startDate AND :endDate ORDER BY tr.reminderDate DESC")
    List<TreatmentReminder> findByReminderDateBetween(@Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate);
    
    // Tìm nhắc nhở theo treatment plan
    List<TreatmentReminder> findByTreatmentPlanIdOrderByReminderDateDesc(Integer treatmentPlanId);
    
    // Tìm nhắc nhở theo appointment
    List<TreatmentReminder> findByAppointmentIdOrderByReminderDateDesc(Integer appointmentId);
    
    // Tìm nhắc nhở theo medication schedule
    List<TreatmentReminder> findByMedicationScheduleIdOrderByReminderDateDesc(Integer medicationScheduleId);
    
    // Đếm nhắc nhở theo trạng thái
    long countByStatus(String status);
    
    // Đếm nhắc nhở theo bệnh nhân và trạng thái
    long countByPatientIdAndStatus(Integer patientId, String status);
    
    // Tìm nhắc nhở bị bỏ lỡ (MISSED)
    @Query("SELECT tr FROM TreatmentReminder tr WHERE tr.status = 'SENT' AND tr.reminderDate < :currentTime ORDER BY tr.reminderDate DESC")
    List<TreatmentReminder> findMissedReminders(@Param("currentTime") LocalDateTime currentTime);
    
    // Tìm nhắc nhở theo bệnh nhân và loại
    List<TreatmentReminder> findByPatientIdAndReminderTypeOrderByReminderDateDesc(Integer patientId, String reminderType);
    
    // Xóa tất cả reminders của một treatment plan
    void deleteByTreatmentPlanId(Integer treatmentPlanId);
    
    // Tìm reminders của các treatment plans không active
    @Query("SELECT tr FROM TreatmentReminder tr WHERE tr.treatmentPlan.active = false AND tr.reminderType = 'Medication'")
    List<TreatmentReminder> findByInactiveTreatmentPlansAndMedicationType();
} 