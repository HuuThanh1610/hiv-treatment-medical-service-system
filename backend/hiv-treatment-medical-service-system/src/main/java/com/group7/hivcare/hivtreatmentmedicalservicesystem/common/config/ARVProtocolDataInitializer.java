package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.config;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocol.dto.ARVProtocolDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolMedicationDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.dto.ARVProtocolRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.arvprotocolmedication.service.ARVProtocolMedicationService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVMedicationRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVProtocolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ARVProtocolDataInitializer implements CommandLineRunner {

    private final ARVProtocolRepository arvProtocolRepository;

    private final ARVProtocolMedicationService arvProtocolMedicationService;

    private RecommendationType recommendationType;

    private TreatmentLevel treatmentLevel;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có dữ liệu chưa
        if (arvProtocolRepository.count() == 0) {
            createSampleARVProtocols();
            System.out.println("Created sample ARV protocols");
        } else {
            System.out.println("ARV protocols already exist, skipping initialization.");
        }
    }

    private void createSampleARVProtocols() {
        // Phác đồ 1: TDF + 3TC + DTG
        ARVProtocolRequestDTO tdf3tcDtg = ARVProtocolRequestDTO.builder()
                .name("TDF + 3TC + DTG")
                .description("Phác đồ bậc 1 cho người lớn nhiễm HIV lần đầu điều trị.")
                .recommendation(RecommendationType.PRIORITY)
                .treatmentLevel(TreatmentLevel.LEVEL1)
                .sideEffects("Buồn nôn, mất ngủ, tăng men gan")
                .contraindications("Suy gan nặng, phụ nữ có thai")
                .targetGroup(TargetGroup.ADULT)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(1) // TDF
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Buồn nôn")
                                .note("Uống vào buổi sáng sau ăn")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2) // 3TC
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Ít tác dụng phụ")
                                .note("Uống cùng TDF")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(13) // DTG
                                .dosage("50mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Mất ngủ")
                                .note("Uống vào buổi tối")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(tdf3tcDtg);

        // Phác đồ 2: AZT + 3TC + EFV
        ARVProtocolRequestDTO azt3tcEfz = ARVProtocolRequestDTO.builder()
                .name("AZT + 3TC + EFV")
                .description("Phác đồ thay thế bậc 1 khi không dung nạp với TDF hoặc DTG.")
                .recommendation(RecommendationType.ALTERNATIVE)
                .treatmentLevel(TreatmentLevel.LEVEL1)
                .sideEffects("Thiếu máu, buồn ngủ, chóng mặt")
                .contraindications("Bệnh lý huyết học")
                .targetGroup(TargetGroup.ADULT)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(4) // AZT
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Thiếu máu")
                                .note("Theo dõi công thức máu định kỳ")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2) // 3TC
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Ít tác dụng phụ")
                                .note("Uống cùng AZT")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(6) // EFV
                                .dosage("600mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Mất ngủ, mộng mị")
                                .note("Uống vào buổi tối trước khi ngủ")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(azt3tcEfz);

        // NGƯỜI LỚN - PHÁC ĐỒ BỔ SUNG BẬC 1
        ARVProtocolRequestDTO adultBac1_2 = ARVProtocolRequestDTO.builder()
                .name("TDF + FTC + EFV")
                .description("Phác đồ bậc 1 thay thế cho người lớn khi không dùng DTG.")
                .recommendation(RecommendationType.PRIORITY)
                .treatmentLevel(TreatmentLevel.LEVEL1)
                .sideEffects("Mệt mỏi, chóng mặt, rối loạn giấc ngủ")
                .contraindications("Rối loạn tâm thần")
                .targetGroup(TargetGroup.ADULT)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(1)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Buồn nôn, đau đầu")
                                .note("Uống vào buổi tối để giảm tác dụng phụ")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(5)
                                .dosage("200mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Phát ban nhẹ, đau bụng")
                                .note("Kết hợp tốt với TDF, theo dõi chức năng thận")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(6)
                                .dosage("600mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Mộng mị, khó ngủ, lú lẫn")
                                .note("Không dùng cho bệnh nhân có tiền sử rối loạn tâm thần")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(adultBac1_2);

// NGƯỜI LỚN - PHÁC ĐỒ BỔ SUNG BẬC 2
        ARVProtocolRequestDTO adultBac2_2 = ARVProtocolRequestDTO.builder()
                .name("ABC + 3TC + ATV")
                .description("Phác đồ bậc 2 cho người lớn không dung nạp với EFV hoặc LPV/r.")
                .recommendation(RecommendationType.ALTERNATIVE)
                .treatmentLevel(TreatmentLevel.LEVEL2)
                .sideEffects("Buồn nôn, vàng da")
                .contraindications("Suy gan nặng")
                .targetGroup(TargetGroup.ADULT)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(3)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Dị ứng, đau bụng")
                                .note("Theo dõi phản ứng quá mẫn")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Buồn nôn, tiêu chảy")
                                .note("Uống cùng thức ăn để tăng hấp thu")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(10)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Vàng da nhẹ, tăng bilirubin")
                                .note("Theo dõi chức năng gan định kỳ")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(adultBac2_2);

//NGƯỜI LỚN - PHÁC ĐỒ BỔ SUNG BẬC 3
        ARVProtocolRequestDTO adultBac3 = ARVProtocolRequestDTO.builder()
                .name("TDF + 3TC + DRV")
                .description("Phác đồ bậc 3 cho người lớn thất bại bậc 1, 2 hoặc có kháng thuốc.")
                .recommendation(RecommendationType.ALTERNATIVE)
                .treatmentLevel(TreatmentLevel.LEVEL3)
                .sideEffects("Rối loạn tiêu hóa, tăng men gan")
                .contraindications("Suy gan, tương tác thuốc")
                .targetGroup(TargetGroup.ADULT) // Sửa từ CHILD thành ADULT để phù hợp với mô tả
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(1)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Buồn nôn, đau đầu")
                                .note("Theo dõi chức năng thận định kỳ")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Tiêu chảy, mệt mỏi")
                                .note("Uống cùng thức ăn để tăng hấp thu")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(11)
                                .dosage("600mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Buồn nôn, đau bụng")
                                .note("Cần kết hợp với Ritonavir để tăng hiệu quả")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(adultBac3);

        // PHỤ NỮ CÓ THAI - PHÁC ĐỒ BẬC 1
        ARVProtocolRequestDTO pregnantBac1 = ARVProtocolRequestDTO.builder()
                .name("TDF + 3TC + EFV")
                .description("Phác đồ bậc 1 cho phụ nữ mang thai nhiễm HIV.")
                .recommendation(RecommendationType.PRIORITY)
                .treatmentLevel(TreatmentLevel.LEVEL1)
                .sideEffects("Buồn nôn, chóng mặt, mệt mỏi")
                .contraindications("Tiền sử dị ứng EFV")
                .targetGroup(TargetGroup.PREGNANT)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(1)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Buồn nôn, đau đầu")
                                .note("Uống buổi sáng để giảm tác dụng phụ")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Tiêu chảy, mệt mỏi")
                                .note("Uống cùng TDF, theo dõi chức năng thận")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(6)
                                .dosage("600mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Mất ngủ, mộng mị")
                                .note("Uống buổi tối, tránh dùng ở bệnh nhân có rối loạn tâm thần")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(pregnantBac1);

// PHỤ NỮ CÓ THAI - PHÁC ĐỒ BẬC 2
        ARVProtocolRequestDTO pregnantBac2 = ARVProtocolRequestDTO.builder()
                .name("AZT + 3TC + NVP")
                .description("Phác đồ bậc 2 cho phụ nữ mang thai không dung nạp EFV.")
                .recommendation(RecommendationType.ALTERNATIVE)
                .treatmentLevel(TreatmentLevel.LEVEL2)
                .sideEffects("Buồn nôn, phát ban")
                .contraindications("Suy gan")
                .targetGroup(TargetGroup.PREGNANT)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(4)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Thiếu máu, buồn nôn")
                                .note("Theo dõi công thức máu định kỳ")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Tiêu chảy, đau bụng")
                                .note("Uống cùng thức ăn để tăng hấp thu")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(7)
                                .dosage("200mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Phát ban, tăng men gan")
                                .note("Theo dõi chức năng gan định kỳ")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(pregnantBac2);

// PHỤ NỮ CÓ THAI - PHÁC ĐỒ BẬC 3
        ARVProtocolRequestDTO pregnantBac3 = ARVProtocolRequestDTO.builder()
                .name("ABC + 3TC + LPV/r")
                .description("Phác đồ bậc 3 cho phụ nữ mang thai thất bại điều trị trước.")
                .recommendation(RecommendationType.ALTERNATIVE)
                .treatmentLevel(TreatmentLevel.LEVEL3)
                .sideEffects("Buồn nôn, tiêu chảy")
                .contraindications("Suy gan nặng")
                .targetGroup(TargetGroup.PREGNANT)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(3)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Phản ứng dị ứng, đau bụng")
                                .note("Theo dõi phản ứng quá mẫn")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Tiêu chảy, mệt mỏi")
                                .note("Uống cùng thức ăn để tăng hấp thu")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(9)
                                .dosage("400mg/100mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Rối loạn tiêu hóa, tăng lipid máu")
                                .note("Theo dõi chức năng gan và lipid máu")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(pregnantBac3);

        // TRẺ EM - PHÁC ĐỒ BẬC 1
        ARVProtocolRequestDTO childBac1 = ARVProtocolRequestDTO.builder()
                .name("ABC + 3TC + DTG")
                .description("Phác đồ bậc 1 cho trẻ em.")
                .recommendation(RecommendationType.PRIORITY)
                .treatmentLevel(TreatmentLevel.LEVEL1)
                .sideEffects("Buồn ngủ, rối loạn tiêu hóa")
                .contraindications("Suy gan")
                .targetGroup(TargetGroup.CHILD)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(3)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Phản ứng dị ứng, đau bụng")
                                .note("Theo dõi phản ứng quá mẫn")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Tiêu chảy, mệt mỏi")
                                .note("Uống cùng thức ăn để tăng hấp thu")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(13)
                                .dosage("50mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Khó ngủ, đau đầu")
                                .note("Uống buổi tối, theo dõi tác dụng phụ thần kinh")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(childBac1);

// TRẺ EM - PHÁC ĐỒ BẬC 2
        ARVProtocolRequestDTO childBac2 = ARVProtocolRequestDTO.builder()
                .name("AZT + 3TC + LPV/r")
                .description("Phác đồ bậc 2 cho trẻ em thất bại phác đồ 1.")
                .recommendation(RecommendationType.ALTERNATIVE)
                .treatmentLevel(TreatmentLevel.LEVEL2)
                .sideEffects("Thiếu máu, tiêu chảy")
                .contraindications("Bệnh gan nặng")
                .targetGroup(TargetGroup.CHILD)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(4)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Thiếu máu, buồn nôn")
                                .note("Theo dõi công thức máu định kỳ")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(2)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Tiêu chảy, đau bụng")
                                .note("Uống cùng thức ăn để tăng hấp thu")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(9)
                                .dosage("400mg/100mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Tiêu chảy, tăng lipid máu")
                                .note("Theo dõi chức năng gan và lipid máu")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(childBac2);

// TRẺ EM - PHÁC ĐỒ BẬC 3
        ARVProtocolRequestDTO childBac3 = ARVProtocolRequestDTO.builder()
                .name("TDF + FTC + RAL")
                .description("Phác đồ bậc 3 cho trẻ em có đột biến kháng thuốc.")
                .recommendation(RecommendationType.ALTERNATIVE)
                .treatmentLevel(TreatmentLevel.LEVEL3)
                .sideEffects("Buồn ngủ, tiêu chảy")
                .contraindications("Suy thận")
                .targetGroup(TargetGroup.CHILD)
                .active(true)
                .arvProtocolMedicationsDTO(List.of(
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(1)
                                .dosage("300mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Buồn nôn, đau đầu")
                                .note("Theo dõi chức năng thận định kỳ")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(5)
                                .dosage("200mg")
                                .duration("Dài hạn")
                                .frequency("1 lần/ngày")
                                .sideEffects("Phát ban nhẹ, đau bụng")
                                .note("Kết hợp tốt với TDF, theo dõi chức năng thận")
                                .build(),
                        ARVProtocolMedicationDTO.builder()
                                .medicationId(12)
                                .dosage("400mg")
                                .duration("Dài hạn")
                                .frequency("2 lần/ngày")
                                .sideEffects("Buồn ngủ, đau cơ")
                                .note("Theo dõi tác dụng phụ thần kinh và cơ bắp")
                                .build()
                ))
                .build();
        arvProtocolMedicationService.createARVProtocolWithMedications(childBac3);
    }
} 