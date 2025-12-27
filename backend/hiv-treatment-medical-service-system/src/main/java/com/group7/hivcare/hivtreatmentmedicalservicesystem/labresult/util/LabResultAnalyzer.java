package com.group7.hivcare.hivtreatmentmedicalservicesystem.labresult.util;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.LabTestType;
import lombok.extern.slf4j.Slf4j;

/**
 * Lớp phân tích kết quả xét nghiệm HIV và các xét nghiệm liên quan
 */
@Slf4j
public class LabResultAnalyzer {

    /**
     * Phân tích trạng thái kết quả xét nghiệm
     * @param resultValue Giá trị kết quả xét nghiệm
     * @param testType Loại xét nghiệm
     * @return Trạng thái kết quả (NORMAL, HIGH, LOW, CRITICAL, POSITIVE, NEGATIVE, etc.)
     */
    public static String analyzeResultStatus(String resultValue, LabTestType testType) {
        try {
            if (resultValue == null || resultValue.trim().isEmpty()) {
                return "PENDING";
            }

            String testName = testType.getName().toLowerCase();
            String normalRange = testType.getNormalRange();

            // Xử lý kết quả định tính (như HIV test, Hep B/C)
            if (testName.contains("hiv antibody") || testName.contains("xét nghiệm kháng thể hiv") ||
                testName.contains("hepatitis") || testName.contains("viêm gan")) {
                return analyzeQualitativeResult(resultValue);
            }

            // Xử lý các loại xét nghiệm đặc biệt
            if (testName.contains("viral load") || testName.contains("hiv rna") || testName.contains("tải lượng virus")) {
                return analyzeViralLoad(resultValue);
            } else if (testName.contains("cd4") || testName.contains("tế bào cd4")) {
                return analyzeCD4Count(resultValue);
            } else if ((testName.contains("alt") || testName.contains("ast")) && 
                      (testName.contains("liver") || testName.contains("gan"))) {
                return analyzeLiverEnzymes(resultValue, testName, normalRange);
            }

            // Xử lý kết quả định lượng với khoảng bình thường
            if (normalRange != null && !normalRange.isEmpty()) {
                if (normalRange.contains("-")) {
                    return analyzeRangeResult(resultValue, normalRange);
                } else if (normalRange.contains("<") || normalRange.contains(">")) {
                    return analyzeThresholdResult(resultValue, normalRange);
                }
            }

            // Mặc định
            return "NORMAL";
        } catch (Exception e) {
            log.error("Lỗi khi phân tích kết quả xét nghiệm: {}", e.getMessage());
            return "UNKNOWN"; // Giá trị mặc định khi có lỗi
        }
    }

    /**
     * Phân tích kết quả tải lượng virus HIV theo WHO
     * - Không phát hiện hoặc < 50 copies/mL: Ức chế virus tối ưu
     * - 50-200 copies/mL: Blip tạm thời
     * - 200-1000 copies/mL: Thất bại điều trị thấp
     * - >1000 copies/mL: Thất bại điều trị
     */
    private static String analyzeViralLoad(String resultValue) {
        if (resultValue.toLowerCase().contains("không phát hiện") || 
            resultValue.toLowerCase().contains("undetectable") || 
            resultValue.equals("0")) {
            return "NORMAL";
        }

        try {
            String numericValue = resultValue.replaceAll("[^0-9.]", "").trim();
            double viralLoad = Double.parseDouble(numericValue);

            if (viralLoad < 50) {
                return "NORMAL";           // Ức chế virus tối ưu
            } else if (viralLoad < 200) {
                return "BORDERLINE";       // Blip tạm thời
            } else if (viralLoad < 1000) {
                return "HIGH";             // Thất bại điều trị thấp
            } else {
                return "CRITICAL_HIGH";    // Thất bại điều trị
            }
        } catch (NumberFormatException e) {
            log.error("Lỗi khi phân tích tải lượng virus: {}", e.getMessage());
            return "UNKNOWN";
        }
    }

    /**
     * Phân tích kết quả CD4 theo WHO
     * - >500 cells/μL: Bình thường
     * - 350-500 cells/μL: Suy giảm nhẹ
     * - 200-350 cells/μL: Suy giảm vừa
     * - <200 cells/μL: Suy giảm nặng
     */
    private static String analyzeCD4Count(String resultValue) {
        try {
            String numericValue = resultValue.replaceAll("[^0-9.]", "").trim();
            int cd4Count = Integer.parseInt(numericValue);

            if (cd4Count >= 500) {
                return "NORMAL";           // Miễn dịch bình thường
            } else if (cd4Count >= 350) {
                return "BORDERLINE";       // Suy giảm nhẹ
            } else if (cd4Count >= 200) {
                return "LOW";              // Suy giảm vừa
            } else {
                return "CRITICAL_LOW";     // Suy giảm nặng
            }
        } catch (NumberFormatException e) {
            log.error("Lỗi khi phân tích số lượng CD4: {}", e.getMessage());
            return "UNKNOWN";
        }
    }

    /**
     * Phân tích kết quả xét nghiệm định tính (như HIV test)
     */
    private static String analyzeQualitativeResult(String resultValue) {
        String result = resultValue.toLowerCase();
        if (result.contains("positive") || result.contains("dương tính")) {
            return "POSITIVE";
        } else if (result.contains("negative") || result.contains("âm tính")) {
            return "NEGATIVE";
        } else {
            return "UNKNOWN";
        }
    }

    /**
     * Phân tích kết quả có khoảng giá trị (ví dụ: 7-55 U/L)
     */
    private static String analyzeRangeResult(String resultValue, String normalRange) {
        try {
            double result = Double.parseDouble(resultValue);
            String[] range = normalRange.split("-");
            double lowerBound = Double.parseDouble(range[0].trim());
            double upperBound = Double.parseDouble(range[1].trim());

            if (result < lowerBound) {
                return result < lowerBound * 0.5 ? "CRITICAL_LOW" : "LOW";
            } else if (result > upperBound) {
                return result > upperBound * 2 ? "CRITICAL_HIGH" : "HIGH";
            } else {
                return "NORMAL";
            }
        } catch (NumberFormatException e) {
            log.error("Lỗi khi phân tích giá trị số: {}", e.getMessage());
            return "UNKNOWN";
        }
    }

    /**
     * Phân tích kết quả có ngưỡng (ví dụ: < 50 copies/mL)
     */
    private static String analyzeThresholdResult(String resultValue, String normalRange) {
        try {
            // Xử lý trường hợp kết quả là "không phát hiện" hoặc "undetectable"
            if (resultValue.toLowerCase().contains("không phát hiện") || 
                resultValue.toLowerCase().contains("undetectable")) {
                return "NORMAL";
            }

            double result = Double.parseDouble(resultValue);

            if (normalRange.contains("<")) {
                // Giá trị bình thường phải nhỏ hơn ngưỡng
                double threshold = Double.parseDouble(normalRange.replace("<", "").trim());
                if (result < threshold) {
                    return "NORMAL";
                } else if (result < threshold * 2) {
                    return "HIGH";
                } else {
                    return "CRITICAL_HIGH";
                }
            } else if (normalRange.contains(">")) {
                // Giá trị bình thường phải lớn hơn ngưỡng
                double threshold = Double.parseDouble(normalRange.replace(">", "").trim());
                if (result > threshold) {
                    return "NORMAL";
                } else if (result > threshold * 0.5) {
                    return "LOW";
                } else {
                    return "CRITICAL_LOW";
                }
            }

            return "NORMAL";
        } catch (NumberFormatException e) {
            log.error("Lỗi khi phân tích ngưỡng: {}", e.getMessage());
            return "UNKNOWN";
        }
    }

    /**
     * Phân tích kết quả men gan ALT/AST
     * ALT: 7-55 U/L
     * AST: 8-48 U/L
     */
    private static String analyzeLiverEnzymes(String resultValue, String testName, String normalRange) {
        try {
            double result = Double.parseDouble(resultValue);

            // Nếu có normalRange từ database thì dùng nó
            if (normalRange != null && !normalRange.isEmpty()) {
                return analyzeRangeResult(resultValue, normalRange);
            }

            // Nếu không có normalRange thì dùng giá trị mặc định
            if (testName.contains("alt")) {
                // ALT: 7-55 U/L
                if (result < 7) {
                    return "LOW";
                } else if (result <= 55) {
                    return "NORMAL";
                } else if (result <= 110) {
                    return "HIGH";
                } else {
                    return "CRITICAL_HIGH";
                }
            } else if (testName.contains("ast")) {
                // AST: 8-48 U/L
                if (result < 8) {
                    return "LOW";
                } else if (result <= 48) {
                    return "NORMAL";
                } else if (result <= 96) {
                    return "HIGH";
                } else {
                    return "CRITICAL_HIGH";
                }
            }

            return "NORMAL";
        } catch (NumberFormatException e) {
            log.error("Lỗi khi phân tích men gan: {}", e.getMessage());
            return "UNKNOWN";
        }
    }
}
