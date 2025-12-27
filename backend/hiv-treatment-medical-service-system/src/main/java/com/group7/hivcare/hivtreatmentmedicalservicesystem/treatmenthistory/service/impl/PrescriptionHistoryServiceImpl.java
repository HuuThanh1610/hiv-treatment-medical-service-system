package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientTreatmentPlan;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Prescription;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionHistory;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientTreatmentPlanRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PrescriptionHistoryRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PrescriptionRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.PrescriptionHistoryDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper.PrescriptionHistoryMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service.PrescriptionHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service xử lý logic nghiệp vụ cho lịch sử đơn thuốc
 * Chịu trách nhiệm lấy dữ liệu từ Repository và chuyển đổi qua Mapper
 */
@Service
@RequiredArgsConstructor
public class PrescriptionHistoryServiceImpl implements PrescriptionHistoryService {

    private final PrescriptionHistoryRepository prescriptionHistoryRepository;
    private final PatientTreatmentPlanRepository treatmentPlanRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionHistoryMapper mapper; // Mapper chuyển Entity -> DTO với createdAt và oldMedications

    @Override
    public List<PrescriptionHistoryDTO> getByTreatmentPlanId(Integer treatmentPlanId) {
        // Lấy từ DB và sắp xếp theo createdAt giảm dần (mới nhất trước)
        List<PrescriptionHistory> histories = prescriptionHistoryRepository.findByTreatmentPlanIdOrderByCreatedAtDesc(treatmentPlanId);
        return mapper.toDTOList(histories);
    }

    /**
     * Method chính được Controller gọi để lấy lịch sử đơn thuốc của bệnh nhân
     * Repository query theo patientId và sắp xếp theo createdAt DESC
     */
    @Override
    public List<PrescriptionHistoryDTO> getByPatientId(Integer patientId) {
        List<PrescriptionHistory> histories = prescriptionHistoryRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
        return mapper.toDTOList(histories); // Mapper sẽ thêm createdAt và oldMedications vào DTO
    }

    @Override
    public List<PrescriptionHistoryDTO> getByDoctorId(Integer doctorId) {
        List<PrescriptionHistory> histories = prescriptionHistoryRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        return mapper.toDTOList(histories);
    }

    @Override
    public List<PrescriptionHistoryDTO> getByPrescriptionId(Integer prescriptionId) {
        List<PrescriptionHistory> histories = prescriptionHistoryRepository.findByPrescriptionIdOrderByCreatedAtDesc(prescriptionId);
        return mapper.toDTOList(histories);
    }

    @Override
    public List<PrescriptionHistoryDTO> getByPatientIdAndDateRange(Integer patientId, LocalDate startDate, LocalDate endDate) {
        List<PrescriptionHistory> histories = prescriptionHistoryRepository.findByPatientIdAndDateRange(patientId, startDate, endDate);
        return mapper.toDTOList(histories);
    }

    @Override
    public List<PrescriptionHistoryDTO> getByChangeReason(String changeReason) {
        List<PrescriptionHistory> histories = prescriptionHistoryRepository.findByChangeReasonContainingIgnoreCaseOrderByCreatedAtDesc(changeReason);
        return mapper.toDTOList(histories);
    }
} 