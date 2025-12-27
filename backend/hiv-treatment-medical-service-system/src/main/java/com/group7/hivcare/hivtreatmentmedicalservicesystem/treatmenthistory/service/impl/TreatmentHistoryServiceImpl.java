package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service.impl;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PatientTreatmentPlan;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.TreatmentHistory;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.PatientTreatmentPlanRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.repository.TreatmentHistoryRepository;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.TreatmentHistoryDTO;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper.TreatmentHistoryMapper;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.service.TreatmentHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TreatmentHistoryServiceImpl implements TreatmentHistoryService {

    private final TreatmentHistoryRepository treatmentHistoryRepository;
    private final PatientTreatmentPlanRepository treatmentPlanRepository;
    private final TreatmentHistoryMapper mapper;

    @Override
    public List<TreatmentHistoryDTO> getByTreatmentPlanId(Integer treatmentPlanId) {
        List<TreatmentHistory> histories = treatmentHistoryRepository.findByTreatmentPlanIdOrderByStartDateDesc(treatmentPlanId);
        return mapper.toDTOList(histories);
    }

    @Override
    public List<TreatmentHistoryDTO> getByPatientId(Integer patientId) {
        List<TreatmentHistory> histories = treatmentHistoryRepository.findByPatientIdOrderByStartDateDesc(patientId);
        return mapper.toDTOList(histories);
    }

    @Override
    public List<TreatmentHistoryDTO> getByDoctorId(Integer doctorId) {
        List<TreatmentHistory> histories = treatmentHistoryRepository.findByDoctorIdOrderByStartDateDesc(doctorId);
        return mapper.toDTOList(histories);
    }

    @Override
    public List<TreatmentHistoryDTO> getByPatientIdAndDateRange(Integer patientId, LocalDate startDate, LocalDate endDate) {
        List<TreatmentHistory> histories = treatmentHistoryRepository.findByPatientIdAndDateRange(patientId, startDate, endDate);
        return mapper.toDTOList(histories);
    }

    @Override
    public List<TreatmentHistoryDTO> getByProtocolChange(Integer oldProtocolId, Integer newProtocolId) {
        List<TreatmentHistory> histories = treatmentHistoryRepository.findByOldArvProtocolIdOrNewArvProtocolIdOrderByStartDateDesc(oldProtocolId, newProtocolId);
        return mapper.toDTOList(histories);
    }


}