package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DoctorScheduleRequestRepository extends JpaRepository<DoctorScheduleRequest, Integer> {
    List<DoctorScheduleRequest> findByStatus(DoctorScheduleRequest.Status status);
    List<DoctorScheduleRequest> findByDoctorId(Integer doctorId);
    List<DoctorScheduleRequest> findByScheduleId(Integer scheduleId);
}
