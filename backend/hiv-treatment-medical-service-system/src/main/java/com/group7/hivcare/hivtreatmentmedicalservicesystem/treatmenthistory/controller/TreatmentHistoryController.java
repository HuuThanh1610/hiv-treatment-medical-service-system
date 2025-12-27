package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.controller;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.TreatmentHistoryDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service.TreatmentHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/treatment-history")
@RequiredArgsConstructor
public class TreatmentHistoryController {

    private final TreatmentHistoryService treatmentHistoryService;

    // Lấy lịch sử điều trị theo treatment plan
    @GetMapping("/treatment-plan/{treatmentPlanId}")
    public ResponseEntity<List<TreatmentHistoryDTO>> getByTreatmentPlanId(@PathVariable Integer treatmentPlanId) {
        List<TreatmentHistoryDTO> histories = treatmentHistoryService.getByTreatmentPlanId(treatmentPlanId);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử điều trị theo patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TreatmentHistoryDTO>> getByPatientId(@PathVariable Integer patientId) {
        List<TreatmentHistoryDTO> histories = treatmentHistoryService.getByPatientId(patientId);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử điều trị theo doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<TreatmentHistoryDTO>> getByDoctorId(@PathVariable Integer doctorId) {
        List<TreatmentHistoryDTO> histories = treatmentHistoryService.getByDoctorId(doctorId);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử điều trị trong khoảng thời gian
    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<List<TreatmentHistoryDTO>> getByPatientIdAndDateRange(
            @PathVariable Integer patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<TreatmentHistoryDTO> histories = treatmentHistoryService.getByPatientIdAndDateRange(patientId, startDate, endDate);
        return ResponseEntity.ok(histories);
    }

    // Lấy lịch sử thay đổi protocol cụ thể
    @GetMapping("/protocol-change")
    public ResponseEntity<List<TreatmentHistoryDTO>> getByProtocolChange(
            @RequestParam(required = false) Integer oldProtocolId,
            @RequestParam(required = false) Integer newProtocolId) {
        List<TreatmentHistoryDTO> histories = treatmentHistoryService.getByProtocolChange(oldProtocolId, newProtocolId);
        return ResponseEntity.ok(histories);
    }

} 