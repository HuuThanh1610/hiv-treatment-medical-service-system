package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.CashPayment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Payment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.VNPayPayment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.CreatePaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.PaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.UpdatePaymentDTO;

public interface PaymentMapper {
    public PaymentDTO toDTO(Payment payment, VNPayPayment vnPayPayment, CashPayment cashPayment);
    public Payment toEntity(CreatePaymentDTO dto);
    public CashPayment toCashPaymentEntity(CreatePaymentDTO dto, Payment payment);
    public VNPayPayment toVNPayPaymentEntity(CreatePaymentDTO dto, Payment payment);
    public Payment updateEntity(UpdatePaymentDTO dto, Payment existingPayment);
    public VNPayPayment updateVNPayPaymentEntity(UpdatePaymentDTO dto, VNPayPayment existingVNPayPayment);
    public CashPayment updateCashPaymentEntity(UpdatePaymentDTO dto, CashPayment existingCashPayment);
}
