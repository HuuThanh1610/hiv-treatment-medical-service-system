package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabRequestItemDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.DoctorLabRequestDTO;

import java.util.List;

public interface LabRequestService {
    LabRequestDTO create(LabRequestDTO dto);
    LabRequestDTO getById(Integer id);
    List<LabRequestDTO> getAll();
    List<LabRequestDTO> getByPatientId(Integer patientId);
    List<LabRequestDTO> getByDoctorId(Integer doctorId);
    List<LabRequestDTO> getByAppointmentId(Integer appointmentId);
    List<LabRequestDTO> getByStatus(String status);
    List<LabRequestDTO> getUrgentRequests();
    LabRequestDTO update(Integer id, LabRequestDTO dto);
    LabRequestDTO updateStatus(Integer id, String status);
    void delete(Integer id);
    
    // Lab Request Item methods
    LabRequestItemDTO createItem(LabRequestItemDTO dto);
    LabRequestItemDTO getItemById(Integer id);
    List<LabRequestItemDTO> getItemsByLabRequestId(Integer labRequestId);
    LabRequestItemDTO updateItem(Integer id, LabRequestItemDTO dto);
    void deleteItem(Integer id);
    
    // Doctor specific methods
    LabRequestDTO createDoctorLabRequest(DoctorLabRequestDTO dto);
    List<LabRequestDTO> getLabRequestsByDoctorId(Integer doctorId);
    
    // Debug method
    void debugLabRequestData(Integer labRequestId);
    
    // Patient specific methods
    List<LabRequestItemDTO> getMyLabResults(String patientEmail);
    List<LabRequestItemDTO> getMyLabResultsByStatus(String patientEmail, String status);
    List<LabRequestItemDTO> getMyLabResultsByDateRange(String patientEmail, String startDate, String endDate);
    LabRequestItemDTO getMyLabResultItem(String patientEmail, Integer itemId);
} 