package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.config;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ARVMedication;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.ARVMedicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Order(2)
public class ARVMedicationDataInitializer implements CommandLineRunner {

    @Autowired
    private ARVMedicationRepository arvMedicationRepository;

    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có dữ liệu chưa
        if (arvMedicationRepository.count() == 0) {
            createSampleARVMedications();
            System.out.println("✅ Created sample ARV medications");
        } else {
            System.out.println("ARV medications already exist, skipping initialization.");
        }
    }

    private void createSampleARVMedications() {
        List<ARVMedication> sampleMedications = Arrays.asList(
            // NRTIs (Nucleoside Reverse Transcriptase Inhibitors)
            ARVMedication.builder()
                .code("TDF")
                .name("Tenofovir Disoproxil Fumarate")
                .description("Thuốc kháng virus HIV")
                .form("Viên nén")
                    .drugClass("NRTI")
                .strength("300mg")
                .manufacturer("Gilead Sciences")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("3TC")
                .name("Lamivudine")
                .description("Thuốc kháng virus HIV")
                    .drugClass("NRTI")
                .form("Viên nén")
                .strength("300mg")
                .manufacturer("GlaxoSmithKline")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("ABC")
                .name("Abacavir")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("NRTI")
                .form("Viên nén")
                .strength("300mg")
                .manufacturer("ViiV Healthcare")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("AZT")
                .name("Zidovudine")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("NRTI")
                .form("Viên nén")
                .strength("300mg")
                .manufacturer("GlaxoSmithKline")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("FTC")
                .name("Emtricitabine")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("NRTI")
                .form("Viên nén")
                .strength("200mg")
                .manufacturer("Gilead Sciences")
                .active(true)
                .build(),

            // NNRTIs (Non-Nucleoside Reverse Transcriptase Inhibitors)
            ARVMedication.builder()
                .code("EFV")
                .name("Efavirenz")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("NNRTI")
                .form("Viên nén")
                .strength("600mg")
                .manufacturer("Bristol-Myers Squibb")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("NVP")
                .name("Nevirapine")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("NNRTI")
                .form("Viên nén")
                .strength("200mg")
                .manufacturer("Boehringer Ingelheim")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("RPV")
                .name("Rilpivirine")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("NNRTI")
                .form("Viên nén")
                .strength("25mg")
                .manufacturer("Janssen")
                .active(true)
                .build(),

            // PIs (Protease Inhibitors)
            ARVMedication.builder()
                .code("LPV/r")
                .name("Lopinavir/Ritonavir")
                .description("Thuốc kháng virus HIV")
                    .drugClass("PI")
                .form("Viên nén")
                .strength("400mg/100mg")
                .manufacturer("AbbVie")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("ATV")
                .name("Atazanavir")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("PI")
                .form("Viên nén")
                .strength("300mg")
                .manufacturer("Bristol-Myers Squibb")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("DRV")
                .name("Darunavir")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("PI")
                .form("Viên nén")
                .strength("600mg")
                .manufacturer("Janssen")
                .active(true)
                .build(),

            // Integrase Inhibitors
            ARVMedication.builder()
                .code("RAL")
                .name("Raltegravir")
                .description("Thuốc kháng virus HIV")
                    .drugClass("Integrase Inhibitor")
                .form("Viên nén")
                .strength("400mg")
                .manufacturer("Merck")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("DTG")
                .name("Dolutegravir")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("Integrase Inhibitor")
                .form("Viên nén")
                .strength("50mg")
                .manufacturer("ViiV Healthcare")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("EVG")
                .name("Elvitegravir")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("Integrase Inhibitor")
                .form("Viên nén")
                .strength("150mg")
                .manufacturer("Gilead Sciences")
                .active(true)
                .build(),

            // Entry Inhibitors
            ARVMedication.builder()
                .code("T20")
                .name("Enfuvirtide")
                    .description("Thuốc kháng virus HIV")
                    .drugClass("Integrase Inhibitor")
                .form("Dung dịch tiêm")
                .strength("90mg")
                .manufacturer("Roche")
                .active(true)
                .build(),

            ARVMedication.builder()
                .code("MVC")
                .name("Maraviroc")
                .description("Thuốc kháng virus HIV")
                    .drugClass("CCR5 Antagonist")
                .form("Viên nén")
                .strength("150mg")
                .manufacturer("Pfizer")
                .active(true)
                .build()
        );

        arvMedicationRepository.saveAll(sampleMedications);
    }
} 