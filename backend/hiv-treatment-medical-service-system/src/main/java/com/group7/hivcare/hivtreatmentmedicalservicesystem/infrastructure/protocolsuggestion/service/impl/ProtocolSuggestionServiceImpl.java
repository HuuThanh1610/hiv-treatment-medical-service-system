package com.group7.hivcare.hivtreatmentmedicalservicesystem.infrastructure.protocolsuggestion.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.infrastructure.protocolsuggestion.service.ProtocolSuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProtocolSuggestionServiceImpl implements ProtocolSuggestionService {

    private final LabRequestRepository labRequestRepository;
    private final LabRequestItemRepository labRequestItemRepository;
    private final PatientsRepository patientsRepository;
    private final ARVProtocolRepository arvProtocolRepository;
    private final LabTestTypeRepository labTestTypeRepository;


    @Override
    public List<ARVProtocolDTO> suggestProtocols(Integer patientId) {
        Patients patient = patientsRepository.findById(patientId).orElse(null);
        if (patient == null) return List.of();
        List<ARVProtocol> protocols = arvProtocolRepository.getAllByTargetGroup(patient.getTargetGroup());
        if(protocols.isEmpty()) return List.of();
        return protocols.stream()
                .map(protocol -> ARVProtocolDTO.builder()
                        .id(protocol.getId())
                        .name(protocol.getName())
                        .description(protocol.getDescription())
                        .targetGroup(protocol.getTargetGroup())
                        .build())
                .collect(Collectors.toList());
    }

//    @Override
//    public List<ProtocolSuggestionDTO> suggestProtocolsForChildren(Integer patientId, Integer labRequestId) {
//        Patients patient = patientsRepository.findById(patientId).orElse(null);
//        if (patient == null) return List.of();
//        List<ARVProtocol> protocols = arvProtocolRepository.findAll();
//        return protocols.stream()
//                .filter(protocol -> protocol.getTargetGroup() == TargetGroup.CHILD)
//                .map(protocol -> ProtocolSuggestionDTO.builder()
//                        .arvProtocolId(protocol.getId())
//                        .protocolName(protocol.getName())
//                        .description(protocol.getDescription())
//                        .confidenceScore(100.0)
//                        .reason("Phù hợp với nhóm trẻ em")
//                        .matchingCriteria(List.of("Trẻ em"))
//                        .contraindications(List.of())
//                        .targetGroup(protocol.getTargetGroup())
//                        .build())
//                .collect(Collectors.toList());
//    }

//    @Override
//    public LabResultsAnalysisDTO analyzeLabResultsAndSuggestProtocols(Integer labRequestId) {
//        LabRequest labRequest = labRequestRepository.findById(labRequestId).orElse(null);
//        if (labRequest == null) return null;
//
//        Patients patient = labRequest.getPatient();
//        List<LabRequestItem> labItems = labRequestItemRepository.findByLabRequestId(labRequestId);
//
//        // Phân tích kết quả xét nghiệm
//        List<LabResultItemAnalysisDTO> labResults = analyzeLabResults(labItems);
//
//        // Đề xuất phác đồ
//        List<ProtocolSuggestionDTO> suggestedProtocols = suggestProtocols(patient.getId(), labRequestId);
//
//        // Phân tích tổng quan
//        String analysisSummary = generateAnalysisSummary(labResults, patient);
//        List<String> riskFactors = identifyRiskFactors(labResults, patient);
//        List<String> recommendations = geanerateRecommendtions(labResults, patient);
//
//        return LabResultsAnalysisDTO.builder()
//                .patientId(patient.getId())
//                .labRequestId(labRequestId)
//                .patientName(patient.getUser().getFullName())
//                .age(calculateAge(patient.getUser().getBirthday()))
//                .gender(patient.getUser().getGender())
//                .isPregnant(patient.getTargetGroup() == TargetGroup.PREGNANT)
//                .isChild(patient.getTargetGroup() == TargetGroup.CHILD)
//                .labResults(labResults)
//                .analysisSummary(analysisSummary)
//                .suggestedProtocols(suggestedProtocols)
//                .riskFactors(riskFactors)
//                .recommendations(recommendations)
//                .build();
//    }
//
//    @Override
//    public List<ProtocolSuggestionDTO> suggestProtocols(Integer patientId, Integer labRequestId) {
//        Patients patient = patientsRepository.findById(patientId).orElse(null);
//        if (patient == null) return List.of();
//
//        List<LabRequestItem> labItems = labRequestItemRepository.findByLabRequestId(labRequestId);
//        Map<String, String> labValues = extractLabValues(labItems);
//
//        return suggestProtocolsByLabValues(patient, labValues);
//    }
//
//    @Override
//    public List<ProtocolSuggestionDTO> suggestProtocolsByParameters(Integer patientId,
//                                                                   String cd4Count,
//                                                                   String viralLoad,
//                                                                   String hbLevel,
//                                                                   Boolean isPregnant,
//                                                                   Boolean isChild) {
//        Patients patient = patientsRepository.findById(patientId).orElse(null);
//        if (patient == null) return List.of();
//
//        Map<String, String> labValues = new HashMap<>();
//        labValues.put("CD4 Count", cd4Count);
//        labValues.put("HIV Viral Load", viralLoad);
//        labValues.put("Hemoglobin", hbLevel);
//
//        // Nếu truyền vào isPregnant hoặc isChild, override targetGroup tạm thời
//        TargetGroup originalGroup = patient.getTargetGroup();
//        TargetGroup tempGroup = originalGroup;
//        if (Boolean.TRUE.equals(isPregnant)) {
//            tempGroup = TargetGroup.PREGNANT;
//        } else if (Boolean.TRUE.equals(isChild)) {
//            tempGroup = TargetGroup.CHILD;
//        }
//        // Tạo bản sao bệnh nhân với targetGroup tạm thời nếu cần
//        Patients tempPatient = patient;
//        if (tempGroup != originalGroup) {
//            tempPatient = Patients.builder()
//                    .id(patient.getId())
//                    .user(patient.getUser())
//                    .medicalRecordNumber(patient.getMedicalRecordNumber())
//                    .pregnant(tempGroup == TargetGroup.PREGNANT)
//                    .createdAt(patient.getCreatedAt())
//                    .updatedAt(patient.getUpdatedAt())
//                    .build();
//        }
//        return suggestProtocolsByLabValues(tempPatient, labValues);
//    }
//
//
//    private List<LabResultItemAnalysisDTO> analyzeLabResults(List<LabRequestItem> labItems) {
//        return labItems.stream()
//                .map(this::convertToLabResultItemAnalysisDTO)
//                .collect(Collectors.toList());
//    }
//
//    private LabResultItemAnalysisDTO convertToLabResultItemAnalysisDTO(LabRequestItem item) {
//        LabTestType testType = item.getTestType();
//        String status = interpretLabResult(item.getResultValue(), testType.getNormalRange());
//        String interpretation = generateInterpretation(item.getResultValue(), testType.getName(), status);
//
//        return LabResultItemAnalysisDTO.builder()
//                .testTypeId(testType.getId())
//                .testName(testType.getName())
//                .resultValue(item.getResultValue())
//                .unit(testType.getUnit())
//                .normalRange(testType.getNormalRange())
//                .status(status)
//                .interpretation(interpretation)
//                .price(testType.getPrice())
//                .build();
//    }
//
//    private String interpretLabResult(String resultValue, String normalRange) {
//        if (resultValue == null || normalRange == null) return "UNKNOWN";
//
//        try {
//            double value = Double.parseDouble(resultValue);
//            String[] range = normalRange.split("-");
//            double min = Double.parseDouble(range[0]);
//            double max = Double.parseDouble(range[1]);
//
//            if (value < min) return "LOW";
//            if (value > max) return "HIGH";
//            return "NORMAL";
//        } catch (Exception e) {
//            return "UNKNOWN";
//        }
//    }
//
//    private String generateInterpretation(String resultValue, String testName, String status) {
//        if (resultValue == null) return "Không có kết quả";
//
//        switch (testName.toLowerCase()) {
//            case "cd4 count":
//                return interpretCD4Count(resultValue, status);
//            case "hiv viral load":
//                return interpretViralLoad(resultValue, status);
//            case "hemoglobin":
//                return interpretHemoglobin(resultValue, status);
//            default:
//                return "Kết quả " + status.toLowerCase();
//        }
//    }
//
//    private String interpretCD4Count(String resultValue, String status) {
//        try {
//            int cd4 = Integer.parseInt(resultValue);
//            if (cd4 < 200) return "CD4 rất thấp, cần điều trị ARV khẩn cấp";
//            if (cd4 < 350) return "CD4 thấp, cần điều trị ARV";
//            if (cd4 < 500) return "CD4 trung bình, có thể cân nhắc điều trị ARV";
//            return "CD4 tốt, có thể theo dõi";
//        } catch (Exception e) {
//            return "Không thể diễn giải kết quả CD4";
//        }
//    }
//
//    private String interpretViralLoad(String resultValue, String status) {
//        try {
//            double viralLoad = Double.parseDouble(resultValue);
//            if (viralLoad > 100000) return "Tải lượng virus cao, cần điều trị ARV tích cực";
//            if (viralLoad > 10000) return "Tải lượng virus trung bình";
//            return "Tải lượng virus thấp";
//        } catch (Exception e) {
//            return "Không thể diễn giải tải lượng virus";
//        }
//    }
//
//    private String interpretHemoglobin(String resultValue, String status) {
//        try {
//            double hb = Double.parseDouble(resultValue);
//            if (hb < 10) return "Thiếu máu nặng, cần bổ sung sắt";
//            if (hb < 12) return "Thiếu máu nhẹ";
//            return "Hemoglobin bình thường";
//        } catch (Exception e) {
//            return "Không thể diễn giải hemoglobin";
//        }
//    }
//
//    private List<ProtocolSuggestionDTO> suggestProtocolsByLabValues(Patients patient, Map<String, String> labValues) {
//        List<ARVProtocol> allProtocols = arvProtocolRepository.findAll();
//        List<ProtocolSuggestionDTO> suggestions = new ArrayList<>();
//        TargetGroup patientGroup = patient.getTargetGroup();
//
//        for (ARVProtocol protocol : allProtocols) {
//            double score = calculateProtocolScore(protocol, patient, labValues);
//            if (score > 0 && protocol.getTargetGroup() == patientGroup) {
//                ProtocolSuggestionDTO suggestion = buildProtocolSuggestion(protocol, score, patient, labValues);
//                suggestions.add(suggestion);
//            }
//        }
//
//        // Sắp xếp theo điểm tin cậy giảm dần
//        suggestions.sort((a, b) -> Double.compare(b.getConfidenceScore(), a.getConfidenceScore()));
//
//        return suggestions;
//    }
//
//    private double calculateProtocolScore(ARVProtocol protocol, Patients patient, Map<String, String> labValues) {
//        double score = 0.0;
//        TargetGroup patientGroup = patient.getTargetGroup();
//        if (protocol.getTargetGroup() == patientGroup) {
//            score += 50;
//        }
//        // Đánh giá dựa trên CD4 Count
//        String cd4Value = labValues.get("CD4 Count");
//        if (cd4Value != null) {
//            try {
//                int cd4 = Integer.parseInt(cd4Value);
//                if (cd4 < 200) {
//                    score += 20;
//                } else if (cd4 < 350) {
//                    score += 15;
//                } else {
//                    score += 10;
//                }
//            } catch (Exception e) {
//                score += 5;
//            }
//        }
//        // Đánh giá dựa trên Viral Load
//        String viralLoadValue = labValues.get("HIV Viral Load");
//        if (viralLoadValue != null) {
//            try {
//                double viralLoad = Double.parseDouble(viralLoadValue);
//                if (viralLoad > 100000) {
//                    score += 20;
//                } else if (viralLoad > 10000) {
//                    score += 15;
//                } else {
//                    score += 10;
//                }
//            } catch (Exception e) {
//                score += 5;
//            }
//        }
//        return score;
//    }
//
//    private ProtocolSuggestionDTO buildProtocolSuggestion(ARVProtocol protocol, double score,
//                                                         Patients patient, Map<String, String> labValues) {
//        List<String> matchingCriteria = new ArrayList<>();
//        List<String> contraindications = new ArrayList<>();
//        String reason = generateSuggestionReason(protocol, patient, labValues);
//        TargetGroup patientGroup = patient.getTargetGroup();
//        if (protocol.getTargetGroup() == patientGroup) {
//            matchingCriteria.add("Phù hợp cho nhóm " + patientGroup.name());
//        } else {
//            contraindications.add("Không phù hợp cho nhóm " + patientGroup.name());
//        }
//        return ProtocolSuggestionDTO.builder()
//                .arvProtocolId(protocol.getId())
//                .protocolName(protocol.getName())
//                .description(protocol.getDescription())
//                .confidenceScore(score)
//                .reason(reason)
//                .matchingCriteria(matchingCriteria)
//                .contraindications(contraindications)
//                .targetGroup(protocol.getTargetGroup())
//                .build();
//    }
//
//    private String generateSuggestionReason(ARVProtocol protocol, Patients patient, Map<String, String> labValues) {
//        StringBuilder reason = new StringBuilder();
//        reason.append("Đề xuất phác đồ ").append(protocol.getName()).append(" cho nhóm ").append(protocol.getTargetGroup().name()).append(" dựa trên: ");
//        String cd4Value = labValues.get("CD4 Count");
//        if (cd4Value != null) {
//            try {
//                int cd4 = Integer.parseInt(cd4Value);
//                if (cd4 < 200) {
//                    reason.append("CD4 thấp cần điều trị tích cực, ");
//                }
//            } catch (Exception e) {
//                // Ignore
//            }
//        }
//        return reason.toString().replaceAll(", $", "");
//    }
//
//    private Map<String, String> extractLabValues(List<LabRequestItem> labItems) {
//        Map<String, String> values = new HashMap<>();
//        for (LabRequestItem item : labItems) {
//            values.put(item.getTestType().getName(), item.getResultValue());
//        }
//        return values;
//    }
//
//    private int calculateAge(LocalDate dob) {
//        if (dob == null) return 0;
//        return Period.between(dob, LocalDate.now()).getYears();
//    }
//
//    private boolean isPregnant(Patients patient) {
//        // Có thể thêm trường isPregnant vào entity Patients
//        // Hoặc lấy từ thông tin khác
//        return false; // Tạm thời
//    }
//
//    private boolean isChild(Patients patient) {
//        return calculateAge(patient.getUser().getBirthday()) < 18;
//    }
//
//    private String generateAnalysisSummary(List<LabResultItemAnalysisDTO> labResults, Patients patient) {
//        StringBuilder summary = new StringBuilder();
//        summary.append("Phân tích kết quả xét nghiệm cho bệnh nhân ").append(patient.getUser().getFullName()).append(": ");
//
//        for (LabResultItemAnalysisDTO result : labResults) {
//            summary.append(result.getTestName()).append(": ").append(result.getInterpretation()).append(". ");
//        }
//
//        return summary.toString();
//    }
//
//    private List<String> identifyRiskFactors(List<LabResultItemAnalysisDTO> labResults, Patients patient) {
//        List<String> riskFactors = new ArrayList<>();
//
//        for (LabResultItemAnalysisDTO result : labResults) {
//            if ("LOW".equals(result.getStatus()) || "HIGH".equals(result.getStatus())) {
//                riskFactors.add(result.getTestName() + " bất thường: " + result.getResultValue());
//            }
//        }
//
//        if (calculateAge(patient.getUser().getBirthday()) < 18) {
//            riskFactors.add("Bệnh nhân trẻ em");
//        }
//
//        if (isPregnant(patient)) {
//            riskFactors.add("Phụ nữ mang thai");
//        }
//
//        return riskFactors;
//    }
//
//    private List<String> generateRecommendations(List<LabResultItemAnalysisDTO> labResults, Patients patient) {
//        List<String> recommendations = new ArrayList<>();
//
//        for (LabResultItemAnalysisDTO result : labResults) {
//            if ("CD4 Count".equals(result.getTestName()) && "LOW".equals(result.getStatus())) {
//                recommendations.add("Cần điều trị ARV khẩn cấp do CD4 thấp");
//            }
//            if ("HIV Viral Load".equals(result.getTestName()) && "HIGH".equals(result.getStatus())) {
//                recommendations.add("Cần điều trị ARV tích cực do tải lượng virus cao");
//            }
//            if ("Hemoglobin".equals(result.getTestName()) && "LOW".equals(result.getStatus())) {
//                recommendations.add("Cần bổ sung sắt do thiếu máu");
//            }
//        }
//
//        recommendations.add("Theo dõi định kỳ và tái khám theo lịch hẹn");
//
//        return recommendations;
//    }
}