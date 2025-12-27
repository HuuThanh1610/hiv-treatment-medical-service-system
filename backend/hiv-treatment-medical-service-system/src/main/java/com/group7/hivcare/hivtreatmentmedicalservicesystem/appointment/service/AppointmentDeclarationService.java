package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.CreateAppointmentWithDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentWithDeclarationDTO;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentDeclarationService {
    
    // Tạo khai báo mới (cần có appointment trước)
    AppointmentDeclarationDTO createDeclaration(AppointmentDeclarationDTO dto);
    
    // Cập nhật khai báo
    AppointmentDeclarationDTO updateDeclaration(Integer id, AppointmentDeclarationDTO dto);
    
    // Lấy khai báo theo ID
    AppointmentDeclarationDTO getById(Integer id);
    
    // Lấy khai báo theo appointmentId
    AppointmentDeclarationDTO getByAppointmentId(Integer appointmentId);
    
    // Lấy tất cả khai báo của một bệnh nhân
    List<AppointmentDeclarationDTO> getByPatientId(Integer patientId);
    
    // Lấy tất cả khai báo của một bác sĩ
    List<AppointmentDeclarationDTO> getByDoctorId(Integer doctorId);
    
    // Kiểm tra trạng thái mang thai của bệnh nhân trong ngày cụ thể
    boolean isPatientPregnant(Integer patientId, LocalDate appointmentDate);
    
    // Lấy danh sách bệnh nhân mang thai trong khoảng thời gian
    List<AppointmentDeclarationDTO> getPregnantPatientsByDateRange(LocalDate startDate, LocalDate endDate);
    
    // Xóa khai báo
    void deleteDeclaration(Integer id);
    
    // Tạo appointment với khai báo sức khỏe
    AppointmentWithDeclarationDTO createAppointmentWithDeclaration(CreateAppointmentWithDeclarationDTO request);
} 