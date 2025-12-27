package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.CashPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CashPaymentRepository extends JpaRepository<CashPayment, Integer> {
    Optional<CashPayment> findByPaymentId(Integer paymentId);
}
