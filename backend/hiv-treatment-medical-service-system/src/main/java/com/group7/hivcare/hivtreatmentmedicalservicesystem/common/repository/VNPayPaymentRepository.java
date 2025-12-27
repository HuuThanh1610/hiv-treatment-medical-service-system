package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.VNPayPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VNPayPaymentRepository extends JpaRepository<VNPayPayment, Integer> {
    Optional<VNPayPayment> findByPaymentId(Integer paymentId);
}
