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
@Table(name = "arv_medications")
public class ARVMedication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "code", nullable = false)
    private String code; // Mã thuốc (VD: TDF, 3TC)

    @Column(name = "name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name; // Tên đầy đủ: Tenofovir Disoproxil Fumarate
    
    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "drug_class", columnDefinition = "NVARCHAR(100)")
    private String drugClass; // Phân loại thuốc (NRTI, NNRTI, PI, v.v.)
    
    @Column(name = "form", columnDefinition = "NVARCHAR(255)")
    private String form; // Viên, dung dịch, tiêm
    
    @Column(name = "strength", columnDefinition = "NVARCHAR(255)")
    private String strength; // VD: 300mg
    
    @Column(name = "manufacturer", columnDefinition = "NVARCHAR(255)")
    private String manufacturer;//nhà sản xuất
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean active = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt ;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt ;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "arvMedication", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<ARVProtocolMedication> arvProtocolMedications = new ArrayList<ARVProtocolMedication>();

    @OneToMany(mappedBy = "arvMedication", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<PrescriptionMedication> prescriptions = new ArrayList<PrescriptionMedication>();



}