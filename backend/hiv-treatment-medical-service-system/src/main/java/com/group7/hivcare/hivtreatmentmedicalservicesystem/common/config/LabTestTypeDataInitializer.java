package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.config;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.LabTestType;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.LabTestTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class LabTestTypeDataInitializer implements CommandLineRunner {

    @Autowired
    private LabTestTypeRepository labTestTypeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có dữ liệu chưa
        if (labTestTypeRepository.count() == 0) {
            createSampleLabTestTypes();
            System.out.println("✅ Created sample lab test types");
        } else {
            System.out.println("Lab test types already exist, skipping initialization.");
        }
    }

    private void createSampleLabTestTypes() {
        List<LabTestType> sampleTestTypes = Arrays.asList(
            // HIV/AIDS Related Tests
            LabTestType.builder()
                .name("Xét nghiệm tải lượng virus HIV")
                .description("Đo số lượng bản sao virus HIV trong 1ml máu. Đây là xét nghiệm quan trọng nhất để theo dõi hiệu quả điều trị ARV.")
                .price(500000.0)
                .normalRange("<50")
                .unit("copies/mL")
                .isActive(true)
                .build(),

            LabTestType.builder()
                .name("Xét nghiệm CD4")
                .description("Đếm số lượng tế bào CD4 – là tế bào miễn dịch bị HIV tấn công, giúp đánh giá mức độ suy giảm miễn dịch.")
                .price(300000.0)
                .normalRange(">500")
                .unit("cells/μL")
                .isActive(true)
                .build(),

            LabTestType.builder()
                .name("Xét nghiệm kháng thể HIV")
                .description("Phát hiện sự hiện diện của kháng thể chống lại virus HIV – là xét nghiệm sàng lọc HIV phổ biến.")
                .price(250000.0)
                .normalRange("Âm tính")
                .unit("Định tính")
                .isActive(true)
                .build(),

            LabTestType.builder()
                .name("Xét nghiệm viêm gan B/C")
                .description("Kiểm tra tình trạng nhiễm viêm gan B hoặc C – bệnh thường gặp kèm theo HIV và ảnh hưởng đến lựa chọn thuốc ARV.")
                .price(200000.0)
                .normalRange("Âm tính")
                .unit("Định tính")
                .isActive(true)
                .build(),

            LabTestType.builder()
                .name("Xét nghiệm chức năng gan ALT")
                .description("Kiểm tra hoạt động của men gan ALT nhằm đánh giá chức năng gan – cơ quan quan trọng khi dùng thuốc ARV.")
                .price(80000.0)
                .normalRange("Nam: 10-40; Nữ: 7-35")
                .unit("U/L")
                .isActive(true)
                .build(),

            LabTestType.builder()
                .name("Xét nghiệm chức năng gan AST")
                .description("Kiểm tra hoạt động của men gan AST nhằm đánh giá chức năng gan – cơ quan quan trọng khi dùng thuốc ARV.")
                .price(80000.0)
                .normalRange("Nam: 10-40; Nữ: 9-32")
                .unit("U/L")
                .isActive(true)
                .build()
        );

        labTestTypeRepository.saveAll(sampleTestTypes);
        System.out.println("Created " + sampleTestTypes.size() + " sample lab test types");
    }
} 