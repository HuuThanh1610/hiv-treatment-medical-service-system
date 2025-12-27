package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionMedicationId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionMedicationRepository extends JpaRepository<PrescriptionMedication, PrescriptionMedicationId> {
    @Query("SELECT prem FROM PrescriptionMedication prem WHERE prem.prescription.id = :prescriptionId")
    List<PrescriptionMedication> findAllByPrescriptionId(Integer prescriptionId);

    List<PrescriptionMedication> findByPrescriptionId(Integer id);
    
    @Query("SELECT pm FROM PrescriptionMedication pm WHERE pm.prescription.treatmentPlan.id = :treatmentPlanId AND pm.prescription.active = true")
    List<PrescriptionMedication> findByTreatmentPlanIdAndActiveTrue(Integer treatmentPlanId);
    
    @Query("SELECT pm FROM PrescriptionMedication pm WHERE pm.prescription.treatmentPlan.id = :treatmentPlanId AND pm.arvMedication.id = :medicationId AND pm.prescription.active = true")
    Optional<PrescriptionMedication> findByTreatmentPlanIdAndMedicationId(Integer treatmentPlanId, Integer medicationId);
}
