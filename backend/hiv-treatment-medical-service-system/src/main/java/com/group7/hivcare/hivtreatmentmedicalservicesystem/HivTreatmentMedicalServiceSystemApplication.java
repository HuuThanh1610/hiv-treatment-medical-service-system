/**
 * HivTreatmentMedicalServiceSystemApplication.java - Main Spring Boot Application
 *
 * Chức năng:
 * - Entry point của toàn bộ backend application
 * - Khởi tạo Spring Boot context
 * - Auto-configuration cho tất cả modules
 * - Component scanning cho packages
 * - Database connection initialization
 * - Scheduling support cho background tasks
 */
package com.group7.hivcare.hivtreatmentmedicalservicesystem;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class
 * @SpringBootApplication: Auto-configuration và component scanning
 * @EnableScheduling: Bật tính năng scheduled tasks (medication reminders, etc.)
 */
@SpringBootApplication
@EnableScheduling
public class HivTreatmentMedicalServiceSystemApplication {
    /**
     * Main method - khởi chạy Spring Boot application
     * @param args command line arguments
     */
    public static void main(String[] args) {
        SpringApplication.run(HivTreatmentMedicalServiceSystemApplication.class, args);
    }
}