package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name ="arv_protocol_medications")
public class ARVProtocolMedication {
    @EmbeddedId //Định nghĩa khóa chính bao gồm nhiều cột
    private ARVProtocolMedicationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("protocolId")
    @JoinColumn(name = "protocol_id", nullable = false)
    private ARVProtocol arvProtocol;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("medicationId")
    @JoinColumn(name = "medication_id", nullable = false)
    private ARVMedication arvMedication;

    @Column(name = "dosage", columnDefinition = "nvarchar(255)")
    private String dosage; // Chỉ định số lượng thuốc cần dùng trong một lần .
    //Ví dụ: 1 viên/lần.

    @Column(name = "frequency", nullable = false,columnDefinition = "NVARCHAR(225)")
    private String frequency; // Chỉ định mỗi ngày dùng bao nhiêu lần. VD: 2 lần/ngày

    @Column(name = "duration", columnDefinition = "nvarchar(255)")
    private String duration; // Cho biết khoảng thời gian sử dụng thuốc trong phác đồ.
    //Ví dụ: 6 tháng, đến khi tải lượng virus < 200, liên tục.

    @Column(name = "side_effects", columnDefinition = "NVARCHAR(500)")
    private String sideEffects; // Tác dụng phụ của thuốc

    @Column(name = "note", columnDefinition = "NVARCHAR(MAX)")
    private String note; //Cung cấp thông tin bổ sung, cảnh báo hoặc hướng dẫn đặc biệt khi dùng thuốc.

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


}
