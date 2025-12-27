package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "arv_protocols")
public class ARVProtocol { 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "name", columnDefinition = "nvarchar(255)", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "recommendation", columnDefinition = "nvarchar(255)")
    @Enumerated(EnumType.STRING)
    private RecommendationType recommendation;  // Khuyến cáo (ví dụ: "Ưu tiên", "Có thể thay thế")

    @Column(name = "treatment_level", columnDefinition = "nvarchar(50)")
    @Enumerated(EnumType.STRING)
    private TreatmentLevel treatmentLevel; //Bậc điều trị (ví dụ: "Bậc 1", "Bậc 2")

    @Column(name = "side_effects", columnDefinition = "nvarchar(max)")
    private String sideEffects; // Tác dụng phụ

    @Column(name = "contraindications", columnDefinition = "nvarchar(max)")
    private String contraindications; // Chống chỉ định
    //Ví dụ: Phụ nữ có thai trong 3 tháng đầu, bệnh thận

    @Column(name ="target_group", nullable = false)
    @Enumerated(EnumType.STRING)
    private TargetGroup targetGroup;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ARVProtocol(LocalDateTime updatedAt, LocalDateTime createdAt, Boolean active, String description, String name, TargetGroup targetGroup) {
        this.updatedAt = updatedAt;
        this.createdAt = createdAt;
        this.active = active;
        this.description = description;
        this.name = name;
        this.targetGroup = targetGroup;
    }

    @OneToMany(mappedBy = "arvProtocol", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<ARVProtocolMedication> arvProtocolMedications = new ArrayList<ARVProtocolMedication>();

    @OneToMany(mappedBy = "arvProtocol", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<PatientTreatmentPlan> patientTreatmentPlans = new ArrayList<PatientTreatmentPlan>();
}