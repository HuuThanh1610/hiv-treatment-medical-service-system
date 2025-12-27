package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.PrescriptionHistoryDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service.PrescriptionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST Controller cho lịch sử thay đổi đơn thuốc
 * Endpoint chính: /api/prescription-history/patient/{id} - Frontend gọi để lấy lịch sử đơn thuốc
 * Trả về: List<PrescriptionHistoryDTO> với createdAt và oldMedications
 */
@RestController
@RequestMapping("/api/prescription-history")
@RequiredArgsConstructor
public class PrescriptionHistoryController {

    private final PrescriptionHistoryService prescriptionHistoryService;

    // API lấy lịch sử đơn thuốc theo treatment plan
    @GetMapping("/treatment-plan/{treatmentPlanId}")
    public ResponseEntity<List<PrescriptionHistoryDTO>> getByTreatmentPlanId(@PathVariable Integer treatmentPlanId) {
        List<PrescriptionHistoryDTO> histories = prescriptionHistoryService.getByTreatmentPlanId(treatmentPlanId);
        return ResponseEntity.ok(histories);
    }

    /**
     * API chính được Frontend gọi để lấy lịch sử đơn thuốc của bệnh nhân
     * Trả về danh sách lịch sử với createdAt và oldMedications đã được map
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionHistoryDTO>> getByPatientId(@PathVariable Integer patientId) {
        List<PrescriptionHistoryDTO> histories = prescriptionHistoryService.getByPatientId(patientId);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử đơn thuốc theo doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PrescriptionHistoryDTO>> getByDoctorId(@PathVariable Integer doctorId) {
        List<PrescriptionHistoryDTO> histories = prescriptionHistoryService.getByDoctorId(doctorId);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử đơn thuốc theo prescription cụ thể
    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<PrescriptionHistoryDTO>> getByPrescriptionId(@PathVariable Integer prescriptionId) {
        List<PrescriptionHistoryDTO> histories = prescriptionHistoryService.getByPrescriptionId(prescriptionId);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử đơn thuốc trong khoảng thời gian
    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<List<PrescriptionHistoryDTO>> getByPatientIdAndDateRange(
            @PathVariable Integer patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PrescriptionHistoryDTO> histories = prescriptionHistoryService.getByPatientIdAndDateRange(patientId, startDate, endDate);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử đơn thuốc theo lý do thay đổi
    @GetMapping("/change-reason")
    public ResponseEntity<List<PrescriptionHistoryDTO>> getByChangeReason(@RequestParam String changeReason) {
        List<PrescriptionHistoryDTO> histories = prescriptionHistoryService.getByChangeReason(changeReason);
        return ResponseEntity.ok(histories);
    }

} 