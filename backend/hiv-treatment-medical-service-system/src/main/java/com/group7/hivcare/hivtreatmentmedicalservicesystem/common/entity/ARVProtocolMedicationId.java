package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode //để so sánh 2 object và đảm bảo object hoạt động chính xác trong các cấu trúc dữ liệu dùng hash
public class ARVProtocolMedicationId implements Serializable {
    @Column(name = "protocol_id")
    private Integer protocolId;
    @Column(name = "medication_id")
    private Integer medicationId;
}
