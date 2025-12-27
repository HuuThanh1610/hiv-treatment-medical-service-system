
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleDTO;
import java.util.List;

public interface DoctorScheduleService {
    void restoreSchedule(Integer id);
    DoctorScheduleDTO createSchedule(DoctorScheduleDTO dto);
    DoctorScheduleDTO updateSchedule(Integer id, DoctorScheduleDTO dto);
    void deleteSchedule(Integer id);
    DoctorScheduleDTO getScheduleById(Integer id);
    List<DoctorScheduleDTO> getSchedulesByDoctor(Integer doctorId);
    List<DoctorScheduleDTO> getAllSchedules();
}
