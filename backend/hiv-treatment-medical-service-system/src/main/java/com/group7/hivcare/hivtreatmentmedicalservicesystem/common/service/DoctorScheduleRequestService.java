package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleRequest;
import java.util.List;

public interface DoctorScheduleRequestService {
    DoctorScheduleRequestDTO createRequest(DoctorScheduleRequestDTO dto);
    List<DoctorScheduleRequestDTO> getAllRequests();
    List<DoctorScheduleRequestDTO> getRequestsByStatus(String status);
    List<DoctorScheduleRequestDTO> getRequestsByDoctor(Integer doctorId);
    DoctorScheduleRequestDTO approveRequest(Integer requestId, Integer substituteDoctorId, String adminNote);
    DoctorScheduleRequestDTO rejectRequest(Integer requestId, String adminNote);
}
