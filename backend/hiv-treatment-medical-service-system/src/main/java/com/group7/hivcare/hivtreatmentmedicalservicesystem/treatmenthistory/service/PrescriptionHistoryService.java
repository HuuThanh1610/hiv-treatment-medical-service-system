package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.PrescriptionHistoryDTO;

import java.time.LocalDate;
import java.util.List;

public interface PrescriptionHistoryService {
    
    // Lấy lịch sử đơn thuốc theo treatment plan
    List<PrescriptionHistoryDTO> getByTreatmentPlanId(Integer treatmentPlanId);
    
    // Lấy lịch sử đơn thuốc theo patient
    List<PrescriptionHistoryDTO> getByPatientId(Integer patientId);
    
    // Lấy lịch sử đơn thuốc theo doctor
    List<PrescriptionHistoryDTO> getByDoctorId(Integer doctorId);
    
    // Lấy lịch sử đơn thuốc theo prescription cụ thể
    List<PrescriptionHistoryDTO> getByPrescriptionId(Integer prescriptionId);
    
    // Lấy lịch sử đơn thuốc trong khoảng thời gian
    List<PrescriptionHistoryDTO> getByPatientIdAndDateRange(Integer patientId, LocalDate startDate, LocalDate endDate);
    
    // Lấy lịch sử đơn thuốc theo lý do thay đổi
    List<PrescriptionHistoryDTO> getByChangeReason(String changeReason);

} 