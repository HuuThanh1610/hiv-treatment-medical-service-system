package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.MedicationSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedicationScheduleRepository extends JpaRepository<MedicationSchedule, Integer> {
    
    // Tìm medication schedule theo treatment plan
    List<MedicationSchedule> findByTreatmentPlanId(Integer treatmentPlanId);
    
    // Tìm medication schedule theo patient
    List<MedicationSchedule> findByTreatmentPlanPatientId(Integer patientId);
} 