package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PaymentMethod;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentDTO {
    @NotNull(message = "ID bệnh nhân không được để trống")
    private Integer patientId;

    private Integer appointmentId;

    private Integer labRequestId;

    @NotNull(message = "Số tiền không được để trống")
    @Positive(message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private String method; // Changed from PaymentMethod to String for JSON compatibility

    private String status;

    private String notes;

    private String transactionCode; // Chỉ dùng cho VNPay (vnp_TxnRef)

    private Integer staffId; // Chỉ dùng cho tiền mặt

    private String bankCode; // Ngân hàng cho VNPAY (tùy chọn)
}

