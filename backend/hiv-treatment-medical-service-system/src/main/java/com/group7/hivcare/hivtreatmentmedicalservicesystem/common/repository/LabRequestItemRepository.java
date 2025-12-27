package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.LabRequestItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LabRequestItemRepository extends JpaRepository<LabRequestItem, Integer> {
    
    /**
     * Find all lab request items by lab request ID
     */
    List<LabRequestItem> findByLabRequestId(int labRequestId);
    
    /**
     * Find all lab request items by test type ID
     */
    List<LabRequestItem> findByTestTypeId(int testTypeId);
    
    /**
     * Find lab request items by lab request ID and test type ID
     */
    List<LabRequestItem> findByLabRequestIdAndTestTypeId(int labRequestId, int testTypeId);
    
    /**
     * Find lab request item by ID with lab request and test type loaded
     */
    @Query("SELECT lri FROM LabRequestItem lri LEFT JOIN FETCH lri.labRequest LEFT JOIN FETCH lri.testType WHERE lri.id = :id")
    Optional<LabRequestItem> findByIdWithRelations(@Param("id") int id);
    
    /**
     * Find all lab request items by lab request ID with test type loaded
     */
    @Query("SELECT lri FROM LabRequestItem lri LEFT JOIN FETCH lri.testType WHERE lri.labRequest.id = :labRequestId")
    List<LabRequestItem> findByLabRequestIdWithTestType(@Param("labRequestId") int labRequestId);
} 