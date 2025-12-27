package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabResultMessageDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabResultNotificationRequestDTO;

import java.util.List;

public interface LabResultMessageService {
    
    /**
     * Tạo thông báo khi nhập chỉ số xét nghiệm
     */
    LabResultMessageDTO createLabResultNotification(LabResultNotificationRequestDTO request);
    
    /**
     * Lấy tất cả thông báo của bệnh nhân
     */
    List<LabResultMessageDTO> getPatientNotifications(Integer patientId);
    
    /**
     * Lấy tất cả thông báo của bác sĩ
     */
    List<LabResultMessageDTO> getDoctorNotifications(Integer doctorId);
    
    /**
     * Lấy thông báo chưa đọc của bệnh nhân
     */
    List<LabResultMessageDTO> getUnreadPatientNotifications(Integer patientId);
    
    /**
     * Lấy thông báo chưa đọc của bác sĩ
     */
    List<LabResultMessageDTO> getUnreadDoctorNotifications(Integer doctorId);
    
    /**
     * Đánh dấu thông báo đã đọc
     */
    void markNotificationAsRead(Integer labRequestItemId);
    
    /**
     * Phân tích kết quả và tạo thông báo tự động
     */
    LabResultMessageDTO analyzeAndCreateNotification(Integer labRequestItemId, String resultValue);
    
    /**
     * Lấy thông báo quan trọng (HIGH, CRITICAL)
     */
    List<LabResultMessageDTO> getImportantNotifications();
    
    /**
     * Đếm số thông báo chưa đọc của bệnh nhân
     */
    long countUnreadPatientNotifications(Integer patientId);
    
    /**
     * Đếm số thông báo chưa đọc của bác sĩ
     */
    long countUnreadDoctorNotifications(Integer doctorId);
} 