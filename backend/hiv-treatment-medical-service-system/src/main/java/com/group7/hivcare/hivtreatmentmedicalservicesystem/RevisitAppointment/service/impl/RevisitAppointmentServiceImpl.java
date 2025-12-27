package com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.CreateRevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.dto.RevisitAppointmentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.mapper.RevisitAppointmentMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.RevisitAppointment.service.RevisitAppointmentService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.RevisitAppointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.RevisitAppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.email.service.EmailService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevisitAppointmentServiceImpl implements RevisitAppointmentService {
    private final RevisitAppointmentRepository revisitAppointmentRepository;
    private final AppointmentRepository appointmentRepository;
    private final RevisitAppointmentMapper revisitAppointmentMapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public RevisitAppointmentDTO createRevisitAppointment(CreateRevisitAppointmentDTO dto) {
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + dto.getAppointmentId()));

        // Kiểm tra xem đã có tái khám cho lịch hẹn này chưa
        revisitAppointmentRepository.findByAppointmentId(dto.getAppointmentId())
                .ifPresent(existing -> {
                    throw new IllegalStateException("Lịch hẹn này đã có thông tin tái khám");
                });

        RevisitAppointment entity = revisitAppointmentMapper.convertToEntity(dto);
        entity.setAppointment(appointment);
        RevisitAppointment saved = revisitAppointmentRepository.save(entity);
        
        // Gửi email thông báo tạo lịch hẹn tái khám
        try {
            String patientEmail = appointment.getPatient().getUser().getEmail();
            String patientName = appointment.getPatient().getUser().getFullName();
            String doctorName = appointment.getDoctor().getUser().getFullName();
            String revisitDateStr = saved.getRevisitDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            
            emailService.sendRevisitAppointmentCreatedEmail(
                patientEmail, 
                patientName, 
                doctorName, 
                revisitDateStr, 
                saved.getRevisitNotes()
            );
            
            log.info("Đã gửi email thông báo tạo lịch hẹn tái khám đến: {}", patientEmail);
        } catch (Exception e) {
            log.error("Lỗi khi gửi email thông báo tạo lịch hẹn tái khám: ", e);
            // Không throw exception để không ảnh hưởng đến việc tạo lịch hẹn
        }
        
        return revisitAppointmentMapper.convertToDTO(saved);
    }

    @Override
    public RevisitAppointmentDTO getById(Integer id) {
        RevisitAppointment entity = revisitAppointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tái khám với ID: " + id));
        return revisitAppointmentMapper.convertToDTO(entity);
    }

    @Override
    public RevisitAppointmentDTO getByAppointmentId(Integer appointmentId) {
        RevisitAppointment entity = revisitAppointmentRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tái khám cho lịch hẹn với ID: " + appointmentId));
        return revisitAppointmentMapper.convertToDTO(entity);
    }

    @Override
    public List<RevisitAppointmentDTO> getByPatientId(Integer patientId) {
        return revisitAppointmentRepository.findByAppointmentPatientId(patientId).stream()
                .map(revisitAppointmentMapper::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<RevisitAppointmentDTO> getByDoctorId(Integer doctorId) {
        return revisitAppointmentRepository.findByAppointmentDoctorId(doctorId).stream()
                .map(revisitAppointmentMapper::convertToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteRevisitAppointment(Integer id, Integer doctorId) {
        RevisitAppointment entity = revisitAppointmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy tái khám với ID: " + id));

        // Kiểm tra quyền truy cập của bác sĩ
        if (!entity.getAppointment().getDoctor().getId().equals(doctorId)) {
            throw new IllegalStateException("Bác sĩ không có quyền xóa tái khám này");
        }

        revisitAppointmentRepository.deleteById(id);
    }
}
