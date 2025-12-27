package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"user", "appointments", "patientTreatmentPlans", "treatmentReminders", "payments", "labRequests"})
@Entity
@Table(name = "patients")
public class Patients {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column (name = "medical_record_number", columnDefinition = "VARCHAR(255)")
    private String medicalRecordNumber;

    @Column(name = "is_pregnant")
    private Boolean isPregnant;

    @Transient
    @Builder.Default
    private boolean pregnant = false;

    //Hàm lấy AppointmentDeclaration mới nhất
    @Transient
    public Optional<AppointmentDeclaration> getLatestAppointmentDeclaration() {
        return this.appointments.stream()
                .filter(appointment -> appointment.getAppointmentDeclaration() != null)
                .sorted(Comparator.comparing(Appointment::getAppointmentDate).reversed()) //Comparator.comparing(...) mặc định là tăng dần vì thế nó sẽ sắp sếp từ ngày cũ đến ngày mới, vì thế muốn lấy ngày mới phải reversed
                .map(Appointment::getAppointmentDeclaration)
                .findFirst();
    }

    //Xác định nhóm đối tượng
    @Transient
    public TargetGroup getTargetGroup() {
        // Nếu là nữ và có thai thì là pregnant
        if ("FEMALE".equalsIgnoreCase(user.getGender())) {
            // Ưu tiên sử dụng field isPregnant trong database
            boolean isPregnantFromDB = (isPregnant != null) ? isPregnant : false;
            
            // Nếu chưa có thông tin trong DB, lấy từ AppointmentDeclaration mới nhất
            if (!isPregnantFromDB) {
                isPregnantFromDB = getLatestAppointmentDeclaration()
                        .map(AppointmentDeclaration::isPregnant)
                        .orElse(false);
            }

            if (isPregnantFromDB) {
                return TargetGroup.PREGNANT;
            }
        }

        // Kiểm tra null để tránh NullPointerException
        if (user == null || user.getBirthday() == null) {
            return TargetGroup.ADULT; // Mặc định là adult nếu không có thông tin ngày sinh
        }

        int age = Period.between(user.getBirthday(), LocalDate.now()).getYears();
        return (age < 15) ? TargetGroup.CHILD : TargetGroup.ADULT;
    }

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<PatientTreatmentPlan> patientTreatmentPlans = new ArrayList<>();

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<TreatmentReminder> treatmentReminders = new ArrayList<>();

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "patient", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<LabRequest> labRequests = new ArrayList<>();

    public Patients(User user, String medicalRecordNumber, LocalDateTime createdAt, LocalDateTime updatedAt, boolean pregnant ) {
        this.user = user;
        this.medicalRecordNumber = medicalRecordNumber;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.pregnant = pregnant;
    }
}
