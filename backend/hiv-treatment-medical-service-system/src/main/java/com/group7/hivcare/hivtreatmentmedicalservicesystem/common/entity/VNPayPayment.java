package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vnpay_payments")
public class VNPayPayment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false, unique = true)
    private Payment payment;

    @Column(name = "vnp_bank_code", length = 50, columnDefinition = "NVARCHAR(50)")
    private String vnpBankCode;

    @Column(name = "vnp_card_type", length = 50, columnDefinition = "NVARCHAR(50)")
    private String vnpCardType;

    @Column(name = "vnp_pay_date")
    private LocalDateTime vnpPayDate;

    @Column(name = "gateway_response", columnDefinition = "NVARCHAR(MAX)")
    private String gatewayResponse;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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
}
