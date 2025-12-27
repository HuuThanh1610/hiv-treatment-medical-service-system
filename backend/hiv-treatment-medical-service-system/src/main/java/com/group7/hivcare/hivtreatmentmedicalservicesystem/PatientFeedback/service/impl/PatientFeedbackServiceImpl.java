package com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.CreatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.PatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.dto.UpdatePatientFeedbackDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.mapper.PatientFeedbackMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.PatientFeedback.service.PatientFeedbackService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientFeedback;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientFeedbackRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientFeedbackServiceImpl implements PatientFeedbackService {
    private final PatientFeedbackRepository feedbackRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientFeedbackMapper feedbackMapper;

    @Override
    @Transactional
    public PatientFeedbackDTO createFeedback(CreatePatientFeedbackDTO dto) {
        // Validate appointmentId
        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy lịch hẹn với ID: " + dto.getAppointmentId()));

        // Kiểm tra appointment phải có status COMPLETED
        if (!"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
            throw new IllegalArgumentException("Chỉ có thể đánh giá lịch hẹn đã hoàn thành.");
        }

        // Kiểm tra nếu feedback đã tồn tại cho appointment này
        if (feedbackRepository.existsByAppointmentId(dto.getAppointmentId())) {
            throw new IllegalArgumentException("Feedback cho lịch hẹn này đã tồn tại.");
        }

        PatientFeedback feedback = feedbackMapper.toEntity(dto, appointment);
        PatientFeedback saved = feedbackRepository.save(feedback);
        return feedbackMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public PatientFeedbackDTO updateFeedback(Integer id, UpdatePatientFeedbackDTO dto) {
        PatientFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy feedback với ID: " + id));

        feedbackMapper.toEntity(dto, feedback);
        PatientFeedback updated = feedbackRepository.save(feedback);
        return feedbackMapper.toDTO(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientFeedbackDTO getFeedbackById(Integer id) {
        PatientFeedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy feedback với ID: " + id));
        return feedbackMapper.toDTO(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientFeedbackDTO getFeedbackByAppointmentId(Integer appointmentId) {
        PatientFeedback feedback = feedbackRepository.findByAppointmentId(appointmentId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy feedback với appointment ID: " + appointmentId));
        return feedbackMapper.toDTO(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientFeedbackDTO> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(feedbackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientFeedbackDTO> getFeedbacksByDoctorId(Integer doctorId) {
        return feedbackRepository.findAll().stream()
                .filter(feedback -> feedback.getAppointment().getDoctor().getId().equals(doctorId))
                .map(feedbackMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canPatientProvideFeedback(Integer appointmentId) {
        // Kiểm tra appointment tồn tại và có status COMPLETED
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElse(null);

        if (appointment == null || !"COMPLETED".equalsIgnoreCase(appointment.getStatus())) {
            return false;
        }

        // Kiểm tra chưa có feedback
        return !feedbackRepository.existsByAppointmentId(appointmentId);
    }

}
