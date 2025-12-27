package com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Doctor;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorSchedule;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.User;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.DoctorProfileDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.dto.CreateDoctorRequestDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.DoctorScheduleRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.doctor.service.DoctorService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.UserRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.service.UserService;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.user.dto.UserRegisterDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.AppointmentRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Appointment;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.AppointmentStatus;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;


import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.DoctorScheduleStatus;

@Service("doctorService")
public class DoctorServiceImpl implements DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorScheduleRepository doctorScheduleRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Override
    @Transactional
    public DoctorDTO createDoctorWithUser(CreateDoctorRequestDTO request) {
        // 1. Create User with DOCTOR role
        UserRegisterDTO userRegisterDTO = new UserRegisterDTO();
        userRegisterDTO.setEmail(request.getEmail());
        userRegisterDTO.setPassword(request.getPassword());
        userRegisterDTO.setFullName(request.getFullName());
        userRegisterDTO.setPhoneNumber(request.getPhoneNumber());
        userRegisterDTO.setRoleName("DOCTOR");
        userRegisterDTO.setBirthday(request.getBirthday());
        userRegisterDTO.setGender(request.getGender());
        userRegisterDTO.setAnonymous(request.isAnonymous());
        
        userService.createUserByAdmin(userRegisterDTO);
        
        // 2. Get created user
        User user = userRepository.findByEmailWithRole(request.getEmail())
                .orElseThrow(() -> new EntityNotFoundException("Failed to create user"));
        
        // 3. Return basic doctor info (without professional details)
        DoctorDTO doctorDTO = new DoctorDTO();
        doctorDTO.setUserId(user.getId());
        doctorDTO.setFullName(user.getFullName());
        doctorDTO.setEmail(user.getEmail());
        doctorDTO.setPhoneNumber(user.getPhoneNumber());
        doctorDTO.setBirthday(user.getBirthday());
        doctorDTO.setGender(user.getGender());
        doctorDTO.setAnonymous(user.getAnonymous());
        
        return doctorDTO;
    }

    @Override
    @Transactional
    public DoctorDTO createDoctorProfile(String email, DoctorProfileDTO profileDTO) {
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        // Kiểm tra xem user có role DOCTOR không
        if (!"DOCTOR".equals(user.getRole().getName())) {
            throw new IllegalArgumentException("Chỉ có thể tạo doctor profile cho user có role DOCTOR");
        }

        // Kiểm tra xem user đã có doctor profile chưa
        if (doctorRepository.findByUserId(user.getId()).isPresent()) {
            throw new IllegalArgumentException("User này đã có doctor profile");
        }

        Doctor doctor = new Doctor();
        doctor.setUser(user);
        doctor.setSpecialty(profileDTO.getSpecialty());
        doctor.setQualifications(profileDTO.getQualifications());
        doctor.setMaxAppointmentsPerDay(profileDTO.getMaxAppointmentsPerDay());

        doctor = doctorRepository.save(doctor);
        return convertToDTO(doctor);
    }

    @Override
    @Transactional
    public DoctorDTO updateDoctorProfile(String email, DoctorProfileDTO profileDTO) {
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));

        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor profile không tồn tại"));

        doctor.setSpecialty(profileDTO.getSpecialty());
        doctor.setQualifications(profileDTO.getQualifications());
        doctor.setMaxAppointmentsPerDay(profileDTO.getMaxAppointmentsPerDay());

        doctor = doctorRepository.save(doctor);
        return convertToDTO(doctor);
    }

    @Override
    public DoctorDTO getDoctorByEmail(String email) {
        User user = userRepository.findByEmailWithRole(email)
                .orElseThrow(() -> new EntityNotFoundException("User không tồn tại"));
        
        Doctor doctor = doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor profile không tồn tại"));
        
        return convertToDTO(doctor);
    }

    @Override
    public List<DoctorDTO> getAllDoctors() {
        return doctorRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DoctorDTO getDoctorById(Integer id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor không tồn tại"));
        return convertToDTO(doctor);
    }

    @Override
    @Transactional
    public void deactivateDoctor(Integer id) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with id: " + id));
        doctor.getUser().setActive(false);
        userRepository.save(doctor.getUser());
    }

    @Override
    public boolean isOwner(Integer doctorId, String email) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor không tồn tại"));
        return doctor.getUser().getEmail().equals(email);
    }

    @Override
    public List<DoctorSchedule> getDoctorSchedule(String email, LocalDate date) {
        Doctor doctor = doctorRepository.findByUserEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with email: " + email));
        if (date != null) {
            return doctorScheduleRepository.findByDoctorIdAndDate(doctor.getId(), date);
        }
        return doctorScheduleRepository.findByDoctorId(doctor.getId());
    }

    @Override
    public List<DoctorSchedule> getDoctorScheduleByStatus(String email, LocalDate date, DoctorScheduleStatus status) {
        Doctor doctor = doctorRepository.findByUserEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with email: " + email));
        if (date != null) {
            // No repository method for doctorId+date+status, so filter in memory
            return doctorScheduleRepository.findByDoctorIdAndDate(doctor.getId(), date)
                    .stream().filter(s -> s.getStatus() == status).collect(Collectors.toList());
        }
        return doctorScheduleRepository.findByDoctorIdAndStatus(doctor.getId(), status);
    }

    @Override
    public DoctorDTO getDoctorByUserId(Integer userId) {
        Doctor doctor = doctorRepository.findByUserId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor profile không tồn tại"));
        return convertToDTO(doctor);
    }

    private DoctorDTO convertToDTO(Doctor doctor) {
        DoctorDTO dto = new DoctorDTO();
        dto.setId(doctor.getId());
        dto.setUserId(doctor.getUser().getId());
        dto.setFullName(doctor.getUser().getFullName());
        dto.setEmail(doctor.getUser().getEmail());
        dto.setPhoneNumber(doctor.getUser().getPhoneNumber());
        dto.setBirthday(doctor.getUser().getBirthday());
        dto.setGender(doctor.getUser().getGender());
        dto.setAnonymous(doctor.getUser().getAnonymous());
        dto.setSpecialty(doctor.getSpecialty());
        dto.setQualifications(doctor.getQualifications());
        dto.setMaxAppointmentsPerDay(doctor.getMaxAppointmentsPerDay());
        return dto;
    }
} 