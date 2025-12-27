package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.mapper.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.*;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.mapper.PaymentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PaymentMapperImpl implements PaymentMapper {
    @Autowired
    private UserRepository userRepository;

    @Override
    public PaymentDTO toDTO(Payment payment, VNPayPayment vnPayPayment, CashPayment cashPayment) {
        if (payment == null) {
            return null;
        }

        PaymentDTO dto = new PaymentDTO();
        dto.setId(payment.getId());
        dto.setPatientId(payment.getPatient() != null ? payment.getPatient().getId() : null);
        dto.setPatientName(payment.getPatient() != null && payment.getPatient().getUser() != null
                ? payment.getPatient().getUser().getFullName() : null);
        dto.setAppointmentId(payment.getAppointment() != null ? payment.getAppointment().getId() : null);
        dto.setLabRequestId(payment.getLabRequest() != null ? payment.getLabRequest().getId() : null);
        dto.setAmount(payment.getAmount());
        dto.setMethod(payment.getMethod());
        dto.setStatus(payment.getStatus());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setNotes(payment.getNotes());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        dto.setTransactionCode(payment.getTransactionCode());

        if (vnPayPayment != null) {
            VNPayPaymentDTO vnPayDTO = new VNPayPaymentDTO();
            vnPayDTO.setId(vnPayPayment.getId());
            vnPayDTO.setVnpBankCode(vnPayPayment.getVnpBankCode());
            vnPayDTO.setVnpCardType(vnPayPayment.getVnpCardType());
            vnPayDTO.setVnpPayDate(vnPayPayment.getVnpPayDate());
            vnPayDTO.setGatewayResponse(vnPayPayment.getGatewayResponse());
            dto.setVnPayPayment(vnPayDTO);
        }

        if (cashPayment != null) {
            CashPaymentDTO cashDTO = new CashPaymentDTO();
            cashDTO.setId(cashPayment.getId());
            cashDTO.setStaffId(cashPayment.getUser() != null ? cashPayment.getUser().getId() : null);
            cashDTO.setStaffName(cashPayment.getUser() != null ? cashPayment.getUser().getFullName() : null);
            dto.setCashPayment(cashDTO);
        }

        return dto;
    }

    @Override
    public Payment toEntity(CreatePaymentDTO dto) {
        if (dto == null) {
            return null;
        }

        Payment payment = new Payment();
        payment.setAmount(dto.getAmount());
        // Convert string method to enum
        payment.setMethod(PaymentMethod.valueOf(dto.getMethod()));
        payment.setStatus(PaymentStatus.PENDING);// Mặc định PENDING khi tạo
        payment.setPaymentDate(LocalDateTime.now()); //lấy thời gian tạo entity
        payment.setNotes(dto.getNotes());
        payment.setTransactionCode(dto.getTransactionCode());
        // patient, appointment, labRequest sẽ được set trong service
        return payment;
    }

    @Override
    public CashPayment toCashPaymentEntity(CreatePaymentDTO dto, Payment payment) {
        if (dto == null || !"CASH".equals(dto.getMethod())) {
            return null;
        }
        CashPayment cashPayment = new CashPayment();
        cashPayment.setPayment(payment);
        // staff sẽ được set trong service
        return cashPayment;
    }

    @Override
    public VNPayPayment toVNPayPaymentEntity(CreatePaymentDTO dto, Payment payment) {
        if (dto == null || !"VNPAY".equals(dto.getMethod())) {
            return null;
        }

        VNPayPayment vnPayPayment = new VNPayPayment();
        vnPayPayment.setPayment(payment);
        vnPayPayment.setVnpBankCode(dto.getBankCode());
        return vnPayPayment;
    }

    @Override
    public Payment updateEntity(UpdatePaymentDTO dto, Payment existingPayment) {
        if (dto == null || existingPayment == null) {
            return existingPayment;
        }

        existingPayment.setStatus(dto.getStatus());
        existingPayment.setPaymentDate(dto.getPaymentDate());
        existingPayment.setNotes(dto.getNotes());
        return existingPayment;
    }

    @Override
    public VNPayPayment updateVNPayPaymentEntity(UpdatePaymentDTO dto, VNPayPayment existingVNPayPayment) {
        if (dto == null || existingVNPayPayment == null) {
            return existingVNPayPayment;
        }

        existingVNPayPayment.setVnpBankCode(dto.getVnpBankCode());
        existingVNPayPayment.setVnpCardType(dto.getVnpCardType());
        existingVNPayPayment.setVnpPayDate(dto.getVnpPayDate());
        existingVNPayPayment.setGatewayResponse(dto.getGatewayResponse());
        return existingVNPayPayment;
    }

    @Override
    public CashPayment updateCashPaymentEntity(UpdatePaymentDTO dto, CashPayment existingCashPayment) {
        if (dto == null || existingCashPayment == null) {
            return existingCashPayment;
        }
        // staff sẽ được set trong service nếu cần
        return existingCashPayment;
    }
}
