package com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.Patients;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientCreateDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.patient.dto.PatientUpdateDTO;

public interface PatientMapper {
    PatientDTO toDTO(Patients patient);
    Patients fromCreateDTO(PatientCreateDTO dto);
    void updateEntity(Patients patient, PatientUpdateDTO dto);
} 