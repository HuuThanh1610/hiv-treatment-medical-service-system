package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.LabRequestItemRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.LabRequestRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.exception.customexceptions.NotFoundException;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabResultMessageDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.dto.LabResultNotificationRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.service.LabResultMessageService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.util.LabResultAnalyzer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;


@Slf4j
@Service
@RequiredArgsConstructor
public class LabResultMessageServiceImpl implements LabResultMessageService {

    private final LabRequestItemRepository labRequestItemRepository;
    private final LabRequestRepository labRequestRepository;
    
    // Sử dụng in-memory storage để lưu thông báo (có thể thay bằng Redis hoặc database)
    private final ConcurrentHashMap<Integer, LabResultMessageDTO> notifications = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Integer, Boolean> readStatus = new ConcurrentHashMap<>();

    @Override
    public LabResultMessageDTO createLabResultNotification(LabResultNotificationRequestDTO request) {
        LabRequestItem labRequestItem = labRequestItemRepository.findById(request.getLabRequestItemId())
                .orElseThrow(() -> new NotFoundException("Lab request item not found"));

        LabRequest labRequest = labRequestItem.getLabRequest();
        LabTestType testType = labRequestItem.getTestType();
        
        // Cập nhật kết quả xét nghiệm
        labRequestItem.setResultValue(request.getResultValue());
        labRequestItem.setNotes(request.getNotes());
        labRequestItemRepository.save(labRequestItem);

        // Phân tích kết quả và tạo thông báo
        LabResultMessageDTO notification = analyzeAndCreateNotification(
                request.getLabRequestItemId(), 
                request.getResultValue()
        );

        // Lưu thông báo vào memory
        notifications.put(request.getLabRequestItemId(), notification);
        readStatus.put(request.getLabRequestItemId(), false);

        log.info("Created lab result notification for item {}: {}", 
                request.getLabRequestItemId(), notification.getMessage());

        return notification;
    }

    @Override
    public List<LabResultMessageDTO> getPatientNotifications(Integer patientId) {
        return notifications.values().stream()
                .filter(notification -> notification.getPatientId().equals(patientId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Override
    public List<LabResultMessageDTO> getDoctorNotifications(Integer doctorId) {
        return notifications.values().stream()
                .filter(notification -> notification.getDoctorId().equals(doctorId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Override
    public List<LabResultMessageDTO> getUnreadPatientNotifications(Integer patientId) {
        return notifications.values().stream()
                .filter(notification -> notification.getPatientId().equals(patientId))
                .filter(notification -> !readStatus.getOrDefault(notification.getLabRequestItemId(), true))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Override
    public List<LabResultMessageDTO> getUnreadDoctorNotifications(Integer doctorId) {
        return notifications.values().stream()
                .filter(notification -> notification.getDoctorId().equals(doctorId))
                .filter(notification -> !readStatus.getOrDefault(notification.getLabRequestItemId(), true))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Override
    public void markNotificationAsRead(Integer labRequestItemId) {
        readStatus.put(labRequestItemId, true);
        log.info("Marked notification as read for lab request item: {}", labRequestItemId);
    }

    @Override
    public LabResultMessageDTO analyzeAndCreateNotification(Integer labRequestItemId, String resultValue) {
        LabRequestItem labRequestItem = labRequestItemRepository.findById(labRequestItemId)
                .orElseThrow(() -> new NotFoundException("Lab request item not found"));

        LabRequest labRequest = labRequestItem.getLabRequest();
        LabTestType testType = labRequestItem.getTestType();
        
        // Phân tích kết quả
        String status = analyzeResultStatus(resultValue, testType);
        String severityLevel = determineSeverityLevel(status, testType);
        String message = createCustomMessage(testType, resultValue, status);
        String notificationType = determineNotificationType(status, severityLevel);

        // Null check cho doctor
        Integer doctorId = null;
        String doctorName = null;
        if (labRequest.getDoctor() != null) {
            doctorId = labRequest.getDoctor().getId();
            if (labRequest.getDoctor().getUser() != null) {
                doctorName = labRequest.getDoctor().getUser().getFullName();
            }
        }

        return LabResultMessageDTO.builder()
                .labRequestItemId(labRequestItemId)
                .patientId(labRequest.getPatient().getId())
                .patientName(labRequest.getPatient().getUser().getFullName())
                .doctorId(doctorId)
                .doctorName(doctorName)
                .testName(testType.getName())
                .resultValue(resultValue)
                .normalRange(testType.getNormalRange())
                .unit(testType.getUnit())
                .status(status)
                .severityLevel(severityLevel)
                .message(message)
                .notificationType(notificationType)
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
    }

    @Override
    public List<LabResultMessageDTO> getImportantNotifications() {
        return notifications.values().stream()
                .filter(notification -> "HIGH".equals(notification.getSeverityLevel()) || 
                                       "CRITICAL".equals(notification.getSeverityLevel()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .toList();
    }

    @Override
    public long countUnreadPatientNotifications(Integer patientId) {
        return notifications.values().stream()
                .filter(notification -> notification.getPatientId().equals(patientId))
                .filter(notification -> !readStatus.getOrDefault(notification.getLabRequestItemId(), true))
                .count();
    }

    @Override
    public long countUnreadDoctorNotifications(Integer doctorId) {
        return notifications.values().stream()
                .filter(notification -> notification.getDoctorId().equals(doctorId))
                .filter(notification -> !readStatus.getOrDefault(notification.getLabRequestItemId(), true))
                .count();
    }

    // Helper methods
    private String analyzeResultStatus(String resultValue, LabTestType testType) {
        return LabResultAnalyzer.analyzeResultStatus(resultValue, testType);
    }

    private String determineSeverityLevel(String status, LabTestType testType) {
        String testName = testType.getName().toLowerCase();
        
        // Xử lý trạng thái từ LabResultAnalyzer
        if ("CRITICAL_HIGH".equals(status) || "CRITICAL_LOW".equals(status) || "POSITIVE".equals(status)) {
            return "CRITICAL";
        }

        // Các xét nghiệm HIV và liên quan
        if (testName.contains("hiv") || testName.contains("cd4") || testName.contains("viral load")) {
            if ("HIGH".equals(status) || "LOW".equals(status)) {
                return "CRITICAL";
            }
        }

        // Các xét nghiệm viêm gan và men gan
        if (testName.contains("hepatitis") || testName.contains("viêm gan") || 
            testName.contains("alt") || testName.contains("ast")) {
            if ("HIGH".equals(status) || "LOW".equals(status)) {
                return "HIGH";
            }
        }

        if (testName.contains("hemoglobin") || testName.contains("creatinine") || 
            testName.contains("glucose") || testName.contains("cholesterol")) {
            if ("HIGH".equals(status) || "LOW".equals(status)) {
                return "HIGH";
            }
        }

        if ("HIGH".equals(status) || "LOW".equals(status) || "BORDERLINE".equals(status)) {
            return "MEDIUM";
        }

        if ("NEGATIVE".equals(status) || "NORMAL".equals(status)) {
            return "LOW";
        }

        return "MEDIUM"; // Trường hợp mặc định
    }



    private String determineNotificationType(String status, String severityLevel) {
        if ("CRITICAL".equals(severityLevel)) {
            return "CRITICAL_VALUE";
        } else if ("HIGH".equals(status) || "LOW".equals(status)) {
            return "ABNORMAL_RESULT";
        } else {
            return "RESULT_ENTRY";
        }
    }

    // Helper methods for creating messages
    private String createCustomMessage(LabTestType testType, String resultValue, String status) {
        String testName = testType.getName().toLowerCase();
        
        // Xét nghiệm CD4 - đếm tế bào CD4
        if (testName.contains("cd4")) {
            return createCD4Message(resultValue, status);
        } 
        // Xét nghiệm tải lượng virus HIV
        else if (testName.contains("viral load") || testName.contains("hiv rna") || testName.contains("tải lượng virus")) {
            return createViralLoadMessage(resultValue, status);
        } 
        // Xét nghiệm kháng thể HIV (dương tính/âm tính)
        else if (testName.contains("hiv antibody") || 
                (testName.contains("hiv") && (resultValue.toLowerCase().contains("positive") || 
                                             resultValue.toLowerCase().contains("negative") ||
                                             resultValue.toLowerCase().contains("dương tính") ||
                                             resultValue.toLowerCase().contains("âm tính")))) {
            return createHIVTestMessage(testType.getName(), resultValue, status);
        }
        // Xét nghiệm viêm gan B/C
        else if (testName.contains("hepatitis") || testName.contains("viêm gan")) {
            return createHepatitisTestMessage(testType.getName(), resultValue, status);
        }
        // Xét nghiệm men gan (ALT/AST)
        else if (testName.contains("alt") || testName.contains("ast")) {
            return createLiverEnzymeMessage(testType.getName(), resultValue, status, testType.getUnit(), testType.getNormalRange());
        }
        // Xét nghiệm Hemoglobin
        else if (testName.contains("hemoglobin") || testName.contains("hb")) {
            return createHemoglobinMessage(resultValue, status);
        } 
        // Xét nghiệm Creatinine
        else if (testName.contains("creatinine") || testName.contains("cr")) {
            return createCreatinineMessage(resultValue, status);
        }

        // Message mặc định cho các trạng thái khác nhau
        switch (status.toUpperCase()) {
            case "NORMAL":
            case "NEGATIVE":
                return createNormalResultMessage(testType.getName(), resultValue, testType.getUnit());
            case "LOW":
            case "BORDERLINE":
                return createLowResultMessage(testType.getName(), resultValue, testType.getUnit(), testType.getNormalRange());
            case "HIGH":
                return createHighResultMessage(testType.getName(), resultValue, testType.getUnit(), testType.getNormalRange());
            case "CRITICAL_HIGH":
            case "CRITICAL_LOW":
            case "CRITICAL":
            case "POSITIVE":
                return createCriticalResultMessage(testType.getName(), resultValue, testType.getUnit(), testType.getNormalRange());
            case "INDETERMINATE":
                return String.format("⚠️ Kết quả xét nghiệm %s: %s - Không xác định, cần xét nghiệm lại", 
                    testType.getName(), resultValue);
            default:
                return createResultEntryMessage(testType.getName(), resultValue, testType.getUnit());
        }
    }

    private String createNormalResultMessage(String testName, String resultValue, String unit) {
        return String.format("✅ Kết quả xét nghiệm %s: %s %s - Bình thường", 
                testName, resultValue, unit != null ? unit : "");
    }

    private String createLowResultMessage(String testName, String resultValue, String unit, String normalRange) {
        return String.format("⚠️ Kết quả xét nghiệm %s: %s %s - Thấp hơn bình thường (Chuẩn: %s)", 
                testName, resultValue, unit != null ? unit : "", normalRange);
    }

    private String createHighResultMessage(String testName, String resultValue, String unit, String normalRange) {
        return String.format("⚠️ Kết quả xét nghiệm %s: %s %s - Cao hơn bình thường (Chuẩn: %s)", 
                testName, resultValue, unit != null ? unit : "", normalRange);
    }

    private String createCriticalResultMessage(String testName, String resultValue, String unit, String normalRange) {
        return String.format("🚨 Kết quả xét nghiệm %s: %s %s - Cần chú ý đặc biệt (Chuẩn: %s)", 
                testName, resultValue, unit != null ? unit : "", normalRange);
    }

    private String createResultEntryMessage(String testName, String resultValue, String unit) {
        return String.format("📋 Đã nhập kết quả xét nghiệm %s: %s %s", 
                testName, resultValue, unit != null ? unit : "");
    }

    /**
     * Tạo thông báo cho xét nghiệm kháng thể HIV
     * Mức độ bình thường:
     * Âm tính (Negative): Không nhiễm hoặc trong giai đoạn cửa sổ
     * Dương tính (Positive): Có thể nhiễm HIV – cần xét nghiệm khẳng định
     */
    private String createHIVTestMessage(String testName, String resultValue, String status) {
        String emoji = "🔬";
        String statusText = "";
        String result = resultValue.toLowerCase();

        if (status.equalsIgnoreCase("POSITIVE") || result.contains("positive") || result.contains("dương tính")) {
            emoji = "🚨";
            statusText = "Dương tính - Cần xét nghiệm khẳng định và điều trị";
        } else if (status.equalsIgnoreCase("NEGATIVE") || result.contains("negative") || result.contains("âm tính")) {
            emoji = "✅";
            statusText = "Âm tính - Không phát hiện kháng thể HIV";
        } else if (status.equalsIgnoreCase("INDETERMINATE") || result.contains("indeterminate") || result.contains("không xác định")) {
            emoji = "⚠️";
            statusText = "Không xác định - Cần xét nghiệm lại sau 4-6 tuần";
        } else {
            statusText = "Kết quả: " + resultValue;
        }

        return String.format("%s Xét nghiệm kháng thể HIV (%s): %s - %s", 
                emoji, testName, resultValue, statusText);
    }

    /**
     * Tạo thông báo cho xét nghiệm CD4 theo tiêu chuẩn WHO
     * - >500 cells/μL: Bình thường
     * - 350-500 cells/μL: Suy giảm nhẹ
     * - 200-350 cells/μL: Suy giảm vừa
     * - <200 cells/μL: Suy giảm nặng, nguy cơ NTCH cao
     */
    private String createCD4Message(String resultValue, String status) {
        try {
            String numericValue = resultValue.replaceAll("[^0-9.]", "").trim();
            int cd4Count = Integer.parseInt(numericValue);
            String message;

            if (cd4Count >= 500) {
                message = String.format("✅ Kết quả xét nghiệm CD4: %s cells/μL - Miễn dịch bình thường (Chuẩn: >500 cells/μL)", resultValue);
            } else if (cd4Count >= 350) {
                message = String.format("⚠️ Kết quả xét nghiệm CD4: %s cells/μL - Suy giảm miễn dịch nhẹ, cần theo dõi (Chuẩn: >500 cells/μL)", resultValue);
            } else if (cd4Count >= 200) {
                message = String.format("🚨 Kết quả xét nghiệm CD4: %s cells/μL - Suy giảm miễn dịch vừa, cần dự phòng NTCH (Chuẩn: >500 cells/μL)", resultValue);
            } else {
                message = String.format("🚨 Kết quả xét nghiệm CD4: %s cells/μL - Suy giảm miễn dịch nặng, nguy cơ NTCH cao (Chuẩn: >500 cells/μL)", resultValue);
            }
            return message;
        } catch (NumberFormatException e) {
            log.error("Lỗi khi phân tích số lượng CD4: {}", e.getMessage());
            return String.format("⚠️ Không thể phân tích kết quả CD4: %s", resultValue);
        }
    }

    /**
     * Tạo thông báo cho xét nghiệm tải lượng virus HIV theo tiêu chuẩn WHO
     * - Không phát hiện hoặc < 50 copies/mL: Ức chế virus tối ưu
     * - 50-200 copies/mL: Blip tạm thời, cần theo dõi
     * - 200-1000 copies/mL: Thất bại điều trị thấp
     * - >1000 copies/mL: Thất bại điều trị, cần đổi phác đồ
     */
    private String createViralLoadMessage(String resultValue, String status) {
        String message;

        // Kiểm tra "không phát hiện" với encoding đúng
        if (resultValue.toLowerCase().contains("undetectable") || 
            resultValue.toLowerCase().contains("khong phat hien") || 
            resultValue.toLowerCase().contains("không phát hiện") || 
            resultValue.equals("0")) {
            return "✅ Kết quả xét nghiệm Tải lượng virus HIV: Không phát hiện - Ức chế virus tối ưu (Chuẩn: <50 copies/mL)";
        }

        try {
            String numericValue = resultValue.replaceAll("[^0-9.]", "").trim();
            double viralLoad = Double.parseDouble(numericValue);

            if (viralLoad < 50) {
                message = String.format("✅ Kết quả xét nghiệm Tải lượng virus HIV: %s copies/mL - Ức chế virus tối ưu (Chuẩn: <50 copies/mL)", resultValue);
            } else if (viralLoad < 200) {
                message = String.format("⚠️ Kết quả xét nghiệm Tải lượng virus HIV: %s copies/mL - Blip tạm thời, cần theo dõi lại sau 4 tuần (Chuẩn: <50 copies/mL)", resultValue);
            } else if (viralLoad < 1000) {
                message = String.format("🚨 Kết quả xét nghiệm Tải lượng virus HIV: %s copies/mL - Thất bại điều trị mức thấp, cần đánh giá tuân thủ và tác dụng phụ (Chuẩn: <50 copies/mL)", resultValue);
            } else {
                message = String.format("🚨 Kết quả xét nghiệm Tải lượng virus HIV: %s copies/mL - Thất bại điều trị, cần đánh giá kháng thuốc và đổi phác đồ (Chuẩn: <50 copies/mL)", resultValue);
            }
            return message;
        } catch (NumberFormatException e) {
            log.error("Lỗi khi phân tích tải lượng virus: {}", e.getMessage());
            return String.format("⚠️ Không thể phân tích kết quả tải lượng virus: %s", resultValue);
        }
    }

    private String createHemoglobinMessage(String resultValue, String status) {
        double hb = Double.parseDouble(resultValue);
        String message;
        
        if (hb < 7) {
            message = String.format("🚨 Hemoglobin: %s g/dL - Thiếu máu nặng", resultValue);
        } else if (hb < 10) {
            message = String.format("⚠️ Hemoglobin: %s g/dL - Thiếu máu vừa", resultValue);
        } else if (hb < 12) {
            message = String.format("📊 Hemoglobin: %s g/dL - Thiếu máu nhẹ", resultValue);
        } else if (hb > 18) {
            message = String.format("⚠️ Hemoglobin: %s g/dL - Cao hơn bình thường", resultValue);
        } else {
            message = String.format("✅ Hemoglobin: %s g/dL - Bình thường", resultValue);
        }
        
        return message;
    }

    private String createCreatinineMessage(String resultValue, String status) {
        double cr = Double.parseDouble(resultValue);
        String message;
        
        if (cr > 5.0) {
            message = String.format("🚨 Creatinine: %s mg/dL - Suy thận nặng", resultValue);
        } else if (cr > 2.0) {
            message = String.format("⚠️ Creatinine: %s mg/dL - Suy thận vừa", resultValue);
        } else if (cr > 1.5) {
            message = String.format("📊 Creatinine: %s mg/dL - Suy thận nhẹ", resultValue);
        } else {
            message = String.format("✅ Creatinine: %s mg/dL - Bình thường", resultValue);
        }
        
        return message;
    }

    /**
     * Tạo thông báo cho xét nghiệm viêm gan B/C
     */
    private String createHepatitisTestMessage(String testName, String resultValue, String status) {
        String emoji = "🔬";
        String statusText = "";

        if ("POSITIVE".equals(status) || resultValue.toLowerCase().contains("positive") || 
            resultValue.toLowerCase().contains("dương tính")) {
            emoji = "🚨";
            statusText = "Dương tính - Cần điều trị";

            if (testName.toLowerCase().contains("b")) {
                statusText = "Dương tính với viêm gan B - Cần theo dõi và điều trị";
            } else if (testName.toLowerCase().contains("c")) {
                statusText = "Dương tính với viêm gan C - Cần theo dõi và điều trị";
            }
        } else if ("NEGATIVE".equals(status) || resultValue.toLowerCase().contains("negative") || 
                   resultValue.toLowerCase().contains("âm tính")) {
            emoji = "✅";
            statusText = "Âm tính";
        } else {
            statusText = "Kết quả: " + resultValue;
        }

        return String.format("%s Xét nghiệm %s: %s - %s", 
                emoji, testName, resultValue, statusText);
    }

    /**
     * Tạo thông báo cho xét nghiệm men gan (ALT/AST)
     */
    private String createLiverEnzymeMessage(String testName, String resultValue, String status, String unit, String normalRange) {
        String message;
        String rangeInfo = normalRange != null ? String.format(" (Chuẩn: %s)", normalRange) : "";

        switch (status.toUpperCase()) {
            case "CRITICAL_HIGH":
                message = String.format("🚨 %s: %s %s - Tăng cao đáng kể%s - Cần can thiệp khẩn cấp", 
                        testName, resultValue, unit != null ? unit : "", rangeInfo);
                break;
            case "HIGH":
                message = String.format("⚠️ %s: %s %s - Cao hơn bình thường%s - Có thể chỉ định tổn thương gan", 
                        testName, resultValue, unit != null ? unit : "", rangeInfo);
                break;
            case "LOW":
                message = String.format("📊 %s: %s %s - Thấp hơn bình thường%s", 
                        testName, resultValue, unit != null ? unit : "", rangeInfo);
                break;
            case "NORMAL":
                message = String.format("✅ %s: %s %s - Bình thường%s", 
                        testName, resultValue, unit != null ? unit : "", rangeInfo);
                break;
            default:
                message = String.format("📋 %s: %s %s%s", 
                        testName, resultValue, unit != null ? unit : "", rangeInfo);
        }

        return message;
    }
} 