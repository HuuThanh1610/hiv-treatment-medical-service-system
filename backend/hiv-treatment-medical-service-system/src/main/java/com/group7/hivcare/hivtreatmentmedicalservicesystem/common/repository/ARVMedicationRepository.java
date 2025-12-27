package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;   

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVMedication;

public interface ARVMedicationRepository extends JpaRepository<ARVMedication, Integer> {
    List<ARVMedication> findByActiveTrue();
}
