package com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.*;
import java.util.List;

public interface PatientService {
    PatientDTO getCurrentPatient(String email);
    PatientDTO updateCurrentPatient(String email, PatientUpdateDTO dto);
    PatientDTO updatePregnancyStatus(String email, Boolean isPregnant);
    PatientDTO getPatientById(Integer id);
    PatientDTO updatePatient(Integer id, PatientUpdateDTO dto);
    List<PatientDTO> getAllPatients();
    void deactivatePatient(Integer id);
    PatientDTO createPatient(PatientCreateDTO dto);
} 