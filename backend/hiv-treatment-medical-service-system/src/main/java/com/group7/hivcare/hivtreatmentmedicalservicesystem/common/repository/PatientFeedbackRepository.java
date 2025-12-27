package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PatientFeedbackRepository extends JpaRepository<PatientFeedback, Integer> {
    Optional<PatientFeedback> findByAppointmentId(Integer appointmentId);

    boolean existsByAppointmentId(Integer appointmentId);

}
