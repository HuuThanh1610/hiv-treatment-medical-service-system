package com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.service;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.CreateMedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.MedicalServiceDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.medicalservices.dto.UpdateMedicalServiceDTO;

import java.util.List;
 
public interface MedicalServiceService {
    List<MedicalServiceDTO> getAllMedicalServices();
    MedicalServiceDTO getMedicalServiceById(Integer id);
    MedicalServiceDTO createMedicalService(CreateMedicalServiceDTO dto);
    MedicalServiceDTO updateMedicalService(Integer id, UpdateMedicalServiceDTO dto);
    void deleteMedicalService(Integer id);
} 