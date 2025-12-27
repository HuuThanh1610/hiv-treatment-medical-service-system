package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientTreatmentPlan;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentPlanStatus;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PatientTreatmentPlanRepository extends JpaRepository<PatientTreatmentPlan, Integer> {
    List<PatientTreatmentPlan> findByPatientId(Integer patientId);
    List<PatientTreatmentPlan> findByDoctorId(Integer doctorId);
    PatientTreatmentPlan findActiveByPatientId(Integer patientId);
}
