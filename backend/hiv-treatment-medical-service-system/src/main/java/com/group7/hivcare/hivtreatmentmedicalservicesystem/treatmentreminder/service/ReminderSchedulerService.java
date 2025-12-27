package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmentreminder.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReminderSchedulerService {

    private final TreatmentReminderService treatmentReminderService;
    private boolean isRunning = false;

    /**
     * Tự động gửi nhắc nhở uống thuốc mỗi phút
     * Cron expression: 0 * * * * * (mỗi phút)
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void sendMedicationReminders() {
        // Kiểm tra xem job trước đó đã chạy xong chưa
        if (isRunning) {
            log.info("Previous job is still running, skipping this execution");
            return;
        }

        isRunning = true;
        try {
            log.info("Starting scheduled medication reminder sending...");
            treatmentReminderService.sendDailyMedicationReminders();
            log.info("Completed scheduled medication reminder sending");
        } catch (Exception e) {
            log.error("Error in scheduled medication reminder sending: {}", e.getMessage());
            log.error("Detailed error: ", e); // Log stack trace đầy đủ
        } finally {
            isRunning = false;
        }
    }

    /**
     * Tự động đánh dấu nhắc nhở bị bỏ lỡ mỗi giờ
     * Cron expression: 0 0 * * * * (mỗi giờ)
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void markMissedReminders() {
        try {
            log.info("Starting scheduled missed reminder marking...");
            // Logic để đánh dấu nhắc nhở bị bỏ lỡ sẽ được thêm vào đây
            log.info("Completed scheduled missed reminder marking");
        } catch (Exception e) {
            log.error("Error in scheduled missed reminder marking: {}", e.getMessage());
            log.error("Detailed error: ", e);
        }
    }
} 