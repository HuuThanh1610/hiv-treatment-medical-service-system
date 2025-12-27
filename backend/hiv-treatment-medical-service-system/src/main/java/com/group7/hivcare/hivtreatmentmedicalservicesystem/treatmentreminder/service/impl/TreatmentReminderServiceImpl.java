package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.MedicationScheduleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.exception.customexceptions.NotFoundException;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.dto.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service.TreatmentReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.notification.service.EmailNotificationService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TreatmentReminderServiceImpl implements TreatmentReminderService {

    private final TreatmentReminderRepository treatmentReminderRepository;
    private final PatientsRepository patientsRepository;
    private final PatientTreatmentPlanRepository treatmentPlanRepository;
    private final AppointmentRepository appointmentRepository;
    private final MedicationScheduleRepository medicationScheduleRepository;
    private final EmailNotificationService emailNotificationService;

    @Override
    public TreatmentReminderDTO createReminder(CreateReminderDTO createReminderDTO) {
        Patients patient = patientsRepository.findById(createReminderDTO.getPatientId())
                .orElseThrow(() -> new NotFoundException("Patient not found"));

        TreatmentReminder reminder = TreatmentReminder.builder()
                .patient(patient)
                .reminderType(createReminderDTO.getReminderType())
                .reminderDate(createReminderDTO.getReminderDate())
                .status("PENDING")
                .treatmentPlan(createReminderDTO.getTreatmentPlanId() != null ? 
                        treatmentPlanRepository.findById(createReminderDTO.getTreatmentPlanId()).orElse(null) : null)
                .appointment(createReminderDTO.getAppointmentId() != null ? 
                        appointmentRepository.findById(createReminderDTO.getAppointmentId()).orElse(null) : null)
                .medicationSchedule(createReminderDTO.getMedicationScheduleId() != null ? 
                        medicationScheduleRepository.findById(createReminderDTO.getMedicationScheduleId()).orElse(null) : null)
                .build();

        TreatmentReminder savedReminder = treatmentReminderRepository.save(reminder);
        return convertToDTO(savedReminder);
    }

    @Override
    public List<TreatmentReminderDTO> getPatientReminders(Integer patientId) {
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByPatientIdOrderByReminderDateDesc(patientId);
        return reminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TreatmentReminderDTO> getPatientRemindersByStatus(Integer patientId, String status) {
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByPatientIdAndStatusOrderByReminderDateDesc(patientId, status);
        return reminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TreatmentReminderDTO> getPatientRemindersByType(Integer patientId, String reminderType) {
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByPatientIdAndReminderTypeOrderByReminderDateDesc(patientId, reminderType);
        return reminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public TreatmentReminderDTO updateReminderStatus(ReminderStatusDTO statusDTO) {
        TreatmentReminder reminder = treatmentReminderRepository.findById(statusDTO.getReminderId())
                .orElseThrow(() -> new NotFoundException("Reminder not found"));

        reminder.setStatus(statusDTO.getStatus());
        TreatmentReminder updatedReminder = treatmentReminderRepository.save(reminder);
        
        log.info("Updated reminder {} status to {}", statusDTO.getReminderId(), statusDTO.getStatus());
        return convertToDTO(updatedReminder);
    }

    @Override
    public TreatmentReminderDTO markReminderCompleted(Integer reminderId) {
        return updateReminderStatus(ReminderStatusDTO.builder()
                .reminderId(reminderId)
                .status("COMPLETED")
                .build());
    }

    @Override
    public TreatmentReminderDTO markReminderMissed(Integer reminderId) {
        return updateReminderStatus(ReminderStatusDTO.builder()
                .reminderId(reminderId)
                .status("MISSED")
                .build());
    }

    @Override
    public TreatmentReminderDTO sendReminder(Integer reminderId) {
        TreatmentReminder reminder = treatmentReminderRepository.findById(reminderId)
                .orElseThrow(() -> new NotFoundException("Reminder not found"));
                
        // Gửi email nhắc nhở nếu là MEDICATION hoặc APPOINTMENT
        try {
            if ("MEDICATION".equals(reminder.getReminderType()) && reminder.getMedicationSchedule() != null) {
                Patients patient = reminder.getPatient();
                String to = patient.getUser().getEmail();
                String patientName = patient.getUser().getFullName();
                String medicationName = reminder.getMedicationSchedule().getMedicationName();
                String dosage = reminder.getMedicationSchedule().getDosage();
                String time = reminder.getReminderDate().toLocalTime().toString();
                String reminderIdStr = reminder.getId().toString();
                
                // Gửi email nhắc nhở uống thuốc với nội dung chuyên nghiệp
                emailNotificationService.sendMedicationReminder(to, patientName, medicationName, dosage, time, reminderIdStr);
            } else if ("APPOINTMENT".equals(reminder.getReminderType()) && reminder.getAppointment() != null) {
                Appointment appointment = reminder.getAppointment();
                Patients patient = appointment.getPatient();
                String to = patient.getUser().getEmail();
                String patientName = patient.getUser().getFullName();
                String doctorName = appointment.getDoctor() != null ? appointment.getDoctor().getUser().getFullName() : "bác sĩ";
                String appointmentDate = appointment.getAppointmentDate().toString();
                String appointmentTime = appointment.getAppointmentTime().toString();
                String medicalServiceName = appointment.getMedicalService() != null ? appointment.getMedicalService().getName() : "";
                
                // Gửi email nhắc nhở tái khám với nội dung chuyên nghiệp
                emailNotificationService.sendAppointmentReminder(to, patientName, doctorName, appointmentDate, appointmentTime, medicalServiceName);
            }
            
            // Chỉ update status thành SENT sau khi gửi email thành công
            return updateReminderStatus(ReminderStatusDTO.builder()
                    .reminderId(reminderId)
                    .status("SENT")
                    .build());
        } catch (Exception e) {
            log.error("Failed to send reminder {}: {}", reminderId, e.getMessage());
            throw e;
        }
    }

    @Override
    public List<TreatmentReminderDTO> getPendingRemindersToSend() {
        List<TreatmentReminder> reminders = treatmentReminderRepository.findPendingRemindersToSend(LocalDateTime.now());
        return reminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TreatmentReminderDTO> getMissedReminders() {
        List<TreatmentReminder> reminders = treatmentReminderRepository.findMissedReminders(LocalDateTime.now());
        return reminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TreatmentReminderDTO> createMedicationReminders(Integer medicationScheduleId) {
        MedicationSchedule schedule = medicationScheduleRepository.findById(medicationScheduleId)
                .orElseThrow(() -> new NotFoundException("Medication schedule not found"));

        // Tạo nhắc nhở cho mỗi lần uống thuốc trong ngày
        List<TreatmentReminder> reminders = new ArrayList<>();
        
        if (schedule.getTimeOfDay() != null && !schedule.getTimeOfDay().isEmpty()) {
            String[] times = schedule.getTimeOfDay().split(",");
            for (String timeStr : times) {
                try {
                    String[] timeParts = timeStr.trim().split(":");
                    int hour = Integer.parseInt(timeParts[0]);
                    int minute = Integer.parseInt(timeParts[1]);
                    
                    LocalDateTime reminderTime = LocalDate.now().atTime(hour, minute);
                    if (reminderTime.isBefore(LocalDateTime.now())) {
                        reminderTime = reminderTime.plusDays(1);
                    }

                    TreatmentReminder reminder = TreatmentReminder.builder()
                            .patient(schedule.getTreatmentPlan().getPatient())
                            .reminderType("MEDICATION")
                            .reminderDate(reminderTime)
                            .status("PENDING")
                            .medicationSchedule(schedule)
                            .build();
                    reminders.add(reminder);
                } catch (Exception e) {
                    log.warn("Invalid time format: {}", timeStr);
                }
            }
        }

        List<TreatmentReminder> savedReminders = treatmentReminderRepository.saveAll(reminders);
        return savedReminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TreatmentReminderDTO> createDailyMedicationReminders(Integer medicationScheduleId) {
        MedicationSchedule schedule = medicationScheduleRepository.findById(medicationScheduleId)
                .orElseThrow(() -> new NotFoundException("Medication schedule not found"));

        List<TreatmentReminder> reminders = new ArrayList<>();
        
        // Lấy số ngày cần uống thuốc từ medication schedule, mặc định 30 ngày nếu không có
        int durationDays = schedule.getDurationDays() != null ? schedule.getDurationDays() : 30;
        
        if (schedule.getTimeOfDay() != null && !schedule.getTimeOfDay().isEmpty()) {
            String[] times = schedule.getTimeOfDay().split(",");
            
            // Tạo nhắc nhở dựa vào duration days từ prescription medication
            for (int day = 0; day < durationDays; day++) {
                LocalDate targetDate = LocalDate.now().plusDays(day);
                
                for (String timeStr : times) {
                    try {
                        String[] timeParts = timeStr.trim().split(":");
                        int hour = Integer.parseInt(timeParts[0]);
                        int minute = Integer.parseInt(timeParts[1]);
                        
                        LocalDateTime reminderTime = targetDate.atTime(hour, minute);

                        TreatmentReminder reminder = TreatmentReminder.builder()
                                .patient(schedule.getTreatmentPlan().getPatient())
                                .reminderType("MEDICATION")
                                .reminderDate(reminderTime)
                                .status("PENDING")
                                .medicationSchedule(schedule)
                                .build();
                        reminders.add(reminder);
                    } catch (Exception e) {
                        log.warn("Invalid time format: {}", timeStr);
                    }
                }
            }
        }

        List<TreatmentReminder> savedReminders = treatmentReminderRepository.saveAll(reminders);
        log.info("Created {} daily medication reminders for {} days for patient {}", 
                savedReminders.size(), durationDays, schedule.getTreatmentPlan().getPatient().getId());
        return savedReminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public void sendDailyMedicationReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<TreatmentReminder> pendingReminders = treatmentReminderRepository.findPendingRemindersToSend(now);
        
        for (TreatmentReminder reminder : pendingReminders) {
            if ("MEDICATION".equals(reminder.getReminderType())) {
                try {
                    sendReminder(reminder.getId());
                    log.info("Sent medication reminder {} to patient {}", reminder.getId(), reminder.getPatient().getId());
                } catch (Exception e) {
                    log.error("Failed to send medication reminder {}: {}", reminder.getId(), e.getMessage());
                }
            }
        }
    }

    @Override
    public TreatmentReminderDTO createAppointmentReminder(Integer appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new NotFoundException("Appointment not found"));

        // Tạo nhắc nhở 1 ngày trước cuộc hẹn
        LocalDateTime reminderTime = appointment.getAppointmentDate().atStartOfDay().minusDays(1);

        TreatmentReminder reminder = TreatmentReminder.builder()
                .patient(appointment.getPatient())
                .reminderType("APPOINTMENT")
                .reminderDate(reminderTime)
                .status("PENDING")
                .appointment(appointment)
                .build();

        TreatmentReminder savedReminder = treatmentReminderRepository.save(reminder);
        // Gửi email xác nhận lịch hẹn tái khám cho bệnh nhân
        Patients patient = appointment.getPatient();
        String to = patient.getUser().getEmail();
        String patientName = patient.getUser().getFullName();
        String doctorName = appointment.getDoctor() != null ? appointment.getDoctor().getUser().getFullName() : "bác sĩ";
        String appointmentDate = appointment.getAppointmentDate().toString();
        String appointmentTime = appointment.getAppointmentTime().toString();
        String medicalServiceName = appointment.getMedicalService() != null ? appointment.getMedicalService().getName() : "";
        emailNotificationService.sendAppointmentConfirmation(to, patientName, doctorName, appointmentDate, appointmentTime, medicalServiceName);
        return convertToDTO(savedReminder);
    }

    @Override
    public List<TreatmentReminderDTO> createRemindersFromTreatmentPlan(Integer treatmentPlanId) {
        PatientTreatmentPlan treatmentPlan = treatmentPlanRepository.findById(treatmentPlanId)
                .orElseThrow(() -> new NotFoundException("Treatment plan not found"));

        // Tạo nhắc nhở cho các cuộc hẹn tái khám (sử dụng end date)
        List<TreatmentReminder> reminders = new ArrayList<>();
        //TODO:fix reminder base on getEndDate
//        if (treatmentPlan.getEndDate() != null) {
//            TreatmentReminder reminder = TreatmentReminder.builder()
//                    .patient(treatmentPlan.getPatient())
//                    .reminderType("APPOINTMENT")
//                    .reminderDate(treatmentPlan.getEndDate().atStartOfDay().minusDays(1)) // Nhắc nhở 1 ngày trước
//                    .status("PENDING")
//                    .treatmentPlan(treatmentPlan)
//                    .build();
//            reminders.add(reminder);
//        }

        List<TreatmentReminder> savedReminders = treatmentReminderRepository.saveAll(reminders);
        return savedReminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public ReminderReportDTO getDailyReport(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(23, 59, 59);
        
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByReminderDateBetween(startOfDay, endOfDay);
        return generateReport(reminders, date);
    }

    @Override
    public ReminderReportDTO getWeeklyReport(LocalDate startDate) {
        LocalDateTime startOfWeek = startDate.atStartOfDay();
        LocalDateTime endOfWeek = startDate.plusDays(6).atTime(23, 59, 59);
        
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByReminderDateBetween(startOfWeek, endOfWeek);
        return generateReport(reminders, startDate);
    }

    @Override
    public ReminderReportDTO getMonthlyReport(int year, int month) {
        LocalDateTime startOfMonth = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime endOfMonth = LocalDate.of(year, month, startOfMonth.toLocalDate().lengthOfMonth()).atTime(23, 59, 59);
        
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByReminderDateBetween(startOfMonth, endOfMonth);
        return generateReport(reminders, LocalDate.of(year, month, 1));
    }

    @Override
    public ReminderReportDTO getPatientComplianceReport(Integer patientId, LocalDate startDate, LocalDate endDate) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByPatientIdOrderByReminderDateDesc(patientId)
                .stream()
                .filter(r -> r.getReminderDate().isAfter(startDateTime) && r.getReminderDate().isBefore(endDateTime))
                .collect(Collectors.toList());
        
        return generateReport(reminders, startDate);
    }

    @Override
    public void deleteReminder(Integer reminderId) {
        if (!treatmentReminderRepository.existsById(reminderId)) {
            throw new NotFoundException("Reminder not found");
        }
        treatmentReminderRepository.deleteById(reminderId);
        log.info("Deleted reminder: {}", reminderId);
    }

    @Override
    public TreatmentReminderDTO getReminderById(Integer reminderId) {
        TreatmentReminder reminder = treatmentReminderRepository.findById(reminderId)
                .orElseThrow(() -> new NotFoundException("Reminder not found"));
        return convertToDTO(reminder);
    }

    @Override
    public List<TreatmentReminderDTO> getAllReminders() {
        List<TreatmentReminder> reminders = treatmentReminderRepository.findAll();
        return reminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<TreatmentReminderDTO> getRemindersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<TreatmentReminder> reminders = treatmentReminderRepository.findByReminderDateBetween(startDate, endDate);
        return reminders.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Helper methods
    private TreatmentReminderDTO convertToDTO(TreatmentReminder reminder) {
        return TreatmentReminderDTO.builder()
                .id(reminder.getId())
                .patientId(reminder.getPatient().getId())
                .patientName(reminder.getPatient().getUser().getFullName())
                .reminderType(reminder.getReminderType())
                .reminderDate(reminder.getReminderDate())
                .status(reminder.getStatus())
                .treatmentPlanId(reminder.getTreatmentPlan() != null ? reminder.getTreatmentPlan().getId() : null)
                .appointmentId(reminder.getAppointment() != null ? reminder.getAppointment().getId() : null)
                .medicationScheduleId(reminder.getMedicationSchedule() != null ? reminder.getMedicationSchedule().getId() : null)
                .message(generateMessage(reminder))
                .medicationName(reminder.getMedicationSchedule() != null ? reminder.getMedicationSchedule().getMedicationName() : null)
                .dosage(reminder.getMedicationSchedule() != null ? reminder.getMedicationSchedule().getDosage() : null)
                .appointmentDateTime(reminder.getAppointment() != null ? reminder.getAppointment().getAppointmentDate().atStartOfDay() : null)
                .doctorName(reminder.getAppointment() != null && reminder.getAppointment().getDoctor() != null ? 
                        reminder.getAppointment().getDoctor().getUser().getFullName() : null)
                .createdAt(reminder.getCreatedAt())
                .updatedAt(reminder.getUpdatedAt())
                .build();
    }

    private String generateMessage(TreatmentReminder reminder) {
        switch (reminder.getReminderType()) {
            case "MEDICATION":
                if (reminder.getMedicationSchedule() != null) {
                    return String.format("Nhắc nhở uống thuốc: %s - %s", 
                            reminder.getMedicationSchedule().getMedicationName(),
                            reminder.getMedicationSchedule().getDosage());
                }
                return "Nhắc nhở uống thuốc";
            case "APPOINTMENT":
                if (reminder.getAppointment() != null) {
                    String appointmentDate = reminder.getAppointment().getAppointmentDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                    String doctorName = reminder.getAppointment().getDoctor() != null ? 
                            reminder.getAppointment().getDoctor().getUser().getFullName() : "bác sĩ";
                    return String.format("Nhắc nhở tái khám: %s với %s", appointmentDate, doctorName);
                }
                return "Nhắc nhở tái khám";
            case "TREATMENT":
//                if (reminder.getTreatmentPlan() != null) {
//                    String planInfo = reminder.getTreatmentPlan().getDecisionSummary() != null ?
//                            reminder.getTreatmentPlan().getDecisionSummary() :
//                            (reminder.getTreatmentPlan().getNotes() != null ?
//                                    reminder.getTreatmentPlan().getNotes() : "Kế hoạch điều trị");
//                    return String.format("Nhắc nhở điều trị: %s", planInfo);
//                }
//                return "Nhắc nhở điều trị";
            default:
                return "Nhắc nhở điều trị";
        }
    }

    private ReminderReportDTO generateReport(List<TreatmentReminder> reminders, LocalDate reportDate) {
        int total = reminders.size();
        int sent = (int) reminders.stream().filter(r -> "SENT".equals(r.getStatus())).count();
        int completed = (int) reminders.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count();
        int missed = (int) reminders.stream().filter(r -> "MISSED".equals(r.getStatus())).count();
        int pending = (int) reminders.stream().filter(r -> "PENDING".equals(r.getStatus())).count();

        double complianceRate = total > 0 ? (double) completed / total * 100 : 0.0;

        return ReminderReportDTO.builder()
                .reportDate(reportDate)
                .totalReminders(total)
                .sentReminders(sent)
                .completedReminders(completed)
                .missedReminders(missed)
                .pendingReminders(pending)
                .complianceRate(complianceRate)
                .build();
    }
} 