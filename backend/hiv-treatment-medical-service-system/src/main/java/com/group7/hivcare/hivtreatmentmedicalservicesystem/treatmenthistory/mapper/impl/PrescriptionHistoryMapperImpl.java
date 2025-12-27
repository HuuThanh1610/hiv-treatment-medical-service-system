package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionHistory;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PrescriptionMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.PrescriptionHistoryDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper.PrescriptionHistoryMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper chuyển đổi PrescriptionHistory Entity thành PrescriptionHistoryDTO
 * Đây là component quan trọng nhất - chịu trách nhiệm cung cấp createdAt và oldMedications cho Frontend
 */
@Component
public class PrescriptionHistoryMapperImpl implements PrescriptionHistoryMapper {

    @Autowired
    private PrescriptionMedicationRepository prescriptionMedicationRepository;

    @Autowired
    private ARVMedicationRepository arvMedicationRepository;

    /**
     * Method chính chuyển đổi Entity -> DTO
     * Frontend nhận được DTO này với đầy đủ createdAt và oldMedications
     */
    @Override
    public PrescriptionHistoryDTO toDTO(PrescriptionHistory entity) {
        if (entity == null) {
            return null;
        }

        /**
         * Lấy danh sách thuốc từ đơn thuốc cũ để Frontend hiển thị tên đơn thuốc
         * Query: SELECT * FROM prescription_medication WHERE prescription_id = ?
         * Sau đó map thành MedicationInfo với tên thuốc từ ARVMedication
         */
        List<PrescriptionHistoryDTO.MedicationInfo> oldMedications =
            prescriptionMedicationRepository.findByPrescriptionId(entity.getPrescription().getId())
                .stream()
                .map(this::convertToMedicationInfo) // Convert sang MedicationInfo với tên thuốc
                .collect(Collectors.toList());
        
        /**
         * Build DTO với tất cả thông tin cần thiết cho Frontend:
         * - createdAt: thời gian tạo lịch sử (Frontend dùng để hiển thị ngày thay vì N/A)
         * - oldMedications: danh sách thuốc (Frontend dùng để tạo tên đơn thuốc)
         * - patientName, doctorName: tên đã được resolve từ User entity
         */
        return PrescriptionHistoryDTO.builder()
                .id(entity.getId())
                .treatmentPlanId(entity.getTreatmentPlan().getId())
                .prescriptionId(entity.getPrescription().getId())
                .changeReason(entity.getChangeReason())
                .createdAt(entity.getCreatedAt()) // ✅ Quan trọng: Frontend dùng để hiển thị ngày
                .patientId(entity.getTreatmentPlan().getPatient().getId())
                .patientName(entity.getTreatmentPlan().getPatient().getUser().getFullName())
                .doctorId(entity.getTreatmentPlan().getDoctor().getId())
                .doctorName(entity.getTreatmentPlan().getDoctor().getUser().getFullName())
                .oldMedications(oldMedications) // ✅ Quan trọng: Frontend dùng để tạo tên đơn thuốc
                .build();
    }
    
    /**
     * Helper method chuyển đổi PrescriptionMedication thành MedicationInfo
     * Resolve tên thuốc từ ARVMedication table để Frontend có thể hiển thị tên thuốc
     */
    private PrescriptionHistoryDTO.MedicationInfo convertToMedicationInfo(PrescriptionMedication prescriptionMedication) {
        // Query ARVMedication để lấy tên thuốc (Lamivudine, Efavirenz, etc.)
        String medicationName = arvMedicationRepository.findById(prescriptionMedication.getId().getMedicationId())
                .map(medication -> medication.getName())
                .orElse("Không xác định");

        return PrescriptionHistoryDTO.MedicationInfo.builder()
                .medicationId(prescriptionMedication.getId().getMedicationId())
                .name(medicationName) // ✅ Tên thuốc Frontend sẽ dùng để hiển thị
                .dosage(prescriptionMedication.getDosage())
                .frequency(prescriptionMedication.getFrequency())
                .durationDays(prescriptionMedication.getDurationDays())
                .notes(prescriptionMedication.getNotes())
                .build();
    }
    
    @Override
    public List<PrescriptionHistoryDTO> toDTOList(List<PrescriptionHistory> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
} 