package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto;

import lombok.*;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VNPayPaymentDTO {
    private Integer id;

    private String vnpBankCode;

    private String vnpCardType;

    private LocalDateTime vnpPayDate;

    private String gatewayResponse;
}
