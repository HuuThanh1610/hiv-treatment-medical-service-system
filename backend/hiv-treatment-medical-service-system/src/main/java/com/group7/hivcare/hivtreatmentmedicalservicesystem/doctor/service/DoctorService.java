
package com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.service;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorProfileDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.CreateDoctorRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule;

import java.time.LocalDate;
import java.util.List;

public interface DoctorService {
    List<DoctorSchedule> getDoctorScheduleByStatus(String email, java.time.LocalDate date, DoctorScheduleStatus status);
    // Admin methods
    DoctorDTO createDoctorWithUser(CreateDoctorRequestDTO request);
    void deactivateDoctor(Integer id);
    
    // Doctor profile methods
    DoctorDTO createDoctorProfile(String email, DoctorProfileDTO profileDTO);
    DoctorDTO updateDoctorProfile(String email, DoctorProfileDTO profileDTO);
    DoctorDTO getDoctorByEmail(String email);
    
    // Common methods
    List<DoctorDTO> getAllDoctors();
    DoctorDTO getDoctorById(Integer id);
    boolean isOwner(Integer doctorId, String email);

    List<DoctorSchedule> getDoctorSchedule(String email, LocalDate date);

    DoctorDTO getDoctorByUserId(Integer userId);
} 