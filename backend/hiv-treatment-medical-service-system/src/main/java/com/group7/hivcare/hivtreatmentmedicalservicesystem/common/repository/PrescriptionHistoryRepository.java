package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository cho PrescriptionHistory Entity
 * Chứa các query method để lấy lịch sử thay đổi đơn thuốc
 */
@Repository
public interface PrescriptionHistoryRepository extends JpaRepository<PrescriptionHistory, Integer> {

    // Query lấy lịch sử đơn thuốc theo treatment plan, sắp xếp theo createdAt DESC
    List<PrescriptionHistory> findByTreatmentPlanIdOrderByCreatedAtDesc(Integer treatmentPlanId);

    /**
     * Query chính được Service gọi để lấy lịch sử đơn thuốc của bệnh nhân
     * JOIN qua treatmentPlan.patient để lấy theo patientId
     * ORDER BY createdAt DESC để lịch sử mới nhất hiển thị trước
     */
    @Query("SELECT ph FROM PrescriptionHistory ph WHERE ph.treatmentPlan.patient.id = :patientId ORDER BY ph.createdAt DESC")
    List<PrescriptionHistory> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") Integer patientId);

    // Query lấy lịch sử đơn thuốc theo doctor
    @Query("SELECT ph FROM PrescriptionHistory ph WHERE ph.treatmentPlan.doctor.id = :doctorId ORDER BY ph.createdAt DESC")
    List<PrescriptionHistory> findByDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Integer doctorId);
    
    // Lấy lịch sử đơn thuốc theo prescription cụ thể
    List<PrescriptionHistory> findByPrescriptionIdOrderByCreatedAtDesc(Integer prescriptionId);
    
    // Lấy lịch sử đơn thuốc trong khoảng thời gian
    @Query("SELECT ph FROM PrescriptionHistory ph WHERE ph.treatmentPlan.patient.id = :patientId AND ph.createdAt BETWEEN :startDate AND :endDate ORDER BY ph.createdAt DESC")
    List<PrescriptionHistory> findByPatientIdAndDateRange(@Param("patientId") Integer patientId, 
                                                         @Param("startDate") LocalDate startDate, 
                                                         @Param("endDate") LocalDate endDate);
    
    // Lấy lịch sử đơn thuốc theo lý do thay đổi
    List<PrescriptionHistory> findByChangeReasonContainingIgnoreCaseOrderByCreatedAtDesc(String changeReason);
}
