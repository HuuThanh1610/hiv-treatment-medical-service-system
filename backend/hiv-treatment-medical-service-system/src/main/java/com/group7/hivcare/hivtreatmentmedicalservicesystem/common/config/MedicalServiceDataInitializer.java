package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.config;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.MedicalServices;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.MedicalServicesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class MedicalServiceDataInitializer implements CommandLineRunner {

    @Autowired
    private MedicalServicesRepository medicalServicesRepository;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có dữ liệu chưa
        if (medicalServicesRepository.count() == 0) {
            createSampleMedicalServices();
            System.out.println("✅ Created sample medical services");
        } else {
            System.out.println("Medical services already exist, skipping initialization.");
        }
    }

    private void createSampleMedicalServices() {
        List<MedicalServices> sampleServices = Arrays.asList(
            // HIV/AIDS Treatment Services

                MedicalServices.builder()
                        .name("Khám Sức Khỏe lần Đầu")
                        .description("Đặt lịch khám sức khỏe tổng quát cho bệnh nhân lần đầu đến điều trị HIV")
                        .defaultDuration(60)
                        .price(400000.0)
                        .build(),

                MedicalServices.builder()
                        .name("Đặt Lịch Khám Theo Yêu Cầu")
                        .description("Dịch vụ đặt lịch khám với bác sĩ theo nhu cầu của bệnh nhân")
                        .defaultDuration(90)
                        .price(100000.0)
                        .build(),

                MedicalServices.builder()
                        .name("Tái Khám Định Kỳ")
                        .description("Dịch vụ đặt lịch tái khám định kỳ để theo dõi quá trình điều trị HIV")
                        .defaultDuration(45)
                        .price(150000.0)
                        .build()

        );

        medicalServicesRepository.saveAll(sampleServices);
    }
} 