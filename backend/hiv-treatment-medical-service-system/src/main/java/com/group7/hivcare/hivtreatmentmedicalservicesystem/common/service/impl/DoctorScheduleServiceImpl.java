
package com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.dto.DoctorScheduleDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorScheduleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.service.DoctorScheduleService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorScheduleServiceImpl implements DoctorScheduleService {

    @Override
    public void restoreSchedule(Integer id) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
            .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Schedule not found"));
        schedule.setStatus(com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.ACTIVE);
        doctorScheduleRepository.save(schedule);
    }
    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;
    @Autowired
    private DoctorRepository doctorRepository;

    private DoctorScheduleDTO convertToDTO(DoctorSchedule schedule) {
        DoctorScheduleDTO dto = new DoctorScheduleDTO();
        dto.setId(schedule.getId());
        dto.setDoctorId(schedule.getDoctor().getId());
        dto.setDayOfWeek(schedule.getDayOfWeek());
        dto.setDate(schedule.getDate());
        dto.setStartTime(schedule.getStartTime());
        dto.setEndTime(schedule.getEndTime());
        dto.setNotes(schedule.getNotes());
        if (schedule.getStatus() != null) {
            dto.setStatus(schedule.getStatus().name());
        } else {
            dto.setStatus("ACTIVE");
        }
        return dto;
    }

    private DoctorSchedule convertToEntity(DoctorScheduleDTO dto) {
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
        DoctorSchedule schedule = DoctorSchedule.builder()
                .id(dto.getId())
                .doctor(doctor)
                .dayOfWeek(dto.getDayOfWeek())
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .notes(dto.getNotes())
                .build();
        // Set status from DTO, default to ACTIVE
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            schedule.setStatus(com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.valueOf(dto.getStatus()));
        } else {
            schedule.setStatus(com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.ACTIVE);
        }
        return schedule;
    }

    @Override
    public DoctorScheduleDTO createSchedule(DoctorScheduleDTO dto) {
        DoctorSchedule schedule = convertToEntity(dto);
        schedule.setId(null); // ensure new
        return convertToDTO(doctorScheduleRepository.save(schedule));
    }

    @Override
    public DoctorScheduleDTO updateSchedule(Integer id, DoctorScheduleDTO dto) {
        DoctorSchedule existing = doctorScheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found"));
        existing.setDayOfWeek(dto.getDayOfWeek());
        existing.setDate(dto.getDate());
        existing.setStartTime(dto.getStartTime());
        existing.setEndTime(dto.getEndTime());
        existing.setNotes(dto.getNotes());
        // UpdateRevisitAppointmentDTO status if provided
        if (dto.getStatus() != null && !dto.getStatus().isEmpty()) {
            existing.setStatus(com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.valueOf(dto.getStatus()));
        }
        return convertToDTO(doctorScheduleRepository.save(existing));
    }

    @Override
    public void deleteSchedule(Integer id) {
        DoctorSchedule schedule = doctorScheduleRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Schedule not found"));
        schedule.setStatus(com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.INACTIVE);
        doctorScheduleRepository.save(schedule);
    }

    @Override
    public DoctorScheduleDTO getScheduleById(Integer id) {
        return doctorScheduleRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found"));
    }

    @Override
    public List<DoctorScheduleDTO> getSchedulesByDoctor(Integer doctorId) {
        return doctorScheduleRepository.findByDoctorIdAndStatus(doctorId, com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.ACTIVE)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<DoctorScheduleDTO> getAllSchedules() {
        return doctorScheduleRepository.findAll().stream()
                .filter(s -> s.getStatus() == com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.ACTIVE
                        || s.getStatus() == com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.CANCELLED
                        || s.getStatus() == com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus.INACTIVE)
                .map(this::convertToDTO).collect(Collectors.toList());
    }
}
