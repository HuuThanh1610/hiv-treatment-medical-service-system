package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PaymentMethod;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.validation.constraints.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Integer id;

    @NotNull(message = "ID bệnh nhân không được để trống")
    private Integer patientId;

    private String patientName;

    @NotNull(message = "ID lịch hẹn không được để trống")
    private Integer appointmentId;

    private Integer labRequestId;

    @NotNull(message = "Số tiền không được để trống")
    private BigDecimal amount;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod method;

    @NotNull(message = "Trạng thái thanh toán không được để trống")
    private PaymentStatus status;

    private LocalDateTime paymentDate;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String transactionCode;

    // Thông tin đặc thù cho VNPay
    private VNPayPaymentDTO vnPayPayment;

    // Thông tin đặc thù cho tiền mặt
    private CashPaymentDTO cashPayment;
} 