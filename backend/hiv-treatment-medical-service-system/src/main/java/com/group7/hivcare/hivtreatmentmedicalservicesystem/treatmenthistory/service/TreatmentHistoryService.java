package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.TreatmentHistoryDTO;

import java.time.LocalDate;
import java.util.List;

public interface TreatmentHistoryService {
    
    // Lấy lịch sử điều trị theo treatment plan
    List<TreatmentHistoryDTO> getByTreatmentPlanId(Integer treatmentPlanId);
    
    // Lấy lịch sử điều trị theo patient
    List<TreatmentHistoryDTO> getByPatientId(Integer patientId);
    
    // Lấy lịch sử điều trị theo doctor
    List<TreatmentHistoryDTO> getByDoctorId(Integer doctorId);
    
    // Lấy lịch sử điều trị trong khoảng thời gian
    List<TreatmentHistoryDTO> getByPatientIdAndDateRange(Integer patientId, LocalDate startDate, LocalDate endDate);
    
    // Lấy lịch sử thay đổi protocol cụ thể
    List<TreatmentHistoryDTO> getByProtocolChange(Integer oldProtocolId, Integer newProtocolId);
    

}