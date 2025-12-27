package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.dto.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service.TreatmentReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/treatment-reminders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TreatmentReminderController {

    private final TreatmentReminderService treatmentReminderService;

    /**
     * Tạo nhắc nhở mới
     */
    @PostMapping
    public ResponseEntity<TreatmentReminderDTO> createReminder(@RequestBody CreateReminderDTO createReminderDTO) {
        TreatmentReminderDTO reminder = treatmentReminderService.createReminder(createReminderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
    }

    /**
     * Lấy tất cả nhắc nhở của bệnh nhân
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TreatmentReminderDTO>> getPatientReminders(@PathVariable Integer patientId) {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.getPatientReminders(patientId);
        return ResponseEntity.ok(reminders);
    }

    /**
     * Lấy nhắc nhở theo trạng thái của bệnh nhân
     */
    @GetMapping("/patient/{patientId}/status/{status}")
    public ResponseEntity<List<TreatmentReminderDTO>> getPatientRemindersByStatus(
            @PathVariable Integer patientId, @PathVariable String status) {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.getPatientRemindersByStatus(patientId, status);
        return ResponseEntity.ok(reminders);
    }

    /**
     * Lấy nhắc nhở theo loại của bệnh nhân
     */
    @GetMapping("/patient/{patientId}/type/{reminderType}")
    public ResponseEntity<List<TreatmentReminderDTO>> getPatientRemindersByType(
            @PathVariable Integer patientId, @PathVariable String reminderType) {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.getPatientRemindersByType(patientId, reminderType);
        return ResponseEntity.ok(reminders);
    }

    /**
     * Cập nhật trạng thái nhắc nhở
     */
    @PutMapping("/status")
    public ResponseEntity<TreatmentReminderDTO> updateReminderStatus(@RequestBody ReminderStatusDTO statusDTO) {
        TreatmentReminderDTO reminder = treatmentReminderService.updateReminderStatus(statusDTO);
        return ResponseEntity.ok(reminder);
    }

    /**
     * Đánh dấu nhắc nhở đã hoàn thành
     */
    @PutMapping("/{reminderId}/complete")
    public ResponseEntity<TreatmentReminderDTO> markReminderCompleted(@PathVariable Integer reminderId) {
        TreatmentReminderDTO reminder = treatmentReminderService.markReminderCompleted(reminderId);
        return ResponseEntity.ok(reminder);
    }

    /**
     * Đánh dấu nhắc nhở bị bỏ lỡ
     */
    @PutMapping("/{reminderId}/miss")
    public ResponseEntity<TreatmentReminderDTO> markReminderMissed(@PathVariable Integer reminderId) {
        TreatmentReminderDTO reminder = treatmentReminderService.markReminderMissed(reminderId);
        return ResponseEntity.ok(reminder);
    }

    /**
     * Gửi nhắc nhở
     */
    @PutMapping("/{reminderId}/send")
    public ResponseEntity<TreatmentReminderDTO> sendReminder(@PathVariable Integer reminderId) {
        TreatmentReminderDTO reminder = treatmentReminderService.sendReminder(reminderId);
        return ResponseEntity.ok(reminder);
    }

    /**
     * Lấy nhắc nhở cần gửi
     */
    @GetMapping("/pending")
    public ResponseEntity<List<TreatmentReminderDTO>> getPendingRemindersToSend() {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.getPendingRemindersToSend();
        return ResponseEntity.ok(reminders);
    }

    /**
     * Lấy nhắc nhở bị bỏ lỡ
     */
    @GetMapping("/missed")
    public ResponseEntity<List<TreatmentReminderDTO>> getMissedReminders() {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.getMissedReminders();
        return ResponseEntity.ok(reminders);
    }

    /**
     * Tạo nhắc nhở uống thuốc từ medication schedule
     */
    @PostMapping("/medication-schedule/{medicationScheduleId}")
    public ResponseEntity<List<TreatmentReminderDTO>> createMedicationReminders(
            @PathVariable Integer medicationScheduleId) {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.createMedicationReminders(medicationScheduleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminders);
    }

    /**
     * Tạo nhắc nhở uống thuốc hàng ngày cho 30 ngày tiếp theo
     */
    @PostMapping("/medication-schedule/{medicationScheduleId}/daily")
    public ResponseEntity<List<TreatmentReminderDTO>> createDailyMedicationReminders(
            @PathVariable Integer medicationScheduleId) {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.createDailyMedicationReminders(medicationScheduleId);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminders);
    }

    /**
     * Gửi nhắc nhở uống thuốc hàng ngày (manual trigger)
     */
    @PostMapping("/send-daily-reminders")
    public ResponseEntity<Void> sendDailyReminders() {
        treatmentReminderService.sendDailyMedicationReminders();
        return ResponseEntity.ok().build();
    }

    /**
     * Bệnh nhân xác nhận đã uống thuốc
     */
    @PutMapping("/{reminderId}/confirm-medication")
    public ResponseEntity<TreatmentReminderDTO> confirmMedicationTaken(@PathVariable Integer reminderId) {
        TreatmentReminderDTO reminder = treatmentReminderService.markReminderCompleted(reminderId);
        return ResponseEntity.ok(reminder);
    }

    /**
     * Bệnh nhân đánh dấu bỏ lỡ uống thuốc
     */
    @PutMapping("/{reminderId}/miss-medication")
    public ResponseEntity<TreatmentReminderDTO> missMedication(@PathVariable Integer reminderId) {
        TreatmentReminderDTO reminder = treatmentReminderService.markReminderMissed(reminderId);
        return ResponseEntity.ok(reminder);
    }

    /**
     * Tạo nhắc nhở tái khám từ appointment
     */
    @PostMapping("/appointment/{appointmentId}")
    public ResponseEntity<TreatmentReminderDTO> createAppointmentReminder(@PathVariable Integer appointmentId) {
        TreatmentReminderDTO reminder = treatmentReminderService.createAppointmentReminder(appointmentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
    }

    /**
     * Tạo nhắc nhở từ treatment plan
     */
    @PostMapping("/treatment-plan/{treatmentPlanId}")
    public ResponseEntity<List<TreatmentReminderDTO>> createRemindersFromTreatmentPlan(
            @PathVariable Integer treatmentPlanId) {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.createRemindersFromTreatmentPlan(treatmentPlanId);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminders);
    }

    /**
     * Lấy báo cáo nhắc nhở theo ngày
     */
    @GetMapping("/reports/daily")
    public ResponseEntity<ReminderReportDTO> getDailyReport(@RequestParam LocalDate date) {
        ReminderReportDTO report = treatmentReminderService.getDailyReport(date);
        return ResponseEntity.ok(report);
    }

    /**
     * Lấy báo cáo nhắc nhở theo tuần
     */
    @GetMapping("/reports/weekly")
    public ResponseEntity<ReminderReportDTO> getWeeklyReport(@RequestParam LocalDate startDate) {
        ReminderReportDTO report = treatmentReminderService.getWeeklyReport(startDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Lấy báo cáo nhắc nhở theo tháng
     */
    @GetMapping("/reports/monthly")
    public ResponseEntity<ReminderReportDTO> getMonthlyReport(
            @RequestParam int year, @RequestParam int month) {
        ReminderReportDTO report = treatmentReminderService.getMonthlyReport(year, month);
        return ResponseEntity.ok(report);
    }

    /**
     * Lấy báo cáo tuân thủ của bệnh nhân
     */
    @GetMapping("/reports/patient/{patientId}/compliance")
    public ResponseEntity<ReminderReportDTO> getPatientComplianceReport(
            @PathVariable Integer patientId,
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        ReminderReportDTO report = treatmentReminderService.getPatientComplianceReport(patientId, startDate, endDate);
        return ResponseEntity.ok(report);
    }

    /**
     * Xóa nhắc nhở
     */
    @DeleteMapping("/{reminderId}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Integer reminderId) {
        treatmentReminderService.deleteReminder(reminderId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy nhắc nhở theo ID
     */
    @GetMapping("/{reminderId}")
    public ResponseEntity<TreatmentReminderDTO> getReminderById(@PathVariable Integer reminderId) {
        TreatmentReminderDTO reminder = treatmentReminderService.getReminderById(reminderId);
        return ResponseEntity.ok(reminder);
    }

    /**
     * Lấy tất cả nhắc nhở (cho admin)
     */
    @GetMapping("/all")
    public ResponseEntity<List<TreatmentReminderDTO>> getAllReminders() {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.getAllReminders();
        return ResponseEntity.ok(reminders);
    }

    /**
     * Lấy nhắc nhở theo khoảng thời gian
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<TreatmentReminderDTO>> getRemindersByDateRange(
            @RequestParam LocalDateTime startDate, @RequestParam LocalDateTime endDate) {
        List<TreatmentReminderDTO> reminders = treatmentReminderService.getRemindersByDateRange(startDate, endDate);
        return ResponseEntity.ok(reminders);
    }
} 