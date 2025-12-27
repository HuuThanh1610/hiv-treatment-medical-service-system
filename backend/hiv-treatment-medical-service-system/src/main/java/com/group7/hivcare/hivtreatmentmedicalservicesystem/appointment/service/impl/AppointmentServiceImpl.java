package com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentResponseDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AvailableSlotDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.MedicalServicesRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientsRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorScheduleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service.AppointmentService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentStatus;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.MedicalServices;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.exception.customexceptions.NotFoundException;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentStatusUpdateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.CreateAppointmentWithDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentWithDeclarationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.service.AppointmentDeclarationService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service.TreatmentReminderService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.DoctorScheduleService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.service.PaymentService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalServicesRepository medicalServicesRepository;
    private final PatientsRepository patientsRepository;
    private final EmailNotificationService emailNotificationService;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final TreatmentReminderService treatmentReminderService;
    private final AppointmentDeclarationService appointmentDeclarationService;
    private final DoctorScheduleService doctorScheduleService;
    private final PaymentService paymentService;

    @Override
    @Transactional
    public AppointmentResponseDTO createAppointment(AppointmentRequestDTO request, Integer patientId) {
        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bác sĩ với ID: " + request.getDoctorId()));
        MedicalServices medicalService = medicalServicesRepository.findById(request.getMedicalServiceId())
                .orElseThrow(() -> new NotFoundException(
                        "Không tìm thấy dịch vụ y tế với ID: " + request.getMedicalServiceId()));
        Patients patient = patientsRepository.findById(patientId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bệnh nhân với ID: " + patientId));

        // Validate time slot
        List<LocalTime> allowedTimeSlots = Arrays.asList(
                LocalTime.of(8, 0), // 8:00
                LocalTime.of(9, 0), // 9:00
                LocalTime.of(10, 0), // 10:00
                LocalTime.of(14, 0), // 14:00
                LocalTime.of(15, 0), // 15:00
                LocalTime.of(16, 0) // 16:00
        );

        if (!allowedTimeSlots.contains(request.getAppointmentTime())) {
            throw new IllegalStateException(
                    "Thời gian đặt lịch không hợp lệ. Chỉ có thể đặt lịch vào các khung giờ: 8:00, 9:00, 10:00, 14:00, 15:00, 16:00");
        }

        // Check for appointment conflicts
        if (appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                doctor.getId(),
                request.getAppointmentDate(),
                request.getAppointmentTime())) {
            throw new IllegalStateException("Bác sĩ đã có lịch hẹn vào thời gian này");
        }

        // Check max appointments per day
        List<Appointment> appointmentsForDay = appointmentRepository.findByDoctorIdAndAppointmentDate(
                doctor.getId(),
                request.getAppointmentDate());

        // Count only confirmed appointments
        long confirmedAppointments = appointmentsForDay.stream()
                .filter(a -> a.getStatus().equals(AppointmentStatus.CONFIRMED.name())
                        || a.getStatus().equals(AppointmentStatus.CHECKED_IN.name())
                        || a.getStatus().equals(AppointmentStatus.COMPLETED.name()))
                .count();

        if (doctor.getMaxAppointmentsPerDay() != null &&
                confirmedAppointments >= doctor.getMaxAppointmentsPerDay()) {
            throw new IllegalStateException("Bác sĩ đã đạt giới hạn số lịch hẹn trong ngày (" +
                    doctor.getMaxAppointmentsPerDay() + " lịch/ngày)");
        }

        Appointment appointment = Appointment.builder()
                .patient(patient)
                .doctor(doctor)
                .medicalService(medicalService)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime())
                .status(AppointmentStatus.PENDING.name())
                .notes(request.getNotes())
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Tự động tạo nhắc nhở tái khám khi tạo lịch hẹn
        try {
            treatmentReminderService.createAppointmentReminder(savedAppointment.getId());
            log.info("Created appointment reminder for appointment: {}", savedAppointment.getId());
        } catch (Exception e) {
            log.error("Failed to create appointment reminder for appointment {}: {}", savedAppointment.getId(),
                    e.getMessage());
        }

        return convertToDTO(savedAppointment);
    }

    @Override
    public List<AppointmentResponseDTO> getDoctorAppointments(Integer doctorId) {
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctorId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AppointmentResponseDTO> getSubstituteDoctorAppointments(Integer doctorId) {
        List<Appointment> appointments = appointmentRepository.findBySubstituteDoctorId(doctorId);
        return appointments.stream().map(this::convertToDTO).toList();
    }

    @Override
    public AppointmentResponseDTO getAppointmentById(Integer id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với ID: " + id));
        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO updateAppointment(Integer id, AppointmentRequestDTO request) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với ID: " + id));

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy bác sĩ với ID: " + request.getDoctorId()));
        MedicalServices medicalService = medicalServicesRepository.findById(request.getMedicalServiceId())
                .orElseThrow(() -> new NotFoundException(
                        "Không tìm thấy dịch vụ y tế với ID: " + request.getMedicalServiceId()));

        // Validate time slot
        List<LocalTime> allowedTimeSlots = Arrays.asList(
                LocalTime.of(8, 0), // 8:00
                LocalTime.of(9, 0), // 9:00
                LocalTime.of(10, 0), // 10:00
                LocalTime.of(14, 0), // 14:00
                LocalTime.of(15, 0), // 15:00
                LocalTime.of(16, 0) // 16:00
        );

        if (!allowedTimeSlots.contains(request.getAppointmentTime())) {
            throw new IllegalStateException(
                    "Thời gian đặt lịch không hợp lệ. Chỉ có thể đặt lịch vào các khung giờ: 8:00, 9:00, 10:00, 14:00, 15:00, 16:00");
        }

        // Check doctor's schedule
        List<DoctorSchedule> doctorSchedules = doctorScheduleRepository.findByDoctorIdAndDate(
                doctor.getId(),
                request.getAppointmentDate());

        // Check if requested time is within doctor's working hours
        boolean isTimeSlotAvailable = false;
        for (DoctorSchedule schedule : doctorSchedules) {
            LocalTime startTime = schedule.getStartTime();
            LocalTime endTime = schedule.getEndTime();
            LocalTime requestedTime = request.getAppointmentTime();

            // Check if requested time is within the schedule's time range
            if (!requestedTime.isBefore(startTime) && !requestedTime.isAfter(endTime)) {
                isTimeSlotAvailable = true;
                break;
            }
        }

        if (isTimeSlotAvailable) {
            throw new IllegalStateException("Bác sĩ đã có lịch làm việc vào khung giờ này");
        }

        // Check max appointments per day
        List<Appointment> appointmentsForDay = appointmentRepository.findByDoctorIdAndAppointmentDate(
                doctor.getId(),
                request.getAppointmentDate());

        // Count only confirmed appointments, excluding current appointment
        long confirmedAppointments = appointmentsForDay.stream()
                .filter(a -> !a.getId().equals(appointment.getId()) &&
                        (a.getStatus().equals(AppointmentStatus.CONFIRMED.name())
                        || a.getStatus().equals(AppointmentStatus.CHECKED_IN.name())
                        || a.getStatus().equals(AppointmentStatus.COMPLETED.name())))
                .count();

        if (doctor.getMaxAppointmentsPerDay() != null &&
                confirmedAppointments >= doctor.getMaxAppointmentsPerDay()) {
            throw new IllegalStateException("Bác sĩ đã đạt giới hạn số lịch hẹn trong ngày (" +
                    doctor.getMaxAppointmentsPerDay() + " lịch/ngày)");
        }

        // UpdateRevisitAppointmentDTO appointment details
        appointment.setDoctor(doctor);
        appointment.setMedicalService(medicalService);
        appointment.setAppointmentDate(request.getAppointmentDate());
        appointment.setAppointmentTime(request.getAppointmentTime());
        appointment.setNotes(request.getNotes());

        // Reset status to PENDING for update
        appointment.setStatus(AppointmentStatus.PENDING.name());

        return convertToDTO(appointmentRepository.save(appointment));
    }

    @Override
    public List<AppointmentResponseDTO> getPatientAppointments(Integer patientId) {
        List<Appointment> appointments = appointmentRepository.findByPatientId(patientId);
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponseDTO confirmAppointment(Integer id, Integer doctorId) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với ID: " + id));

        if (!appointment.getDoctor().getId().equals(doctorId)) {
            throw new IllegalStateException("Bác sĩ không có quyền xác nhận lịch hẹn này");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED.name());
        return convertToDTO(appointmentRepository.save(appointment));
    }

    @Override
    @Transactional
    public void deleteAppointment(Integer id, String cancellationReason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với ID: " + id));

        // UpdateRevisitAppointmentDTO status to CANCELLED instead of deleting
        appointment.setStatus(AppointmentStatus.CANCELLED.name());
        appointment.setNotes(cancellationReason);
        appointmentRepository.save(appointment);

        // Send notification emails
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // Send notification to patient
        emailNotificationService.sendAppointmentCancellation(
                appointment.getPatient().getUser().getEmail(),
                appointment.getPatient().getUser().getFullName(),
                appointment.getDoctor().getUser().getFullName(),
                appointment.getAppointmentDate().format(dateFormatter),
                appointment.getAppointmentTime().format(timeFormatter),
                appointment.getMedicalService().getName(),
                cancellationReason);

        // Send notification to doctor
        emailNotificationService.sendAppointmentCancellation(
                appointment.getDoctor().getUser().getEmail(),
                appointment.getDoctor().getUser().getFullName(),
                appointment.getPatient().getUser().getFullName(),
                appointment.getAppointmentDate().format(dateFormatter),
                appointment.getAppointmentTime().format(timeFormatter),
                appointment.getMedicalService().getName(),
                cancellationReason);
    }



    @Override
    public List<AppointmentResponseDTO> getAllAppointments() {
        List<Appointment> appointments = appointmentRepository.findAll();
        return appointments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AvailableSlotDTO> getDoctorAvailableSlots(Integer doctorId, LocalDate date) {

        // Lấy lịch làm việc của bác sĩ cho ngày cụ thể
        List<DoctorSchedule> doctorSchedules = doctorScheduleRepository.findByDoctorIdAndDate(doctorId, date);

        // Lấy danh sách các lịch hẹn đã xác nhận cho ngày đó
        List<Appointment> confirmedAppointments = appointmentRepository.findByDoctorIdAndAppointmentDateAndStatus(
                doctorId, date, AppointmentStatus.CONFIRMED.name());

        // Tạo danh sách các khung giờ có sẵn
        List<AvailableSlotDTO> availableSlots = new ArrayList<>();
        List<LocalTime> allowedTimes = Arrays.asList(
                LocalTime.of(8, 0), // 8:00
                LocalTime.of(9, 0), // 9:00
                LocalTime.of(10, 0), // 10:00
                LocalTime.of(14, 0), // 14:00
                LocalTime.of(15, 0), // 15:00
                LocalTime.of(16, 0) // 16:00
        );

        // Kiểm tra từng khung giờ cho phép
        for (LocalTime time : allowedTimes) {
            boolean isAvailable = true;

            // Kiểm tra xem khung giờ có nằm trong lịch làm việc của bác sĩ không
            boolean isInSchedule = doctorSchedules.stream()
                    .anyMatch(schedule -> !time.isBefore(schedule.getStartTime()) &&
                            !time.isAfter(schedule.getEndTime().minusMinutes(30)));

            if (isInSchedule) {
                continue; // Bỏ qua nếu đã có trong lịch làm việc
            }

            // Kiểm tra xem khung giờ đã được đặt chưa
            for (Appointment appointment : confirmedAppointments) {
                if (appointment.getAppointmentTime().equals(time)) {
                    isAvailable = false;
                    break;
                }
            }

            if (isAvailable) {
                availableSlots.add(new AvailableSlotDTO(time, true));
            }
        }

        return availableSlots;
    }

    @Override
    public AppointmentResponseDTO getAppointmentByIdForPatient(Integer id, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với id: " + id));

        if (!appointment.getPatient().getUser().getEmail().equals(username)) {
            throw new NotFoundException("Bạn không có quyền xem lịch hẹn này");
        }

        return convertToDTO(appointment);
    }

    @Override
    public AppointmentResponseDTO getAppointmentByIdForDoctor(Integer id, String username) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với id: " + id));

        if (!appointment.getDoctor().getUser().getEmail().equals(username)) {
            throw new NotFoundException("Bạn không có quyền xem lịch hẹn này");
        }

        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO updateAppointmentStatus(Integer id, AppointmentStatusUpdateDTO statusUpdateDTO) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với ID: " + id));

        // Validate status
        if (statusUpdateDTO.getStatus() == null) {
            throw new IllegalArgumentException("Trạng thái không được để trống");
        }

        // Validate status transition and convert to uppercase
        String newStatus = statusUpdateDTO.getStatus().name().toUpperCase();


        // Validate status value
        try {
            AppointmentStatus.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + newStatus +
                    ". Các trạng thái hợp lệ: PENDING, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED, NO_SHOW");
        }

        // UpdateRevisitAppointmentDTO status and notes
        appointment.setStatus(newStatus);
        if (statusUpdateDTO.getNotes() != null && !statusUpdateDTO.getNotes().trim().isEmpty()) {
            appointment.setNotes(statusUpdateDTO.getNotes());
        }

        Appointment savedAppointment = appointmentRepository.save(appointment);

        // Send notification based on status change
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        switch (newStatus) {
            case "CONFIRMED":
                // Tự động tạo lịch bác sĩ khi xác nhận lịch hẹn
                try {
                    createDoctorScheduleForAppointment(appointment);
                } catch (Exception e) {
                    log.warn("Không thể tạo lịch bác sĩ tự động cho appointment ID {}: {}", 
                        appointment.getId(), e.getMessage());
                }

                // Send notification to doctor
                emailNotificationService.sendStaffApprovalNotification(
                        appointment.getDoctor().getUser().getEmail(),
                        appointment.getDoctor().getUser().getFullName(),
                        appointment.getPatient().getUser().getFullName(),
                        savedAppointment.getAppointmentDate().format(dateFormatter),
                        savedAppointment.getAppointmentTime().format(timeFormatter),
                        appointment.getMedicalService().getName());
                break;
            case "CANCELLED":
                // Send cancellation notification to both patient and doctor
                String cancellationReason = statusUpdateDTO.getNotes() != null ? statusUpdateDTO.getNotes()
                        : "Staff hủy lịch hẹn";

                emailNotificationService.sendAppointmentCancellation(
                        appointment.getPatient().getUser().getEmail(),
                        appointment.getPatient().getUser().getFullName(),
                        appointment.getDoctor().getUser().getFullName(),
                        savedAppointment.getAppointmentDate().format(dateFormatter),
                        savedAppointment.getAppointmentTime().format(timeFormatter),
                        appointment.getMedicalService().getName(),
                        cancellationReason);

                emailNotificationService.sendAppointmentCancellation(
                        appointment.getDoctor().getUser().getEmail(),
                        appointment.getDoctor().getUser().getFullName(),
                        appointment.getPatient().getUser().getFullName(),
                        savedAppointment.getAppointmentDate().format(dateFormatter),
                        savedAppointment.getAppointmentTime().format(timeFormatter),
                        appointment.getMedicalService().getName(),
                        cancellationReason);
                break;
            case "COMPLETED":
                // Send completion notification to patient
                // emailNotificationService.sendAppointmentCompletion(
                // appointment.getPatient().getUser().getEmail(),
                // appointment.getPatient().getUser().getFullName(),
                // appointment.getDoctor().getUser().getFullName(),
                // savedAppointment.getAppointmentDate().format(dateFormatter),
                // savedAppointment.getAppointmentTime().format(timeFormatter),
                // appointment.getMedicalService().getName()
                // );
                break;
        }

        return convertToDTO(savedAppointment);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO updateSubstituteDoctor(Integer appointmentId, Integer substituteDoctorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));
        Doctor oldDoctor = appointment.getDoctor();
        Doctor substituteDoctor = doctorRepository.findById(substituteDoctorId)
                .orElseThrow(
                        () -> new NotFoundException("Không tìm thấy bác sĩ thay thế với ID: " + substituteDoctorId));
        // Kiểm tra bác sĩ thay thế có trùng lịch không
        boolean hasConflict = appointmentRepository.existsByDoctorIdAndAppointmentDateAndAppointmentTime(
                substituteDoctorId, appointment.getAppointmentDate(), appointment.getAppointmentTime());
        if (hasConflict) {
            throw new RuntimeException("Bác sĩ thay thế đã có lịch vào thời gian này!");
        }
        // Xóa lịch DoctorSchedule của bác sĩ cũ (nếu có)
        java.util.List<com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule> oldSchedules = doctorScheduleRepository
                .findByDoctorIdAndDate(
                        oldDoctor.getId(), appointment.getAppointmentDate());
        for (com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule schedule : oldSchedules) {
            // Kiểm tra trùng giờ
            if (schedule.getStartTime().equals(appointment.getAppointmentTime())) {
                doctorScheduleRepository.deleteById(schedule.getId());
            }
        }
        // Thêm lịch cho bác sĩ mới nếu chưa có
        java.util.List<com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule> newSchedules = doctorScheduleRepository
                .findByDoctorIdAndDate(
                        substituteDoctorId, appointment.getAppointmentDate());
        boolean hasNewSchedule = false;
        for (com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule schedule : newSchedules) {
            if (schedule.getStartTime().equals(appointment.getAppointmentTime())) {
                hasNewSchedule = true;
                break;
            }
        }
        if (!hasNewSchedule) {
            com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule newSchedule = com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule
                    .builder()
                    .doctor(substituteDoctor)
                    .dayOfWeek(appointment.getAppointmentDate().getDayOfWeek().toString())
                    .date(appointment.getAppointmentDate())
                    .startTime(appointment.getAppointmentTime())
                    .endTime(appointment.getAppointmentTime().plusMinutes(30)) // giả định 30 phút/ca
                    .notes("Lịch thay thế tự động")
                    .build();
            doctorScheduleRepository.save(newSchedule);
        }
        appointment.setSubstituteDoctor(substituteDoctor);
        appointment = appointmentRepository.save(appointment);
        // TODO: Gửi thông báo cho bệnh nhân về việc thay đổi bác sĩ
        return convertToDTO(appointment);
    }

    @Override
    @Transactional
    public AppointmentWithDeclarationDTO createAppointmentWithDeclaration(CreateAppointmentWithDeclarationDTO request) {
        return appointmentDeclarationService.createAppointmentWithDeclaration(request);
    }
    
    private AppointmentResponseDTO convertToDTO(Appointment appointment) {
        AppointmentResponseDTO dto = new AppointmentResponseDTO();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatient().getId());
        if (Boolean.TRUE.equals(appointment.getPatient().getUser().getAnonymous())) {
            dto.setPatientName("Bệnh nhân Ẩn danh");
        } else {
            dto.setPatientName(appointment.getPatient().getUser().getFullName());
        }
        dto.setDoctorId(appointment.getDoctor().getId());
        dto.setDoctorName(appointment.getDoctor().getUser().getFullName());
        dto.setMedicalServiceId(appointment.getMedicalService().getId());
        dto.setMedicalServiceName(appointment.getMedicalService().getName());
        dto.setMedicalServicePrice(appointment.getMedicalService().getPrice());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setStatus(AppointmentStatus.valueOf(appointment.getStatus()));
        dto.setNotes(appointment.getNotes());
        dto.setCreatedAt(appointment.getCreatedAt().atZone(java.time.ZoneId.systemDefault()));
        dto.setUpdatedAt(appointment.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()));
        if (appointment.getSubstituteDoctor() != null) {
            dto.setSubstituteDoctorId(appointment.getSubstituteDoctor().getId());
            dto.setSubstituteDoctorName(appointment.getSubstituteDoctor().getUser().getFullName());
        }

        return dto;
    }

    /**
     * Tự động tạo lịch bác sĩ khi xác nhận lịch hẹn
     */
    private void createDoctorScheduleForAppointment(Appointment appointment) {
        try {
            // Kiểm tra xem đã có lịch bác sĩ cho ngày và giờ này chưa
            Doctor doctor = appointment.getSubstituteDoctor() != null ? 
                appointment.getSubstituteDoctor() : appointment.getDoctor();
            
            List<DoctorScheduleDTO> existingSchedules = doctorScheduleService.getSchedulesByDoctor(doctor.getId());
            
            boolean scheduleExists = existingSchedules.stream()
                .anyMatch(schedule -> 
                    schedule.getDate() != null && 
                    schedule.getDate().equals(appointment.getAppointmentDate()) &&
                    schedule.getStartTime() != null &&
                    schedule.getEndTime() != null &&
                    isTimeInRange(appointment.getAppointmentTime(), schedule.getStartTime(), schedule.getEndTime())
                );

            if (!scheduleExists) {
                // Tạo lịch bác sĩ mới
                DoctorScheduleDTO newSchedule = new DoctorScheduleDTO();
                newSchedule.setDoctorId(doctor.getId());
                newSchedule.setDate(appointment.getAppointmentDate());
                newSchedule.setStartTime(appointment.getAppointmentTime());
                // Đặt thời gian kết thúc là 1 giờ sau thời gian bắt đầu
                newSchedule.setEndTime(appointment.getAppointmentTime().plusHours(1));
                newSchedule.setDayOfWeek(appointment.getAppointmentDate().getDayOfWeek().toString());
                newSchedule.setNotes("Lịch tự động tạo cho lịch hẹn #" + appointment.getId());
                newSchedule.setStatus("ACTIVE");

                doctorScheduleService.createSchedule(newSchedule);
                log.info("Đã tạo lịch bác sĩ tự động cho appointment ID: {}, Doctor ID: {}", 
                    appointment.getId(), doctor.getId());
            } else {
                log.info("Lịch bác sĩ đã tồn tại cho appointment ID: {}, Doctor ID: {}", 
                    appointment.getId(), doctor.getId());
            }
        } catch (Exception e) {
            log.error("Lỗi khi tạo lịch bác sĩ tự động cho appointment ID: {}: {}", 
                appointment.getId(), e.getMessage(), e);
            throw e;
        }
    }

    /**
     * Kiểm tra xem thời gian có nằm trong khoảng thời gian không
     */
    private boolean isTimeInRange(LocalTime timeToCheck, LocalTime startTime, LocalTime endTime) {
        return !timeToCheck.isBefore(startTime) && !timeToCheck.isAfter(endTime);
    }

    @Override
    @Transactional
    public AppointmentResponseDTO patientCheckIn(Integer appointmentId, Integer patientId) {
        try {
            // Tìm appointment
            Appointment appointment = appointmentRepository.findById(appointmentId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy lịch hẹn với ID: " + appointmentId));

            // Kiểm tra quyền: chỉ bệnh nhân của appointment mới được check-in
            if (!appointment.getPatient().getId().equals(patientId)) {
                throw new IllegalStateException("Bạn không có quyền check-in lịch hẹn này");
            }

            // Kiểm tra trạng thái: chỉ có thể check-in từ CONFIRMED
            if (!AppointmentStatus.CONFIRMED.name().equals(appointment.getStatus())) {
                throw new IllegalStateException("Chỉ có thể check-in lịch hẹn đã được xác nhận. Trạng thái hiện tại: " + appointment.getStatus());
            }

            // Kiểm tra thời gian: chỉ được check-in trong ngày hẹn
            LocalDate today = LocalDate.now();
            if (!appointment.getAppointmentDate().equals(today)) {
                if (appointment.getAppointmentDate().isBefore(today)) {
                    throw new IllegalStateException("Lịch hẹn đã quá hạn, không thể check-in");
                } else {
                    throw new IllegalStateException("Chưa đến ngày hẹn, không thể check-in trước thời gian");
                }
            }

            // Kiểm tra thời gian check-in (có thể check-in trước giờ hẹn 30 phút)
            LocalTime now = LocalTime.now();
            LocalTime earliestCheckInTime = appointment.getAppointmentTime().minusMinutes(30);
            LocalTime latestCheckInTime = appointment.getAppointmentTime().plusHours(1); // Cho phép check-in muộn 1 tiếng

            if (now.isBefore(earliestCheckInTime)) {
                throw new IllegalStateException("Chưa đến thời gian check-in. Có thể check-in từ " + 
                    earliestCheckInTime.toString() + " (30 phút trước giờ hẹn)");
            }

            if (now.isAfter(latestCheckInTime)) {
                throw new IllegalStateException("Đã quá thời gian check-in. Thời gian check-in kết thúc lúc " + 
                    latestCheckInTime.toString());
            }

            // Cập nhật trạng thái thành CHECKED_IN
            appointment.setStatus(AppointmentStatus.CHECKED_IN.name());
            // updatedAt sẽ tự động cập nhật qua @PreUpdate

            // Thêm note về thời gian check-in
            String checkInNote = "Bệnh nhân đã check-in lúc " + now.toString() + " ngày " + today.toString();
            if (appointment.getNotes() != null && !appointment.getNotes().trim().isEmpty()) {
                appointment.setNotes(appointment.getNotes() + "\n" + checkInNote);
            } else {
                appointment.setNotes(checkInNote);
            }

            Appointment savedAppointment = appointmentRepository.save(appointment);

            // Gửi thông báo cho bác sĩ về việc bệnh nhân đã check-in
            try {
                DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
                
                emailNotificationService.sendPatientCheckInNotification(
                        appointment.getDoctor().getUser().getEmail(),
                        appointment.getDoctor().getUser().getFullName(),
                        appointment.getPatient().getUser().getFullName(),
                        appointment.getAppointmentDate().format(dateFormatter),
                        appointment.getAppointmentTime().format(timeFormatter),
                        appointment.getMedicalService().getName(),
                        now.format(timeFormatter)
                );
            } catch (Exception e) {
                log.warn("Không thể gửi email thông báo check-in cho bác sĩ: {}", e.getMessage());
            }

            // Tự động tạo payment cho appointment đã check-in
            try {
                paymentService.createAutoPaymentForCheckedInAppointment(appointmentId);
                log.info("Đã tạo thành công payment tự động cho appointment ID {}", appointmentId);
            } catch (Exception e) {
                log.warn("Không thể tạo payment tự động cho appointment ID {}: {}", appointmentId, e.getMessage());
                // Không throw exception để không ảnh hưởng đến quá trình check-in
            }

            log.info("Bệnh nhân ID {} đã check-in thành công cho appointment ID {}", patientId, appointmentId);
            
            return convertToDTO(savedAppointment);

        } catch (Exception e) {
            log.error("Lỗi khi bệnh nhân check-in appointment ID {}: {}", appointmentId, e.getMessage(), e);
            throw e;
        }
    }
}