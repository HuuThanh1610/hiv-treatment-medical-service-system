package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePaymentDTO {
    @NotNull(message = "Trạng thái thanh toán không được để trống")
    private PaymentStatus status;

    private LocalDateTime paymentDate;

    private String notes;

    // Thông tin đặc thù cho VNPay
    private String vnpBankCode;
    private String vnpCardType;
    private LocalDateTime vnpPayDate;
    private String gatewayResponse;

    // Thông tin đặc thù cho tiền mặt
    private Integer staffId;
}
