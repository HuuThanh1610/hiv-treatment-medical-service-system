package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ConsultationMessage;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.ConsultationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationMessageRepository extends JpaRepository<ConsultationMessage, Integer> {
    List<ConsultationMessage> findBySessionOrderBySentAtAsc(ConsultationSession session);
}