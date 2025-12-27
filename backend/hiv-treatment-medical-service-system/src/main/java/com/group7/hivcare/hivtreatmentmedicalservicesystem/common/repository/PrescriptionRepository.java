package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Prescription;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionMedication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
    List<Prescription> findByTreatmentPlanId(Integer treatmentPlanId);

    List<Prescription> findByTreatmentPlanIdAndActiveTrue(Integer treatmentPlanId);

}