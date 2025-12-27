package com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.mapper;

import com.group7.hivcare.hivtreatmentmedicalservicesystem.common.entity.PrescriptionHistory;
import com.group7.hivcare.hivtreatmentmedicalservicesystem.treatmenthistory.dto.PrescriptionHistoryDTO;

import java.util.List;

public interface PrescriptionHistoryMapper {
    PrescriptionHistoryDTO toDTO(PrescriptionHistory entity);
    List<PrescriptionHistoryDTO> toDTOList(List<PrescriptionHistory> entities);
} 