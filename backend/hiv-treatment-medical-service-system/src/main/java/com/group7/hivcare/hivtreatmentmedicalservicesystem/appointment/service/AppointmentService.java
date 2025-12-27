package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentResponseDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AvailableSlotDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentStatusUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.CreateAppointmentWithDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentWithDeclarationDTO;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {
    List<AppointmentResponseDTO> getSubstituteDoctorAppointments(Integer doctorId);
    AppointmentResponseDTO createAppointment(AppointmentRequestDTO request, Integer patientId);
    AppointmentResponseDTO getAppointmentById(Integer id);
    AppointmentResponseDTO getAppointmentByIdForPatient(Integer id, String username);
    AppointmentResponseDTO getAppointmentByIdForDoctor(Integer id, String username);
    List<AppointmentResponseDTO> getPatientAppointments(Integer patientId);
    List<AppointmentResponseDTO> getDoctorAppointments(Integer doctorId);
    AppointmentResponseDTO updateAppointment(Integer id, AppointmentRequestDTO request);
    AppointmentResponseDTO updateAppointmentStatus(Integer id, AppointmentStatusUpdateDTO statusUpdateDTO);
    void deleteAppointment(Integer id, String cancellationReason);
    AppointmentResponseDTO confirmAppointment(Integer id, Integer doctorId);
    List<AppointmentResponseDTO> getAllAppointments();
    List<AvailableSlotDTO> getDoctorAvailableSlots(Integer doctorId, LocalDate date);
    AppointmentResponseDTO updateSubstituteDoctor(Integer appointmentId, Integer substituteDoctorId);
    
    // Tạo appointment với khai báo sức khỏe
    AppointmentWithDeclarationDTO createAppointmentWithDeclaration(CreateAppointmentWithDeclarationDTO request);
    
    // Bệnh nhân check-in lịch khám
    AppointmentResponseDTO patientCheckIn(Integer appointmentId, Integer patientId);
}