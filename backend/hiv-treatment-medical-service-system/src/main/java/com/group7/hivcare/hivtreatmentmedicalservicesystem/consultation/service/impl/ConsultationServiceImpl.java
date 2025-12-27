package com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.dto.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.consultation.service.ConsultationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationServiceImpl implements ConsultationService {
    private final ConsultationSessionRepository sessionRepository;
    private final ConsultationMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final PatientsRepository patientsRepository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional
    public ConsultationSessionDTO startSession(StartConsultationDTO dto, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        Patients patient = patientsRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân"));
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bác sĩ"));

        ConsultationSession session = ConsultationSession.builder()
                .patient(patient)
                .doctor(doctor)
                .createdAt(LocalDateTime.now())
                .status("OPEN")
                .build();
        session = sessionRepository.save(session);

        // Gửi tin nhắn đầu tiên nếu có
        if (dto.getInitialMessage() != null && !dto.getInitialMessage().trim().isEmpty()) {
            ConsultationMessage message = ConsultationMessage.builder()
                    .session(session)
                    .senderType("PATIENT")
                    .senderId(patient.getId())
                    .content(dto.getInitialMessage())
                    .sentAt(LocalDateTime.now())
                    .build();
            messageRepository.save(message);
        }

        return toSessionDTO(session);
    }

    @Override
    public List<ConsultationSessionDTO> getMySessions(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        String role = user.getRole().getName();

        try {
            if ("PATIENT".equals(role)) {
                Patients patient = patientsRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân"));
                return sessionRepository.findByPatient(patient).stream().map(this::toSessionDTO)
                        .collect(Collectors.toList());
            } else if ("DOCTOR".equals(role)) {
                Doctor doctor = doctorRepository.findByUserId(user.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bác sĩ"));
                return sessionRepository.findByDoctor(doctor).stream().map(this::toSessionDTO)
                        .collect(Collectors.toList());
            } else {
                // Cho phép ADMIN và STAFF xem tất cả sessions
                return sessionRepository.findAll().stream().map(this::toSessionDTO).collect(Collectors.toList());
            }
        } catch (EntityNotFoundException e) {
            // Nếu không tìm thấy patient/doctor info, trả về empty list thay vì throw
            // exception
            return List.of();
        }
    }

    @Override
    @Transactional
    public ConsultationMessageDTO sendMessage(Integer sessionId, SendMessageDTO dto, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Phiên tư vấn không tồn tại"));
        String role = user.getRole().getName();
        String senderType;
        Integer senderId;
        if ("PATIENT".equals(role)) {
            Patients patient = patientsRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân"));
            if (!session.getPatient().getId().equals(patient.getId())) {
                throw new IllegalStateException("Bạn không có quyền gửi tin nhắn trong phiên tư vấn này");
            }
            senderType = "PATIENT";
            senderId = patient.getId();
        } else if ("DOCTOR".equals(role)) {
            Doctor doctor = doctorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bác sĩ"));
            if (!session.getDoctor().getId().equals(doctor.getId())) {
                throw new IllegalStateException("Bạn không có quyền gửi tin nhắn trong phiên tư vấn này");
            }
            senderType = "DOCTOR";
            senderId = doctor.getId();
        } else {
            throw new IllegalStateException("Chỉ bệnh nhân hoặc bác sĩ mới được gửi tin nhắn");
        }
        ConsultationMessage message = ConsultationMessage.builder()
                .session(session)
                .senderType(senderType)
                .senderId(senderId)
                .content(dto.getContent())
                .sentAt(LocalDateTime.now())
                .build();
        message = messageRepository.save(message);
        return toMessageDTO(message);
    }

    @Override
    public List<ConsultationMessageDTO> getMessages(Integer sessionId) {
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Phiên tư vấn không tồn tại"));
        return messageRepository.findBySessionOrderBySentAtAsc(session)
                .stream().map(this::toMessageDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void closeSession(Integer sessionId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Phiên tư vấn không tồn tại"));
        String role = user.getRole().getName();
        boolean canClose = false;
        if ("PATIENT".equals(role)) {
            Patients patient = patientsRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân"));
            canClose = session.getPatient().getId().equals(patient.getId());
        } else if ("DOCTOR".equals(role)) {
            Doctor doctor = doctorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bác sĩ"));
            canClose = session.getDoctor().getId().equals(doctor.getId());
        }
        if (!canClose) {
            throw new IllegalStateException("Bạn không có quyền đóng phiên tư vấn này");
        }
        session.setStatus("CLOSED");
        sessionRepository.save(session);
    }

    @Override
    @Transactional
    public void deleteSession(Integer sessionId, Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        ConsultationSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Phiên tư vấn không tồn tại"));
        String role = user.getRole().getName();
        boolean canDelete = false;
        if ("PATIENT".equals(role)) {
            Patients patient = patientsRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bệnh nhân"));
            canDelete = session.getPatient().getId().equals(patient.getId());
        } else if ("DOCTOR".equals(role)) {
            Doctor doctor = doctorRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy thông tin bác sĩ"));
            canDelete = session.getDoctor().getId().equals(doctor.getId());
        }
        if (!canDelete) {
            throw new IllegalStateException("Bạn không có quyền xóa phiên tư vấn này");
        }
        // Xóa tất cả tin nhắn của phiên
        messageRepository.deleteAll(messageRepository.findBySessionOrderBySentAtAsc(session));
        // Xóa phiên tư vấn
        sessionRepository.delete(session);
    }

    // Helper methods
    private ConsultationSessionDTO toSessionDTO(ConsultationSession session) {
        ConsultationSessionDTO dto = new ConsultationSessionDTO();
        dto.setId(session.getId());
        dto.setPatientId(session.getPatient().getId());
        dto.setDoctorId(session.getDoctor().getId());
        dto.setCreatedAt(session.getCreatedAt());
        dto.setStatus(session.getStatus());

        // Kiểm tra quyền của người gọi
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isDoctor = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_DOCTOR"));
        boolean isStaff = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STAFF"));

        // Xử lý tên bệnh nhân theo logic ẩn danh
        // Admin luôn xem được tên thật
        // Bác sĩ và nhân viên chỉ xem được tên thật nếu bệnh nhân không ẩn danh
        if (isAdmin || (!Boolean.TRUE.equals(session.getPatient().getUser().getAnonymous()))) {
            dto.setPatientName(session.getPatient().getUser().getFullName());
        } else {
            dto.setPatientName("Bệnh nhân Ẩn danh");
        }

        // Tên bác sĩ luôn hiển thị
        dto.setDoctorName(session.getDoctor().getUser().getFullName());

        return dto;
    }

    private ConsultationMessageDTO toMessageDTO(ConsultationMessage message) {
        ConsultationMessageDTO dto = new ConsultationMessageDTO();
        dto.setId(message.getId());
        dto.setSessionId(message.getSession().getId());
        dto.setSenderType(message.getSenderType());
        dto.setSenderId(message.getSenderId());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());
        return dto;
    }
}