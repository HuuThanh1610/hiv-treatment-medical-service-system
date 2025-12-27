package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
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
@Table(name = "lab_test_types")
public class LabTestType {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  int id;

    @Column(name = "name",columnDefinition = "nvarchar(255)", nullable = false)
    private  String name;

    @Column(name = "description",columnDefinition = "NVARCHAR(225)")
    private  String description;

    @Column(name = "price")
    private double price;

    @Column(name = "normal_range",columnDefinition = "NVARCHAR(225)")
    private String normalRange;

    @Column(name = "unit",columnDefinition = "nvarchar(255)")
    private String unit;

    @Column(name = "is_active", columnDefinition = "BIT DEFAULT 1", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private  LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @OneToMany(mappedBy = "testType", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    @Builder.Default
    private List<LabRequestItem> labRequestItems = new ArrayList<LabRequestItem>();
}
