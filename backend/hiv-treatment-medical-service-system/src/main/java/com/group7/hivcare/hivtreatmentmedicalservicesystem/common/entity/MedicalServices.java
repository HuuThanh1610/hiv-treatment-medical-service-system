package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"appointments"})
@Entity
@Table(name = "medical_services")
public class MedicalServices {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Integer id;

    @Column (nullable = false, columnDefinition = "NVARCHAR(255)")
    private String name;

    @Column (columnDefinition = "NVARCHAR(255)")
    private String description;

    @Column (name = "default_duration")
    private int defaultDuration;

    private double price;

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

    @OneToMany(mappedBy = "medicalService", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore //Để tránh rối vòng lặp JSON (khi trả JSON qua API)
    @Setter(AccessLevel.NONE) // tránh Lombok tạo setter trực tiếp
    @Builder.Default
    private List<Appointment> appointments = new ArrayList<>();

    public MedicalServices(String name, String description, int defaultDuration, double price, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.name = name;
        this.description = description;
        this.defaultDuration = defaultDuration;
        this.price = price;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}
