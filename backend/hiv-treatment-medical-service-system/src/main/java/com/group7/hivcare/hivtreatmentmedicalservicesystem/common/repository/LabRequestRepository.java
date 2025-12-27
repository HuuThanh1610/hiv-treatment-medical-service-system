package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.LabRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabRequestRepository extends JpaRepository<LabRequest, Integer> {
    
    /**
     * Find all lab requests by patient ID
     */
    List<LabRequest> findByPatientId(int patientId);
    
    /**
     * Find all lab requests by doctor ID
     */
    List<LabRequest> findByDoctorId(int doctorId);
    
    /**
     * Find all lab requests by appointment ID
     */
    List<LabRequest> findByAppointmentId(int appointmentId);
    
    /**
     * Find all lab requests by status
     */
    List<LabRequest> findByStatus(String status);
    
    /**
     * Find all urgent lab requests
     */
    List<LabRequest> findByIsUrgentTrue();
    
    /**
     * Find lab requests by patient ID and status
     */
    List<LabRequest> findByPatientIdAndStatus(int patientId, String status);
    
    /**
     * Find lab requests by doctor ID and status
     */
    List<LabRequest> findByDoctorIdAndStatus(int doctorId, String status);
    
    /**
     * Find lab request by ID with lab request items loaded
     */
    @Query("SELECT lr FROM LabRequest lr LEFT JOIN FETCH lr.labRequestItems WHERE lr.id = :id")
    Optional<LabRequest> findByIdWithItems(@Param("id") int id);
    
    /**
     * Find all lab requests with lab request items loaded
     */
    @Query("SELECT lr FROM LabRequest lr LEFT JOIN FETCH lr.labRequestItems")
    List<LabRequest> findAllWithItems();
    
    /**
     * Find lab requests by patient ID with lab request items loaded
     */
    @Query("SELECT lr FROM LabRequest lr LEFT JOIN FETCH lr.labRequestItems WHERE lr.patient.id = :patientId")
    List<LabRequest> findByPatientIdWithItems(@Param("patientId") int patientId);
    
    /**
     * Find lab requests by doctor ID with lab request items loaded
     */
    @Query("SELECT lr FROM LabRequest lr LEFT JOIN FETCH lr.labRequestItems WHERE lr.doctor.id = :doctorId")
    List<LabRequest> findByDoctorIdWithItems(@Param("doctorId") int doctorId);
    
    /**
     * Find lab requests by appointment ID with lab request items loaded
     */
    @Query("SELECT lr FROM LabRequest lr LEFT JOIN FETCH lr.labRequestItems WHERE lr.appointment.id = :appointmentId")
    List<LabRequest> findByAppointmentIdWithItems(@Param("appointmentId") int appointmentId);
    
    /**
     * Find lab requests by status with lab request items loaded
     */
    @Query("SELECT lr FROM LabRequest lr LEFT JOIN FETCH lr.labRequestItems WHERE lr.status = :status")
    List<LabRequest> findByStatusWithItems(@Param("status") String status);
    
    /**
     * Find urgent lab requests with lab request items loaded
     */
    @Query("SELECT lr FROM LabRequest lr LEFT JOIN FETCH lr.labRequestItems WHERE lr.isUrgent = true")
    List<LabRequest> findUrgentWithItems();
} 