package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleRequest;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorScheduleRequestRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorScheduleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.DoctorScheduleRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.notification.service.EmailNotificationService;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorScheduleRequestServiceImpl implements DoctorScheduleRequestService {
    @Autowired
    private DoctorScheduleRequestRepository requestRepo;
    @Autowired
    private DoctorRepository doctorRepo;
    @Autowired
    private DoctorScheduleRepository scheduleRepo;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Override
    public DoctorScheduleRequestDTO createRequest(DoctorScheduleRequestDTO dto) {
        DoctorScheduleRequest req = new DoctorScheduleRequest();
        req.setSchedule(scheduleRepo.findById(dto.getScheduleId()).orElse(null));
        req.setDoctor(doctorRepo.findById(dto.getDoctorId()).orElse(null));
        req.setReason(dto.getReason());
        req.setStatus(DoctorScheduleRequest.Status.PENDING);
        req.setCreatedAt(java.time.LocalDateTime.now());
        requestRepo.save(req);
        dto.setId(req.getId());
        dto.setStatus(req.getStatus().name());
        return dto;
    }

    @Override
    public List<DoctorScheduleRequestDTO> getAllRequests() {
        return requestRepo.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorScheduleRequestDTO> getRequestsByStatus(String status) {
        return requestRepo.findByStatus(DoctorScheduleRequest.Status.valueOf(status)).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorScheduleRequestDTO> getRequestsByDoctor(Integer doctorId) {
        return requestRepo.findByDoctorId(doctorId).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public DoctorScheduleRequestDTO approveRequest(Integer requestId, Integer substituteDoctorId, String adminNote) {
        DoctorScheduleRequest req = requestRepo.findById(requestId).orElseThrow();
        DoctorSchedule schedule = req.getSchedule();
        Doctor substitute = doctorRepo.findById(substituteDoctorId).orElse(null);
        // Kiểm tra lịch trùng của bác sĩ thay thế
        if (substitute == null) {
            throw new IllegalArgumentException("Bác sĩ thay thế không tồn tại");
        }
        // Lấy tất cả lịch của bác sĩ thay thế trong ngày đó
        java.util.List<com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule> substituteSchedules = scheduleRepo.findByDoctorIdAndDate(substituteDoctorId, schedule.getDate());
        boolean hasConflict = substituteSchedules.stream().anyMatch(s ->
            (s.getStartTime().isBefore(schedule.getEndTime()) && s.getEndTime().isAfter(schedule.getStartTime()))
        );
        if (hasConflict) {
            throw new IllegalStateException("Bác sĩ thay thế đã có lịch trùng trong khung giờ này!");
        }
        req.setStatus(DoctorScheduleRequest.Status.APPROVED);
        req.setAdminNote(adminNote);
        req.setProcessedAt(java.time.LocalDateTime.now());
        req.setSubstituteDoctor(substitute);
        // Đánh dấu lịch của bác sĩ nghỉ là CANCELLED
        schedule.setStatus(com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.CANCELLED);
        scheduleRepo.save(schedule);
        // Tạo lịch mới cho bác sĩ thay thế (nếu muốn clone toàn bộ thông tin ca trực)
        DoctorSchedule newSchedule = new DoctorSchedule();
        newSchedule.setDoctor(substitute);
        newSchedule.setDayOfWeek(schedule.getDayOfWeek());
        newSchedule.setDate(schedule.getDate());
        newSchedule.setStartTime(schedule.getStartTime());
        newSchedule.setEndTime(schedule.getEndTime());
        newSchedule.setNotes("Thay thế cho bác sĩ nghỉ");
        newSchedule.setStatus(com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.ACTIVE);
        scheduleRepo.save(newSchedule);
        requestRepo.save(req);

        // Gửi email thông báo duyệt đơn cho bác sĩ xin nghỉ
        Doctor doctor = req.getDoctor();
        if (doctor != null && doctor.getUser() != null) {
            emailNotificationService.sendLeaveRequestResult(
                doctor.getUser().getEmail(),
                doctor.getUser().getFullName(),
                true,
                null
            );
        }

        // Gửi email thông báo ca trực mới cho bác sĩ thay thế
        if (substitute != null && substitute.getUser() != null) {
            emailNotificationService.sendNewSubstituteScheduleNotification(
                substitute.getUser().getEmail(),
                substitute.getUser().getFullName(),
                newSchedule.getDate().toString(),
                newSchedule.getStartTime().toString(),
                newSchedule.getEndTime().toString(),
                newSchedule.getNotes()
            );
        }
        return toDTO(req);
    }

    @Override
    public DoctorScheduleRequestDTO rejectRequest(Integer requestId, String adminNote) {
        DoctorScheduleRequest req = requestRepo.findById(requestId).orElseThrow();
        req.setStatus(DoctorScheduleRequest.Status.REJECTED);
        req.setAdminNote(adminNote);
        req.setProcessedAt(java.time.LocalDateTime.now());
        requestRepo.save(req);

        // Gửi email thông báo từ chối đơn cho bác sĩ
        Doctor doctor = req.getDoctor();
        if (doctor != null && doctor.getUser() != null) {
            emailNotificationService.sendLeaveRequestResult(
                doctor.getUser().getEmail(),
                doctor.getUser().getFullName(),
                false,
                adminNote
            );
        }
        return toDTO(req);
    }

    private DoctorScheduleRequestDTO toDTO(DoctorScheduleRequest req) {
        DoctorScheduleRequestDTO dto = new DoctorScheduleRequestDTO();
        dto.setId(req.getId());
        dto.setScheduleId(req.getSchedule() != null ? req.getSchedule().getId() : null);
        dto.setDoctorId(req.getDoctor() != null ? req.getDoctor().getId() : null);
        dto.setDoctorName(req.getDoctor() != null ? req.getDoctor().getUser().getFullName() : null);
        dto.setReason(req.getReason());
        dto.setStatus(req.getStatus().name());
        dto.setSubstituteDoctorId(req.getSubstituteDoctor() != null ? req.getSubstituteDoctor().getId() : null);
        dto.setSubstituteDoctorName(req.getSubstituteDoctor() != null ? req.getSubstituteDoctor().getUser().getFullName() : null);
        dto.setAdminNote(req.getAdminNote());
        dto.setCreatedAt(req.getCreatedAt());
        dto.setProcessedAt(req.getProcessedAt());
        return dto;
    }
}
