package com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.CreatePaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.PaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.payment.dto.UpdatePaymentDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.appointment.dto.AppointmentResponseDTO;

import java.io.UnsupportedEncodingException;
import java.util.List;
import java.util.Map;

public interface PaymentService {
    List<PaymentDTO> getAllPayments();
    List<AppointmentResponseDTO> getEligibleAppointmentsForPayment();
    PaymentDTO createCashPayment(CreatePaymentDTO dto);
    PaymentDTO createVNPayPayment(CreatePaymentDTO dto);
    PaymentDTO updatePayment(Integer paymentId, UpdatePaymentDTO dto);
    String createVNPayPaymentUrl(CreatePaymentDTO dto);
    PaymentDTO getPaymentById(Integer id);
    List<PaymentDTO> getPaymentsByPatientId(Integer patientId);
    PaymentDTO getPatientPaymentById(Integer id, Integer patientId);
    PaymentDTO handleVNPayReturn(Map<String, String> vnpParams);
   // void sendPaymentNotification(Payment payment, String message);

    // Tự động tạo payment cho appointment đã check-in
    PaymentDTO createAutoPaymentForCheckedInAppointment(Integer appointmentId);

}